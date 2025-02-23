import express from "express";
import { addToCart, removeFromCart, getCart, clearCart } from "../Controllers/cartController.js";
import authMiddleware from "../middleware/auth.js";

const cartRouter = express.Router();

cartRouter.post("/add", authMiddleware, addToCart);
cartRouter.post("/remove", authMiddleware, removeFromCart);
cartRouter.post("/get", authMiddleware, getCart);
cartRouter.post("/clear", authMiddleware, clearCart); // Add this line

export default cartRouter;