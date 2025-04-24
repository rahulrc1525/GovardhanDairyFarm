// Create new middleware/rateLimit.js
import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: "Too many attempts, please try again later",
  standardHeaders: true,
  legacyHeaders: false
});

// Update userRoute.js
import { authLimiter } from "../middleware/rateLimit.js";

userRouter.post("/register", authLimiter, registerUser);
userRouter.post("/login", authLimiter, loginUser);
userRouter.post("/forgot-password", authLimiter, forgotPassword);