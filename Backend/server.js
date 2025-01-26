import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./Config/db.js";
import foodRouter from "./Routes/foodRoute.js";
import userRouter from "./Routes/userRoute.js";
import cartRouter from "./Routes/cartRoute.js";
//import orderRouter from "./Routes/orderRoute.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());
app.use(cors({ origin: "http://localhost:3000" })); 
// Connect to the database
connectDB();

// API endpoints
app.use("/api/food", foodRouter);
app.use("/images", express.static("Uploads"));
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
//app.use("/api/order",orderRouter)

// Root route
app.get("/", (req, res) => {
    res.send("API WORKING");
});

// Start the server
app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});
