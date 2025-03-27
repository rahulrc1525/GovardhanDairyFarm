import foodModel from "../models/foodModel.js";
import orderModel from "../models/orderModel.js";
import mongoose from "mongoose";

const addOrUpdateRating = async (req, res) => {
  try {
    const { foodId, orderId, rating, review } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!foodId || !orderId || rating === undefined) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: foodId, orderId, and rating are required",
      });
    }

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(foodId) || !mongoose.Types.ObjectId.isValid(orderId)) {
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

    // Check if order exists and is delivered
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

    // Check if food item exists in the order
    const foodItemInOrder = order.items.some(item => 
      item._id.toString() === foodId || 
      (item._id && item._id.toString() === foodId)
    );

    if (!foodItemInOrder) {
      return res.status(400).json({
        success: false,
        message: "Food item not found in this order",
      });
    }

    // Find the food item
    const food = await foodModel.findById(foodId);
    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Food item not found",
      });
    }

    // Check for existing rating
    const existingRatingIndex = food.ratings.findIndex(
      r => r.userId.toString() === userId && r.orderId.toString() === orderId
    );

    const newRating = {
      userId,
      orderId,
      rating,
      review: review || "",
      createdAt: existingRatingIndex === -1 ? new Date() : food.ratings[existingRatingIndex].createdAt,
      updatedAt: new Date()
    };

    if (existingRatingIndex === -1) {
      // Add new rating
      food.ratings.push(newRating);
    } else {
      // Update existing rating
      food.ratings[existingRatingIndex] = newRating;
    }

    // Calculate new average rating
    const totalRatings = food.ratings.length;
    const sumRatings = food.ratings.reduce((sum, r) => sum + r.rating, 0);
    food.averageRating = parseFloat((sumRatings / totalRatings).toFixed(1));

    await food.save();

    return res.status(201).json({
      success: true,
      message: existingRatingIndex === -1 ? "Rating submitted successfully" : "Rating updated successfully",
      data: {
        averageRating: food.averageRating,
        totalRatings: food.ratings.length,
        userRating: newRating,
        isUpdate: existingRatingIndex !== -1
      },
    });
  } catch (error) {
    console.error("Error in addOrUpdateRating:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getUserRating = async (req, res) => {
  try {
    const { foodId, orderId } = req.query;
    const userId = req.user.id;

    if (!foodId || !orderId) {
      return res.status(400).json({
        success: false,
        message: "Food ID and Order ID are required"
      });
    }

    const food = await foodModel.findOne({
      _id: foodId,
      'ratings.userId': userId,
      'ratings.orderId': orderId
    });

    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Rating not found",
      });
    }

    const userRating = food.ratings.find(
      r => r.userId.toString() === userId && r.orderId.toString() === orderId
    );

    res.status(200).json({ 
      success: true, 
      data: userRating
    });
  } catch (error) {
    console.error("Error getting user rating:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error getting user rating",
      error: error.message 
    });
  }
};


export { addOrUpdateRating as addRating, getFoodRatings, getUserRating };

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
      .populate("ratings.userId", "name email")
      .populate("ratings.orderId", "createdAt");

    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Food item not found",
      });
    }

    // Sort ratings by date (newest first)
    const sortedRatings = food.ratings.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    return res.status(200).json({
      success: true,
      data: {
        ratings: sortedRatings,
        averageRating: food.averageRating,
        totalRatings: food.ratings.length,
      },
    });
  } catch (error) {
    console.error("Error in getFoodRatings:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const checkRating = async (req, res) => {
  try {
    const { foodId, orderId } = req.query;
    const userId = req.user.id;

    if (!foodId || !orderId) {
      return res.status(400).json({
        success: false,
        message: "Food ID and Order ID are required"
      });
    }

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

    res.status(200).json({ 
      success: true, 
      alreadyRated,
      canRate: !alreadyRated
    });
  } catch (error) {
    console.error("Error checking rating:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error checking rating",
      error: error.message 
    });
  }
};

export { addOrUpdateRating as addRating, getFoodRatings, getUserRating };
