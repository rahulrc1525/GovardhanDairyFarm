import express from "express";
import { addRating, getFoodRatings } from "../Controllers/ratingController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.post("/add", authMiddleware, addRating);
router.get("/:foodId", getFoodRatings);

export default router;