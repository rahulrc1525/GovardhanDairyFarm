import foodModel from "../models/foodModel.js";
import orderModel from "../models/orderModel.js";
import mongoose from "mongoose";

const addOrUpdateRating = async (req, res) => {
    try {
        const { foodId, orderId, rating, review = "" } = req.body;
        const userId = req.user.id;

        // Validate required fields
        if (!foodId || !orderId || rating === undefined) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields",
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
            item._id.toString() === foodId
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

        const ratingData = {
            userId,
            orderId,
            rating,
            review: review.trim(),
            createdAt: new Date(),
            updatedAt: new Date()
        };

        if (existingRatingIndex === -1) {
            food.ratings.push(ratingData);
        } else {
            food.ratings[existingRatingIndex] = ratingData;
        }

        // Recalculate average rating
        const totalRatings = food.ratings.length;
        const sumRatings = food.ratings.reduce((sum, r) => sum + r.rating, 0);
        food.averageRating = totalRatings > 0 ? parseFloat((sumRatings / totalRatings).toFixed(1)) : 0;

        await food.save();

        return res.status(200).json({
            success: true,
            message: "Rating submitted successfully",
            data: {
                foodId: food._id,
                averageRating: food.averageRating,
                totalRatings: food.ratings.length,
            },
        });

    } catch (error) {
        console.error("Error in addOrUpdateRating:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
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
            .select('ratings name averageRating');

        if (!food) {
            return res.status(404).json({
                success: false,
                message: "Food item not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                foodId: food._id,
                foodName: food.name,
                averageRating: food.averageRating,
                totalRatings: food.ratings.length,
                ratings: food.ratings
            },
        });

    } catch (error) {
        console.error("Error getting food ratings:", error);
        return res.status(500).json({
            success: false,
            message: "Error getting food ratings",
        });
    }
};

export { 
    addOrUpdateRating as addRating, 
    getFoodRatings
};