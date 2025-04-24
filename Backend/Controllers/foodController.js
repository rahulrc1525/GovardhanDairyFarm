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

// Add to foodController.js
const getRecommendedFood = async (req, res) => {
  try {
    const userId = req.user?.id;

    // Get top clicked foods
    const mostClicked = await foodModel.find()
      .sort({ clicks: -1 })
      .limit(5)
      .select('name categories clicks');

    // Get best selling foods
    const bestSelling = await foodModel.find()
      .sort({ sales: -1 })
      .limit(5)
      .select('name categories sales');

    // Get category-based recommendations
    const userOrders = await orderModel.find({ user: userId })
      .populate('items.food')
      .limit(10);

    const userCategories = [];
    userOrders.forEach(order => {
      order.items.forEach(item => {
        userCategories.push(...item.food.categories);
      });
    });

    const categoryRecommendations = await foodModel.find({
      categories: { $in: [...new Set(userCategories)] }
    }).limit(5);

    // Combine and deduplicate recommendations
    const recommendations = [
      ...mostClicked,
      ...bestSelling,
      ...categoryRecommendations
    ].reduce((acc, current) => {
      const x = acc.find(item => item._id.equals(current._id));
      if (!x) {
        return acc.concat([current]);
      } else {
        return acc;
      }
    }, []).slice(0, 6); // Get top 6 unique recommendations

    res.json({ success: true, data: recommendations });
  } catch (error) {
    console.error("Recommendation error:", error);
    res.status(500).json({ success: false, message: "Error getting recommendations" });
  }
};

// Add to foodController.js
const updateClicks = async (req, res) => {
  try {
    const { id } = req.body;
    await foodModel.findByIdAndUpdate(id, { $inc: { clicks: 1 } });
    res.json({ success: true });
  } catch (error) {
    console.error("Click update error:", error);
    res.status(500).json({ success: false, message: "Error updating clicks" });
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



export { addFood, listFood, removeFood, updateFood, updateClicks, getRecommendedFood };