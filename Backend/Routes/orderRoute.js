import express from "express";
import authMiddleware from "../middleware/auth.js";
import { placeOrder, verifyOrder,userOrders, listOrders, updateStatus, } from "../Controllers/orderController.js";

const orderRouter = express.Router();

// Route to place an order (protected by authentication middleware)
orderRouter.post("/place", authMiddleware, placeOrder);

// Route to verify Razorpay payment
orderRouter.post("/verify", verifyOrder);
orderRouter.post("/userOrders", authMiddleware, userOrders);
orderRouter.post("/listOrders", authMiddleware, listOrders);
orderRouter.post("/updateStatus", authMiddleware, updateStatus);


export default orderRouter;
