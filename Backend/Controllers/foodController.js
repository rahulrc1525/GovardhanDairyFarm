import foodModel from "../models/foodModel.js";
import orderModel from "../models/orderModel.js";
import cloudinary from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Other functions unchanged...

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
    const userOrders = await orderModel.find({ userId: userId }) // Fixed field name
      .populate('items._id') // populate food items
      .limit(10);

    const userCategories = [];
    userOrders.forEach(order => {
      order.items.forEach(item => {
        if (item._id && item._id.categories) {
          userCategories.push(...item._id.categories);
        }
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

export { getRecommendedFood /* other exports unchanged */ };
