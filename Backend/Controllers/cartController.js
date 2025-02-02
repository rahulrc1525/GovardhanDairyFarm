import userModel from "../models/userModel.js";

// Add items to user cart
const addToCart = async (req, res) => {
  try {
    const { userId, itemId } = req.body;

    // Validate inputs
    if (!userId || !itemId) {
      return res.status(400).json({ success: false, message: "Missing userId or itemId" });
    }

    // Increment the item count in the cart
    const user = await userModel.findByIdAndUpdate(
      userId,
      { $inc: { [`cartData.${itemId}`]: 1 } }, // Use atomic update to increment item count
      { new: true, upsert: true } // Create cartData field if it doesn't exist
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, message: "Item added to cart", cartData: user.cartData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Remove items from user cart
const removeFromCart = async (req, res) => {
  try {
    const { userId, itemId } = req.body;

    // Validate inputs
    if (!userId || !itemId) {
      return res.status(400).json({ success: false, message: "Missing userId or itemId" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const cartData = user.cartData || {};
    if (cartData[itemId] && cartData[itemId] > 0) {
      cartData[itemId] -= 1;

      // Remove item if count reaches 0
      if (cartData[itemId] === 0) {
        delete cartData[itemId];
      }

      await userModel.findByIdAndUpdate(userId, { cartData });
      return res.json({ success: true, message: "Item removed from cart", cartData });
    } else {
      return res.status(400).json({ success: false, message: "Item not found in cart or already zero" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Fetch user cart data
const getCart = async (req, res) => {
  try {
    const { userId } = req.body;

    // Validate inputs
    if (!userId) {
      return res.status(400).json({ success: false, message: "Missing userId" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, cartData: user.cartData || {} });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export { addToCart, removeFromCart, getCart };
