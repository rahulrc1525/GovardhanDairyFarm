import express from "express";
import userController from "../Controllers/userController.js";
import rateLimit from "express-rate-limit";

const userRouter = express.Router();
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per window
    message: "Too many attempts, please try again later"
  });

userRouter.post("/register", userController.registerUser);
userRouter.post("/login", userController.loginUser);
userRouter.get("/verify-email", userController.verifyEmail);
userRouter.post("/forgot-password", userController.forgotPassword);
userRouter.post("/reset-password", userController.resetPassword);


userRouter.post("/login", authLimiter, userController.loginUser);
userRouter.post("/register", authLimiter, userController.registerUser);
userRouter.post("/forgot-password", authLimiter, userController.forgotPassword);
export default userRouter;