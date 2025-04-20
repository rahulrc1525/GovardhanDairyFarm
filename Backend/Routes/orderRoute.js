import express from "express";
import authMiddleware from "../middleware/auth.js";
import adminMiddleware from "../middleware/admin.js";
import { 
  placeOrder, 
  verifyOrder, 
  userOrders, 
  listOrders, 
  updateStatus,
  deleteOrder,
  handleWebhookEvent
} from "../Controllers/orderController.js";

const orderRouter = express.Router();

// User routes
orderRouter.post("/place", authMiddleware, placeOrder);
orderRouter.post("/verify", verifyOrder);
orderRouter.get("/user", authMiddleware, userOrders); // Changed from POST to GET
orderRouter.post("/delete", authMiddleware, deleteOrder);

// Admin routes
orderRouter.get("/list", authMiddleware, adminMiddleware, listOrders);
orderRouter.post("/status", authMiddleware, adminMiddleware, updateStatus);

// Webhook (no auth needed)
orderRouter.post("/webhook", express.raw({ type: 'application/json' }), handleWebhookEvent);

export default orderRouter;