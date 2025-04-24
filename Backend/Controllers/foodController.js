import foodModel from "../models/foodModel.js";
import orderModel from "../models/orderModel.js"; // Add missing import

import cloudinary from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const addFood = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Image is required" });
    }

    // Upload image to Cloudinary
    const result = await cloudinary.v2.uploader.upload(req.file.path, {
      folder: "food_items", // Optional: Organize images into a folder
    });

    const categories = req.body.categories.split(","); // Convert categories to an array

    const food = new foodModel({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      categories: categories,
      image: result.secure_url, // Store the Cloudinary image URL
    });

    await food.save();
    res.json({ success: true, message: "Food item added successfully" });
  } catch (error) {
    console.error("Error adding food:", error);
    res.status(500).json({ success: false, message: "Error adding food", error: error.message });
  }
};

// Rest of the code remains the same...

const listFood = async (req, res) => {
  try {
    const foods = await foodModel.find();
    res.json({ success: true, data: foods });
  } catch (error) {
    console.log("Error fetching food items:", error);
    res.status(500).json({ success: false, message: "Error fetching food items" });
  }
};

const removeFood = async (req, res) => {
  try {
    const { id } = req.body;
    console.log("Deleting food item with ID:", id); // Debug log

    const food = await foodModel.findById(id);
    if (!food) {
      return res.status(404).json({ success: false, message: "Food item not found" });
    }

    // If using Cloudinary, delete the image from Cloudinary
    if (food.image) {
      const publicId = food.image.split("/").pop().split(".")[0]; // Extract public ID from URL
      await cloudinary.v2.uploader.destroy(`food_items/${publicId}`);
    }

    await foodModel.findByIdAndDelete(id);
    res.json({ success: true, message: "Food Removed" });
  } catch (error) {
    console.error("Error removing food:", error);
    res.status(500).json({ success: false, message: "Error removing food", error: error.message });
  }
};

// Add to foodController.js


const getRecommendedFood = async (req, res) => {
  try {
    const userId = req.user?.id;
    let recommendations = [];

    // 1. Get Most Clicked Items (Top 5)
    const mostClicked = await foodModel.find()
      .sort({ clicks: -1 })
      .limit(5);

    // 2. Get Best Selling Items (Top 5)
    const bestSelling = await foodModel.find()
      .sort({ sales: -1 })
      .limit(5);

    // 3. Get Category-based Recommendations
    let categoryRecommendations = [];
    if (userId) {
      const userOrders = await orderModel.find({ user: userId })
        .populate({
          path: 'items._id',
          model: 'food'
        })
        .limit(10);

      // Extract unique categories
      const userCategories = [];
      userOrders.forEach(order => {
        order.items.forEach(item => {
          if (item._id?.categories) {
            userCategories.push(...item._id.categories);
          }
        });
      });

      if (userCategories.length > 0) {
        const uniqueCategories = [...new Set(userCategories)];
        categoryRecommendations = await foodModel.find({
          categories: { $in: uniqueCategories }
        }).limit(5);
      }
    }

    // 4. Combine recommendations
    recommendations = [
      ...mostClicked,
      ...bestSelling,
      ...categoryRecommendations
    ].reduce((acc, current) => {
      const exists = acc.find(item => item._id.equals(current._id));
      return exists ? acc : [...acc, current];
    }, []);

    // 5. Add Random Fallback
    if (recommendations.length < 6) {
      const needed = 6 - recommendations.length;
      const randomFoods = await foodModel.aggregate([
        { $match: { _id: { $nin: recommendations.map(f => f._id) } } },
        { $sample: { size: needed } }
      ]);
      recommendations.push(...randomFoods);
    }

    // Limit to 6 items
    recommendations = recommendations.slice(0, 6);

    res.json({ success: true, data: recommendations });
  } catch (error) {
    console.error("Recommendation error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error getting recommendations",
      error: error.message 
    });
  }
};


const updateFood = async (req, res) => {
  try {
    const { id, name, description, price, categories } = req.body;
    const food = await foodModel.findByIdAndUpdate(
      id,
      { name, description, price, categories: categories.split(",") }, // Convert categories to array
      { new: true }
    );
    if (!food) {
      return res.status(404).json({ success: false, message: "Food item not found" });
    }
    res.json({ success: true, message: "Food updated successfully", data: food });
  } catch (error) {
    console.error("Error updating food:", error);
    res.status(500).json({ success: false, message: "Error updating food", error: error.message });
  }
};



export { addFood, listFood, removeFood, updateFood, getRecommendedFood };