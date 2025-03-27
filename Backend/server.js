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
import path from "path"; // Import path module
import ratingRouter from "./Routes/ratingRoute.js";


dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: "*" }));

// Connect to the database
connectDB();

// Serve static files from the "Uploads" directory
const __dirname = path.resolve(); // Resolve the current directory
app.use("/images", express.static(path.join(__dirname, "Uploads"))); // Serve static files

// Add this before your routes
app.use((req, res, next) => {
  console.log('Incoming request:', {
    method: req.method,
    path: req.path,
    body: req.body,
    headers: req.headers
  });
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
app.post("/api/order/webhook", express.json({ type: "application/json" }), handleWebhookEvent);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Internal Server Error" });
});

// Add this after your routes
app.use((err, req, res, next) => {
  console.error('Global error handler:', {
    error: err,
    stack: err.stack,
    request: {
      method: req.method,
      url: req.url,
      body: req.body
    }
  });
  res.status(500).json({ 
    success: false,
    message: "Internal Server Error",
    error: err.message
  });
});

// Root route
app.get("/", (req, res) => {
  res.send("API WORKING");
});

// Start the server
app.listen(port, () => {
  console.log(`Server started on https://govardhandairyfarmbackend.onrender.com`);
});