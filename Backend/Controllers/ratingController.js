import foodModel from "../models/foodModel.js";
import orderModel from "../models/orderModel.js";
import mongoose from "mongoose";

const addRating = async (req, res) => {
  try {
    const { foodId, orderId, rating, review } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!foodId || !orderId || rating === undefined) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields (foodId, orderId, rating)",
      });
    }

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(foodId) || 
        !mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format",
      });
    }

    // Validate rating value
    if (isNaN(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    // Verify the order exists and belongs to the user
    const order = await orderModel.findOne({
      _id: orderId,
      userId,
      status: "Delivered",
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found or not delivered",
      });
    }

    // Verify the food item exists in the order
    const foodItemInOrder = order.items.some(item => 
      item._id.toString() === foodId.toString()
    );

    if (!foodItemInOrder) {
      return res.status(400).json({
        success: false,
        message: "Food item not found in this order",
      });
    }

    // Check for existing rating
    const food = await foodModel.findById(foodId);
    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Food item not found",
      });
    }

    const existingRating = food.ratings.find(r => 
      r.userId.toString() === userId.toString() && 
      r.orderId.toString() === orderId.toString()
    );

    if (existingRating) {
      return res.status(400).json({
        success: false,
        message: "You have already rated this item",
      });
    }

    // Add the new rating
    const newRating = {
      userId,
      orderId,
      rating,
      review: review || "",
      createdAt: new Date(),
    };

    food.ratings.push(newRating);

    // Recalculate average rating
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
      },
    });
  } catch (error) {
    console.error("Error in addRating:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const checkRating = async (req, res) => {
  try {
    const { foodId, orderId } = req.query;
    const userId = req.user.id;

    const food = await foodModel.findById(foodId);
    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Food item not found",
      });
    }

    const alreadyRated = food.ratings.some(r => 
      r.userId.toString() === userId.toString() && 
      r.orderId.toString() === orderId.toString()
    );

    res.status(200).json({ success: true, alreadyRated });
  } catch (error) {
    console.error("Error checking rating:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error checking rating" 
    });
  }
};

export { addRating, checkRating };