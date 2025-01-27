import foodModel from "../models/foodModel.js";
import fs from "fs";
import path from "path";

const addFood = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "Image is required" });
        }

        console.log("Received data:", req.body);

        let image_filename = req.file.filename;

        const food = new foodModel({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            category: req.body.category,
            image: image_filename,
        });

        await food.save();

        res.json({ success: true, message: "Food Added" });
    } catch (error) {
        console.error("Error adding food:", error);
        res.status(500).json({ success: false, message: "Error adding food", error: error.message });
    }
};

const listFood = async (req, res) => {
    try {
        const { category } = req.query;
        const query = category && category !== "All" ? { category } : {};
        const foods = await foodModel.find(query);

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

export { addFood, listFood, removeFood };
