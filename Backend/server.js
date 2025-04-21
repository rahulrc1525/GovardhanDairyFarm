import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./Config/db.js";
import foodRouter from "./Routes/foodRoute.js";
import userRouter from "./Routes/userRoute.js";
import cartRouter from "./Routes/cartRoute.js";
import contactRouter from "./Routes/contactRoute.js";
import orderRouter from "./Routes/orderRoute.js";
import { handleWebhookEvent } from "./Controllers/orderController.js";
import salesRouter from "./Routes/salesRoute.js";
import path from "path";
import ratingRouter from "./Routes/ratingRoute.js";
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: "*" }));

// Connect to the database
connectDB();

// Serve static files
app.use("/images", express.static(path.join(__dirname, "Uploads")));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// API endpoints
app.use("/api/food", foodRouter);
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/contact", contactRouter);
app.use("/api/order", orderRouter);
app.use("/api/sales", salesRouter);
app.use("/api/rating", ratingRouter);
app.post("/api/order/webhook", express.raw({ type: 'application/json' }), handleWebhookEvent);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: "Internal Server Error",
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Health check
app.get("/", (req, res) => {
  res.json({ 
    success: true,
    message: "API is working",
    timestamp: new Date() 
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 