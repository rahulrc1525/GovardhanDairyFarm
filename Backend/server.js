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

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: "*" }));

// Connect to the database
connectDB();

// Serve static files from the frontend build directory
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "Frontend", "build"))); // Update "frontend" to your frontend folder name

// API endpoints
app.use("/api/food", foodRouter);
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/contact", contactRouter);
app.use("/api/order", orderRouter);
app.use("/api/sales", salesRouter);
app.post("/api/order/webhook", express.json({ type: "application/json" }), handleWebhookEvent);

// Handle all other routes by serving the frontend index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "Frontend", "build", "index.html")); // Update "frontend" to your frontend folder name
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Internal Server Error" });
});

// Start the server
app.listen(port, () => {
  console.log(`Server started on https://govardhandairyfarmbackend.onrender.com`);
});