import express from "express";
import userController from "../Controllers/userController.js";

const userRouter = express.Router();

// Authentication routes
userRouter.post("/register", userController.registerUser);
userRouter.post("/login", userController.loginUser);
userRouter.get("/verify-email", userController.verifyEmail);

// Password reset routes
userRouter.post("/forgot-password", userController.forgotPassword);
userRouter.post("/reset-password", userController.resetPassword);

// Authentication check route
userRouter.get("/check-auth", userController.checkAuth);

export default userRouter;