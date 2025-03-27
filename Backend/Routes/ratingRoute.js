import express from "express";
import { addRating, getUserRating } from "../Controllers/ratingController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// Protected routes
router.post("/add", authMiddleware, addRating);
router.get("/user-rating", authMiddleware, getUserRating);

export default router;