import foodModel from "../models/foodModel.js";
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

const updateClicks = async (req, res) => {
  try {
    const { id } = req.body;
    const food = await foodModel.findById(id);
    if (!food) {
      return res.status(404).json({ success: false, message: "Food item not found" });
    }
    food.clicks += 1;
    await food.save();
    res.json({ success: true, message: "Clicks updated" });
  } catch (error) {
    console.error("Error updating clicks:", error);
    res.status(500).json({ success: false, message: "Error updating clicks" });
  }
};

const getRecommendedFood = async (req, res) => {
  try {
    const foodItems = await foodModel.find();
    const recommendedFood = foodItems
      .map((item) => {
        const score = item.sales * 0.7 + item.clicks * 0.3; // Assign a weightage of 70% to sales and 30% to clicks
        return { ...item.toObject(), score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    res.json({ success: true, data: recommendedFood });
  } catch (error) {
    console.error("Error getting recommended food:", error);
    res.status(500).json({ success: false, message: "Error getting recommended food" });
  }
};

export { addFood, listFood, removeFood, updateFood, updateClicks, getRecommendedFood };