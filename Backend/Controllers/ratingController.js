import foodModel from "../models/foodModel.js";
import orderModel from "../models/orderModel.js";

const addRating = async (req, res) => {
  try {
    const { userId, foodId, orderId, rating } = req.body;

    // Validate required fields
    if (!userId || !foodId || !orderId || rating === undefined) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: userId, foodId, orderId, or rating"
      });
    }

    // Validate rating value
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5"
      });
    }

    // Verify the order exists and is delivered
    const order = await orderModel.findOne({
      _id: orderId,
      userId: userId,
      status: "Delivered"
    });

    if (!order) {
      return res.status(400).json({
        success: false,
        message: "Order not found or not delivered"
      });
    }

    // Verify the food item exists in the order
    const foodItemInOrder = order.items.some(item => item._id.toString() === foodId);
    if (!foodItemInOrder) {
      return res.status(400).json({
        success: false,
        message: "Food item not found in this order"
      });
    }

    // Check if user already rated this item in this order
    const food = await foodModel.findById(foodId);
    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Food item not found"
      });
    }

    const existingRatingIndex = food.ratings.findIndex(
      r => r.userId.toString() === userId && r.orderId.toString() === orderId
    );

    if (existingRatingIndex !== -1) {
      return res.status(400).json({
        success: false,
        message: "You have already rated this item from this order"
      });
    }

    // Add the new rating
    food.ratings.push({
      userId,
      orderId,
      rating,
      review: req.body.review || ""
    });

    // Calculate new average rating
    const totalRatings = food.ratings.length;
    const sumRatings = food.ratings.reduce((sum, r) => sum + r.rating, 0);
    food.averageRating = sumRatings / totalRatings;

    await food.save();

    return res.status(201).json({
      success: true,
      message: "Rating submitted successfully",
      data: {
        averageRating: food.averageRating,
        totalRatings: food.ratings.length
      }
    });

  } catch (error) {
    console.error("Error in addRating:", {
      error: error.message,
      stack: error.stack,
      body: req.body
    });
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

    const food = await foodModel.findById(foodId)
      .populate('ratings.userId', 'name email')
      .populate('ratings.orderId', 'createdAt');

    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Food item not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        ratings: food.ratings,
        averageRating: food.averageRating,
        totalRatings: food.ratings.length
      }
    });

  } catch (error) {
    console.error("Error in getFoodRatings:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

export { addRating, getFoodRatings };