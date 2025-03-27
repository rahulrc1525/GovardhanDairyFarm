import foodModel from "../models/foodModel.js";
import orderModel from "../models/orderModel.js";

const addRating = async (req, res) => {
  try {
    const { userId, foodId, orderId, rating, review } = req.body;

    // Input validation
    if (!userId || !foodId || !orderId || !rating) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5"
      });
    }

    // Verify order and delivery status
    const order = await orderModel.findOne({
      _id: orderId,
      userId,
      status: "Delivered",
      "items._id": foodId
    });

    if (!order) {
      return res.status(400).json({ 
        success: false, 
        message: "You can only rate delivered items you've purchased" 
      });
    }

    // Check for existing rating
    const food = await foodModel.findById(foodId);
    const existingRating = food.ratings.find(r => 
      r.userId.toString() === userId.toString() && 
      r.orderId.toString() === orderId.toString()
    );

    if (existingRating) {
      return res.status(400).json({ 
        success: false, 
        message: "You've already rated this item from this order" 
      });
    }

    // Add the new rating
    food.ratings.push({ userId, orderId, rating, review });
    
    // Calculate new average rating
    const totalRatings = food.ratings.length;
    const sumRatings = food.ratings.reduce((sum, r) => sum + r.rating, 0);
    food.averageRating = sumRatings / totalRatings;
    
    await food.save();

    res.status(201).json({ 
      success: true, 
      message: "Rating submitted successfully",
      averageRating: food.averageRating,
      ratings: food.ratings
    });
  } catch (error) {
    console.error("Error adding rating:", {
      error: error.message,
      stack: error.stack,
      body: req.body
    });
    res.status(500).json({ 
      success: false, 
      message: "Error adding rating",
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

    res.status(200).json({ 
      success: true, 
      ratings: food.ratings,
      averageRating: food.averageRating
    });
  } catch (error) {
    console.error("Error fetching ratings:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching ratings",
      error: error.message 
    });
  }
};

export { addRating, getFoodRatings };