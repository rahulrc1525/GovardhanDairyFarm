import foodModel from "../models/foodModel.js";
import orderModel from "../models/orderModel.js";

const addRating = async (req, res) => {
  try {
    const { userId, foodId, orderId, rating } = req.body;

    // Enhanced validation
    if (!userId || !foodId || !orderId || rating === undefined) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        missingFields: {
          userId: !userId,
          foodId: !foodId,
          orderId: !orderId,
          rating: rating === undefined
        }
      });
    }

    // Validate rating value
    if (isNaN(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be a number between 1 and 5",
        received: rating
      });
    }

    // Verify the order exists and is delivered
    const order = await orderModel.findOne({
      _id: orderId,
      userId: userId,
      status: "Delivered"
    }).lean();

    if (!order) {
      return res.status(400).json({
        success: false,
        message: "Order not found, not delivered, or doesn't belong to user",
        details: {
          orderExists: !!order,
          isDelivered: order?.status === "Delivered",
          userMatch: order?.userId?.toString() === userId
        }
      });
    }

    // Verify the food item exists in the order
    const foodItemInOrder = order.items.some(item => 
      item._id.toString() === foodId
    );
    
    if (!foodItemInOrder) {
      return res.status(400).json({
        success: false,
        message: "Food item not found in this order",
        orderItems: order.items.map(item => item._id.toString())
      });
    }

    // Check for existing rating
    const food = await foodModel.findById(foodId);
    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Food item not found"
      });
    }

    const existingRating = food.ratings.find(
      r => r.userId.toString() === userId && r.orderId.toString() === orderId
    );

    if (existingRating) {
      return res.status(400).json({
        success: false,
        message: "You have already rated this item from this order",
        existingRating: {
          rating: existingRating.rating,
          createdAt: existingRating.createdAt
        }
      });
    }

    // Add the new rating
    const newRating = {
      userId,
      orderId,
      rating,
      review: req.body.review || ""
    };

    food.ratings.push(newRating);

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
        yourRating: rating
      }
    });

  } catch (error) {
    console.error("Error in addRating:", {
      error: error.message,
      stack: error.stack,
      body: req.body,
      params: req.params
    });
    
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
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