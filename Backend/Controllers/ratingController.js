import foodModel from "../models/foodModel.js";
import orderModel from "../models/orderModel.js";
import mongoose from "mongoose";

const addRating = async (req, res) => {
  try {
    const { userId, foodId, orderId, rating } = req.body;

    // Validate required fields
    if (!userId || !foodId || !orderId || rating === undefined) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        missingFields: {
          userId: !userId,
          foodId: !foodId,
          orderId: !orderId,
          rating: rating === undefined,
        },
      });
    }

    // Validate ObjectId formats
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(foodId) ||
      !mongoose.Types.ObjectId.isValid(orderId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format",
        invalidIds: {
          userId: !mongoose.Types.ObjectId.isValid(userId),
          foodId: !mongoose.Types.ObjectId.isValid(foodId),
          orderId: !mongoose.Types.ObjectId.isValid(orderId),
        },
      });
    }

    // Convert to ObjectIds for consistent comparison
    const userIdObj = new mongoose.Types.ObjectId(userId);
    const foodIdObj = new mongoose.Types.ObjectId(foodId);
    const orderIdObj = new mongoose.Types.ObjectId(orderId);

    // Validate rating value
    if (isNaN(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be a number between 1 and 5",
        received: rating,
      });
    }

    // Verify the order exists, is delivered, and belongs to user
    const order = await orderModel.findOne({
      _id: orderIdObj,
      userId: userIdObj,
      status: "Delivered",
    }).lean();

    if (!order) {
      return res.status(400).json({
        success: false,
        message: "Order not found, not delivered, or doesn't belong to user",
      });
    }

    // Verify the food item exists in the order with safe comparison
    const foodItemInOrder = order.items.some(
      (item) => item && item._id && item._id.toString() === foodIdObj.toString()
    );

    if (!foodItemInOrder) {
      return res.status(400).json({
        success: false,
        message: "Food item not found in this order",
        orderItems: order.items.map((item) => item._id.toString()),
      });
    }

    // Check for existing rating with safe comparison
    const food = await foodModel.findById(foodIdObj);

    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Food item not found",
      });
    }

    const existingRating = food.ratings.find(
      (r) =>
        r.userId && r.userId.equals(userIdObj) && r.orderId && r.orderId.equals(orderIdObj)
    );

    if (existingRating) {
      return res.status(400).json({
        success: false,
        message: "You have already rated this item from this order",
        existingRating: {
          rating: existingRating.rating,
          createdAt: existingRating.createdAt,
        },
      });
    }

    // Add the new rating with proper ObjectIds
    food.ratings.push({
      userId: userIdObj,
      orderId: orderIdObj,
      rating,
      review: req.body.review || "",
      createdAt: new Date(),
    });

    // Recalculate average
    const totalRatings = food.ratings.length;
    const sumRatings = food.ratings.reduce((sum, r) => sum + r.rating, 0);
    food.averageRating = sumRatings / totalRatings;

    await food.save();

    return res.status(201).json({
      success: true,
      message: "Rating submitted successfully",
      data: {
        averageRating: food.averageRating,
        totalRatings: food.ratings.length,
        yourRating: rating,
      },
    });
  } catch (error) {
    console.error("Error in addRating:", {
      error: error.message,
      stack: error.stack,
      body: req.body,
      params: req.params,
    });
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getFoodRatings = async (req, res) => {
  try {
    const { foodId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(foodId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid food ID format",
      });
    }

    const food = await foodModel
      .findById(foodId)
      .populate("ratings.userId", "name email")
      .populate("ratings.orderId", "createdAt");

    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Food item not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        ratings: food.ratings,
        averageRating: food.averageRating,
        totalRatings: food.ratings.length,
      },
    });
  } catch (error) {
    console.error("Error in getFoodRatings:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export { addRating, getFoodRatings };
