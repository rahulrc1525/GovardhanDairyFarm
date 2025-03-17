import foodModel from "../models/foodModel.js";
import fs from "fs";
import path from "path";

const addFood = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Image is required" });
    }

    let image_filename = req.file.filename;
    const categories = req.body.categories.split(","); // Convert categories to an array

    const food = new foodModel({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      categories: categories,
      image: image_filename,
    });

    await food.save();
    res.json({ success: true, message: "Food item added successfully" });
  } catch (error) {
    console.error("Error adding food:", error);
    res.status(500).json({ success: false, message: "Error adding food", error: error.message });
  }
};

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
    const food = await foodModel.findById(req.body.id);
    if (!food) {
      return res.status(404).json({ success: false, message: "Food item not found" });
    }

    const imagePath = path.resolve("Uploads", food.image);
    fs.unlink(imagePath, (err) => {
      if (err) console.error("Error deleting image file:", err);
    });

    await foodModel.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Food Removed" });
  } catch (error) {
    console.log("Error removing food:", error);
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