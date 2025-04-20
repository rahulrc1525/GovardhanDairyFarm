import foodModel from "../models/foodModel.js";
import orderModel from "../models/orderModel.js";
import mongoose from "mongoose";

/**
 * @desc    Add or update a rating for a food item from an order
 * @route   POST /api/rating/add
 * @access  Private
 */
const addOrUpdateRating = async (req, res) => {
    try {
      const { foodId, orderId, rating, review = "" } = req.body;
      const userId = req.user.id;
  
      // Validate required fields
      if (!foodId || !orderId || rating === undefined) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: foodId, orderId, and rating are required",
        });
      }
  
      // Validate ID formats
      if (!mongoose.Types.ObjectId.isValid(foodId) || !mongoose.Types.ObjectId.isValid(orderId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid ID format",
        });
      }
  
      // Validate rating range
      if (isNaN(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: "Rating must be between 1 and 5",
        });
      }
  
      // Validate review length
      if (review.length > 500) {
        return res.status(400).json({
          success: false,
          message: "Review cannot exceed 500 characters",
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
          message: "Order not found or not eligible for rating",
        });
      }
  
      // Verify food item exists in the order
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
  
      // Prepare rating data
      const ratingData = {
        userId,
        orderId,
        rating,
        review: review.trim(),
        createdAt: existingRatingIndex === -1 ? new Date() : food.ratings[existingRatingIndex].createdAt,
        updatedAt: new Date()
      };
  
      // Update or add rating
      if (existingRatingIndex === -1) {
        food.ratings.push(ratingData);
      } else {
        food.ratings[existingRatingIndex] = ratingData;
      }
  
      // Recalculate average rating
      const totalRatings = food.ratings.length;
      const sumRatings = food.ratings.reduce((sum, r) => sum + r.rating, 0);
      food.averageRating = parseFloat((sumRatings / totalRatings).toFixed(1));
  
      await food.save();
  
      return res.status(200).json({
        success: true,
        message: existingRatingIndex === -1 ? "Rating submitted successfully" : "Rating updated successfully",
        data: {
          foodId: food._id,
          foodName: food.name,
          averageRating: food.averageRating,
          totalRatings: food.ratings.length,
          userRating: ratingData,
          isUpdate: existingRatingIndex !== -1
        },
      });
  
    } catch (error) {
      console.error("Error in addOrUpdateRating:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: process.env.NODE_ENV === 'development' ? {
          message: error.message,
          stack: error.stack
        } : undefined
      });
    }
  };
  

/**
 * @desc    Get a user's specific rating for a food item from an order
 * @route   GET /api/rating/user-rating
 * @access  Private
 */
const getUserRating = async (req, res) => {
    try {
        const { foodId, orderId } = req.query;
        const userId = req.user.id;

        // Validate required fields
        if (!foodId || !orderId) {
            return res.status(400).json({
                success: false,
                message: "Food ID and Order ID are required"
            });
        }

        // Validate ID formats
        if (!mongoose.Types.ObjectId.isValid(foodId) || !mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid ID format",
            });
        }

        // Find the food item
        const food = await foodModel.findById(foodId).select('ratings name');

        if (!food) {
            return res.status(404).json({
                success: false,
                message: "Food item not found",
            });
        }

        // Find the user's rating
        const userRating = food.ratings.find(
            r => r.userId.toString() === userId && r.orderId.toString() === orderId
        );

        if (!userRating) {
            return res.status(404).json({
                success: false,
                message: "Rating not found",
            });
        }

        return res.status(200).json({ 
            success: true, 
            data: {
                foodId: food._id,
                foodName: food.name,
                rating: userRating
            }
        });

    } catch (error) {
        console.error("Error getting user rating:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Error getting user rating",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * @desc    Get all ratings for a specific food item
 * @route   GET /api/rating/:foodId
 * @access  Public
 */
const getFoodRatings = async (req, res) => {
    try {
        const { foodId } = req.params;

        // Validate ID format
        if (!mongoose.Types.ObjectId.isValid(foodId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid food ID format",
            });
        }

        // Find the food item with populated ratings
        const food = await foodModel.findById(foodId)
            .populate("ratings.userId", "name email avatar")
            .populate("ratings.orderId", "createdAt")
            .select('ratings name averageRating');

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
                foodId: food._id,
                foodName: food.name,
                averageRating: food.averageRating,
                totalRatings: food.ratings.length,
                ratings: sortedRatings
            },
        });

    } catch (error) {
        console.error("Error getting food ratings:", error);
        return res.status(500).json({
            success: false,
            message: "Error getting food ratings",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * @desc    Check if a user can rate a food item from an order
 * @route   GET /api/rating/check-eligibility
 * @access  Private
 */
const checkRatingEligibility = async (req, res) => {
    try {
        const { foodId, orderId } = req.query;
        const userId = req.user.id;

        // Validate required fields
        if (!foodId || !orderId) {
            return res.status(400).json({
                success: false,
                message: "Food ID and Order ID are required"
            });
        }

        // Check if order exists and is delivered
        const order = await orderModel.findOne({
            _id: orderId,
            userId,
            status: "Delivered",
        });

        if (!order) {
            return res.status(200).json({
                success: true,
                canRate: false,
                reason: "Order not found or not delivered"
            });
        }

        // Check if food item exists in the order
        const foodItemInOrder = order.items.some(item => 
            item._id.toString() === foodId
        );

        if (!foodItemInOrder) {
            return res.status(200).json({
                success: true,
                canRate: false,
                reason: "Food item not found in this order"
            });
        }

        // Check if rating already exists
        const food = await foodModel.findOne({
            _id: foodId,
            'ratings.userId': userId,
            'ratings.orderId': orderId
        });

        return res.status(200).json({
            success: true,
            canRate: true,
            hasExistingRating: !!food,
            orderDelivered: true
        });

    } catch (error) {
        console.error("Error checking rating eligibility:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Error checking rating eligibility",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export { 
    addOrUpdateRating as addRating, 
    getUserRating, 
    getFoodRatings, 
    checkRatingEligibility 
};