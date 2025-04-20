import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./Config/db.js";
import foodRouter from "./Routes/foodRoute.js";
import userRouter from "./Routes/userRoute.js";
import cartRouter from "./Routes/cartRoute.js";
import contactRouter from "./Routes/contactRoute.js";
import orderRouter from "./Routes/orderRoute.js";
import salesRouter from "./Routes/salesRoute.js";
import path from "path";
import ratingRouter from "./Routes/ratingRoute.js";
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Security middleware
app.use(helmet());
app.use(cors({ 
  origin: process.env.FRONTEND_URL || "*",
  credentials: true 
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Connect to the database
connectDB();

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "Uploads")));

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
    timestamp: new Date(),
    version: process.env.npm_package_version
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found"
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});