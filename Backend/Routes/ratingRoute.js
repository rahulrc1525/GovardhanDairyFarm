import express from "express";
import { 
  addRating, 
  getFoodRatings, 
  getUserRating 
} from "../Controllers/ratingController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// Add or update a rating
router.post("/add", authMiddleware, addRating);

// Get user's specific rating for a food item from an order
router.get("/user-rating", authMiddleware, getUserRating);

// Get all ratings for a food item
router.get("/:foodId", getFoodRatings);

export default router;