import express from "express";
import userController from "../Controllers/userController.js";
import rateLimit from "express-rate-limit";

const router = express.Router();

// Apply rate limiting to sensitive routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per window
  message: "Too many attempts, please try again later"
});

router.post("/register", authLimiter, userController.registerUser);
router.post("/login", authLimiter, userController.loginUser);
router.get("/verify-email", userController.verifyEmail);
router.post("/forgot-password", authLimiter, userController.forgotPassword);
router.post("/reset-password", authLimiter, userController.resetPassword);

export default router;