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

// Validate required environment variables
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'FRONTEND_URL'];
requiredEnvVars.forEach(env => {
  if (!process.env[env]) {
    console.error(`🚨 Missing required environment variable: ${env}`);
    process.exit(1);
  }
});

// Initialize Express app
const app = express();
const port = process.env.PORT || 4000;

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure allowed origins
const allowedOrigins = [
  "https://govardhandairyfarm-admin.onrender.com",
  "https://govardhandairyfarm.shop",
  "https://govardhandairyfarm.onrender.com",
  "http://localhost:3000"
];

// ======================
// MIDDLEWARE CONFIGURATION
// ======================

// Special route for webhook (must come before body parsers)
app.post("/api/order/webhook", 
  express.raw({ type: 'application/json' }), 
  handleWebhookEvent
);

// Body parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Enhanced CORS configuration
app.use((req, res, next) => {
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    return res.status(204).send();
  }
  next();
});

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
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
  optionsSuccessStatus: 204
}));

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"]
    }
  },
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.disable("x-powered-by");

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many requests from this IP, please try again later"
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  message: "Too many authentication attempts from this IP"
});

app.use("/api/user/register", authLimiter);
app.use("/api/user/login", authLimiter);
app.use(apiLimiter);

// Connect to database
connectDB();

// Serve static files
app.use("/images", express.static(path.join(__dirname, "Uploads")));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl} - ${req.ip} - Origin: ${req.headers.origin || 'none'}`);
  next();
});

// ======================
// ROUTES
// ======================
app.use("/api/food", foodRouter);
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/contact", contactRouter);
app.use("/api/order", orderRouter);
app.use("/api/sales", salesRouter);
app.use("/api/rating", ratingRouter);

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ 
    success: true,
    message: "Govardhan Dairy Farm API is running",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    database: process.env.MONGO_URI ? "Connected" : "Disconnected"
  });
});

// ======================
// ERROR HANDLING
// ======================

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
    path: req.originalUrl
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  // Handle CORS errors
  if (err.message.includes('CORS policy')) {
    return res.status(403).json({
      success: false,
      message: "Cross-origin request denied",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }

  console.error(`[${new Date().toISOString()}] ERROR: ${err.stack}`);

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

// ======================
// SERVER START
// ======================
app.listen(port, () => {
  console.log(`
  ██████╗  ██████╗ ██╗   ██╗ █████╗ ██████╗ ██████╗  █████╗ ██╗  ██╗███╗   ██╗
  ██╔══██╗██╔═══██╗██║   ██║██╔══██╗██╔══██╗██╔══██╗██╔══██╗██║  ██║████╗  ██║
  ██║  ██║██║   ██║██║   ██║███████║██████╔╝██║  ██║███████║███████║██╔██╗ ██║
  ██║  ██║██║   ██║╚██╗ ██╔╝██╔══██║██╔══██╗██║  ██║██╔══██║██╔══██║██║╚██╗██║
  ██████╔╝╚██████╔╝ ╚████╔╝ ██║  ██║██║  ██║██████╔╝██║  ██║██║  ██║██║ ╚████║
  ╚═════╝  ╚═════╝   ╚═══╝  ╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝
  
  🚀 Server running on port ${port}
  🌍 Environment: ${process.env.NODE_ENV || "development"}
  🗄️ Database: ${process.env.MONGO_URI ? "Connected ✅" : "Disconnected ❌"}
  ⏰ Started at: ${new Date().toISOString()}
  🔗 Allowed Origins: ${allowedOrigins.join(", ")}
  `);
});