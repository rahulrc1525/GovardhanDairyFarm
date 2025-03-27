import express from "express";
import { addRating, getFoodRatings, checkRating } from "../Controllers/ratingController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// Add a rating
router.post("/add", authMiddleware, addRating);

// Get ratings for a food item
router.get("/:foodId", getFoodRatings);

// Check if user can rate a food item from an order
router.get("/check/eligibility", authMiddleware, checkRating);

export default router;