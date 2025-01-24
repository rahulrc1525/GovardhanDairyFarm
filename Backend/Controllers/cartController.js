import userModel from "../models/userModel.js";

// Add items to user cart
const addToCart = async (req, res) => {
    try {
        const { userId, itemId, quantity = 1 } = req.body;

        if (!userId || !itemId) {
            return res.status(400).json({
                success: false,
                message: "User ID and Item ID are required",
            });
        }

        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const cartData = userData.cartData || { items: [] };
        const itemIndex = cartData.items.findIndex(
            (item) => item.productId?.toString() === itemId
        );

        if (itemIndex >= 0) {
            cartData.items[itemIndex].quantity += quantity;
        } else {
            cartData.items.push({ productId: itemId, quantity });
        }

        await userModel.findByIdAndUpdate(
            userId,
            { cartData },
            { new: true, useFindAndModify: false }
        );

        res.status(200).json({ success: true, message: "Item added to cart successfully" });
    } catch (error) {
        console.error("Error adding to cart:", error);
        res.status(500).json({
            success: false,
            message: "Error adding to cart",
            error: error.message,
        });
    }
};

// Remove items from user cart
const removeFromCart = async (req, res) => {
    try {
        const { userId, itemId, removeAll = false } = req.body;

        if (!userId || !itemId) {
            return res.status(400).json({
                success: false,
                message: "User ID and Item ID are required",
            });
        }

        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const cartData = userData.cartData || { items: [] };
        const itemIndex = cartData.items.findIndex(
            (item) => item.productId?.toString() === itemId
        );

        if (itemIndex >= 0) {
            cartData.items[itemIndex].quantity -= 1;

            if (cartData.items[itemIndex].quantity <= 0) {
                cartData.items.splice(itemIndex, 1);
            }

            await userModel.findByIdAndUpdate(
                userId,
                { cartData },
                { new: true, useFindAndModify: false }
            );

            res.status(200).json({ success: true, message: "Item removed from cart successfully" });
        } else {
            return res.status(404).json({
                success: false,
                message: "Item not found in cart",
            });
        }
    } catch (error) {
        console.error("Error removing from cart:", error);
        res.status(500).json({
            success: false,
            message: "Error removing from cart",
            error: error.message,
        });
    }
};

// Fetch user cart data
const getCart = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required",
            });
        }

        const userData = await userModel
            .findById(userId)
            .populate("cartData.items.productId");

        if (!userData) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.status(200).json({ success: true, cartData: userData.cartData });
    } catch (error) {
        console.error("Error fetching cart data:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching cart data",
            error: error.message,
        });
    }
};

export { addToCart, removeFromCart, getCart };
