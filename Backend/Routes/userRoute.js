import express from "express";
import userController from "../Controllers/userController.js";

// Create router
const userRouter = express.Router();

// Define routes
userRouter.post("/register", userController.registerUser);
userRouter.post("/login", userController.loginUser);
userRouter.get("/verify-email", userController.verifyEmail);
userRouter.post("/verify-phone", userController.verifyPhone);
userRouter.post("/forgot-password", userController.forgotPassword);
userRouter.post("/reset-password", userController.resetPassword);

// Export router
export default userRouter;