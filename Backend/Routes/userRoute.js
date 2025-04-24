import express from "express";
import userController from "../Controllers/userController.js";
import rateLimit from "express-rate-limit";

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many attempts, please try again later",
  standardHeaders: true,
  legacyHeaders: false
});

router.post("/register", authLimiter, userController.registerUser);
router.post("/login", authLimiter, userController.loginUser);
router.get("/verify-email", userController.verifyEmail);
router.post("/forgot-password", authLimiter, userController.forgotPassword);
router.post("/reset-password", userController.resetPassword);

export default router;