import express from "express";
import authMiddleware from "../middleware/auth.js";
import { placeOrder, verifyOrder, userOrders, listOrders, updateStatus } from "../Controllers/orderController.js";

const orderRouter = express.Router();

orderRouter.post("/place", authMiddleware, placeOrder);
orderRouter.post("/verify", verifyOrder);
orderRouter.post("/userOrders", authMiddleware, userOrders);

// Ensure only admins can list all orders
orderRouter.post("/listOrders", authMiddleware, async (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Unauthorized" });
  }
  next();
}, listOrders);

orderRouter.post("/updateStatus", authMiddleware, updateStatus);

export default orderRouter;