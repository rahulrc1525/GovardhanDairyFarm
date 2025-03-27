import foodModel from "../models/foodModel.js";
import orderModel from "../models/orderModel.js";
import mongoose from "mongoose";

const addRating = async (req, res) => {
  try {
    const { foodId, orderId, rating, review } = req.body;
    const userId = req.user.id;

    if (!foodId || !orderId || rating === undefined) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(foodId) || !mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format",
      });
    }

    if (isNaN(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    const order = await orderModel.findOne({
      _id: orderId,
      userId,
      status: "Delivered",
    });

    if (!order) {
      return res.status(400).json({
        success: false,
        message: "Order not found or not delivered",
      });
    }

    const foodItemInOrder = order.items.some(item => item._id.toString() === foodId);
    if (!foodItemInOrder) {
      return res.status(400).json({
        success: false,
        message: "Food item not found in this order",
      });
    }

    const food = await foodModel.findById(foodId);
    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Food item not found",
      });
    }

    const existingRating = food.ratings.find(
      r => r.userId.toString() === userId && r.orderId.toString() === orderId
    );

    if (existingRating) {
      return res.status(400).json({
        success: false,
        message: "You have already rated this item",
      });
    }

    food.ratings.push({
      userId,
      orderId,
      rating,
      review: review || "",
      createdAt: new Date(),
    });

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

    const food = await foodModel.findById(foodId)
      .populate("ratings.userId", "name")
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

    const alreadyRated = food.ratings.some(
      r => r.userId.toString() === userId && r.orderId.toString() === orderId
    );

    res.status(200).json({ success: true, alreadyRated });
  } catch (error) {
    console.error("Error checking rating:", error);
    res.status(500).json({ success: false, message: "Error checking rating" });
  }
};

export { addRating, getFoodRatings, checkRating };