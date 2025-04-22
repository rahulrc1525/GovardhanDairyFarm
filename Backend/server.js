import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { connectDB } from "./Config/db.js";
import foodRouter from "./Routes/foodRoute.js";
import userRouter from "./Routes/userRoute.js";
import cartRouter from "./Routes/cartRoute.js";
import contactRouter from "./Routes/contactRoute.js";
import orderRouter from "./Routes/orderRoute.js";
import { handleWebhookEvent } from "./Controllers/orderController.js";
import salesRouter from "./Routes/salesRoute.js";
import ratingRouter from "./Routes/ratingRoute.js";
import path from "path";
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const port = process.env.PORT || 4000;

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure CORS with allowed origins
const allowedOrigins = [
  "https://govardhandairyfarm-admin.onrender.com",
  "https://govardhandairyfarm.shop",
  "https://govardhandairyfarm.onrender.com",
  "http://localhost:3000" // For local development
];

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enhanced CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `CORS policy: ${origin} not allowed`;
      console.warn(msg);
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200 // For legacy browser support
}));

// Security middleware
app.use(helmet());
app.disable("x-powered-by");

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
  message: "Too many requests from this IP, please try again later"
});
app.use(limiter);

// Connect to database
connectDB();

// Serve static files
app.use("/images", express.static(path.join(__dirname, "Uploads")));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

// API routes
app.use("/api/food", foodRouter);
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/contact", contactRouter);
app.use("/api/order", orderRouter);
app.use("/api/sales", salesRouter);
app.use("/api/rating", ratingRouter);
app.post("/api/order/webhook", express.raw({ type: 'application/json' }), handleWebhookEvent);

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ 
    success: true,
    message: "Govardhan Dairy Farm API is running",
    version: "1.0.0",
    timestamp: new Date(),
    environment: process.env.NODE_ENV || "development"
  });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found"
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.stack}`);

  const response = {
    success: false,
    message: "Internal Server Error"
  };

  if (process.env.NODE_ENV === "development") {
    response.error = err.message;
    response.stack = err.stack;
  }

  res.status(500).json(response);
});

// Start server
app.listen(port, () => {
  console.log(`
  ██████╗  ██████╗ ██╗   ██╗ █████╗ ██████╗ ██████╗  █████╗ ██╗  ██╗███╗   ██╗
  ██╔══██╗██╔═══██╗██║   ██║██╔══██╗██╔══██╗██╔══██╗██╔══██╗██║  ██║████╗  ██║
  ██║  ██║██║   ██║██║   ██║███████║██████╔╝██║  ██║███████║███████║██╔██╗ ██║
  ██║  ██║██║   ██║╚██╗ ██╔╝██╔══██║██╔══██╗██║  ██║██╔══██║██╔══██║██║╚██╗██║
  ██████╔╝╚██████╔╝ ╚████╔╝ ██║  ██║██║  ██║██████╔╝██║  ██║██║  ██║██║ ╚████║
  ╚═════╝  ╚═════╝   ╚═══╝  ╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝
  
  Server running on port ${port}
  Environment: ${process.env.NODE_ENV || "development"}
  Ready to serve your dairy needs! 🐄🥛
  `);
});