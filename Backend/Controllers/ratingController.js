import foodModel from "../models/foodModel.js";
import orderModel from "../models/orderModel.js";

const addRating = async (req, res) => {
  try {
    const { userId, foodId, orderId, rating, review } = req.body;

    // Verify that the user has purchased this food item in the specified order
    const order = await orderModel.findOne({
      _id: orderId,
      userId,
      status: "Delivered",
      "items._id": foodId
    });

    if (!order) {
      return res.status(400).json({ 
        success: false, 
        message: "You can only rate items you've purchased that have been delivered" 
      });
    }

    // Check if user already rated this item in this order
    const food = await foodModel.findById(foodId);
    const existingRating = food.ratings.find(r => 
      r.userId.toString() === userId && 
      order.items.some(item => item._id.toString() === foodId)
    );

    if (existingRating) {
      return res.status(400).json({ 
        success: false, 
        message: "You've already rated this item from this order" 
      });
    }

    // Add the rating
    food.ratings.push({ userId, rating, review });
    await food.save();

    res.status(201).json({ 
      success: true, 
      message: "Rating submitted successfully",
      averageRating: food.averageRating
    });
  } catch (error) {
    console.error("Error adding rating:", error);
    res.status(500).json({ success: false, message: "Error adding rating" });
  }
};

const getFoodRatings = async (req, res) => {
  try {
    const { foodId } = req.params;
    const food = await foodModel.findById(foodId)
      .populate('ratings.userId', 'name');

    if (!food) {
      return res.status(404).json({ success: false, message: "Food item not found" });
    }

    res.status(200).json({ 
      success: true, 
      ratings: food.ratings,
      averageRating: food.averageRating
    });
  } catch (error) {
    console.error("Error fetching ratings:", error);
    res.status(500).json({ success: false, message: "Error fetching ratings" });
  }
};

export { addRating, getFoodRatings };