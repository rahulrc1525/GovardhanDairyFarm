import express from "express";
import authMiddleware from "../middleware/auth.js";
import { placeOrder, verifyPayment } from "../Controllers/orderController.js";

const orderRouter = express.Router();

// Route to place an order (protected by authentication middleware)
orderRouter.post("/place", authMiddleware, placeOrder);

// Route to verify Razorpay payment
orderRouter.post("/verify", verifyPayment);

export default orderRouter;
