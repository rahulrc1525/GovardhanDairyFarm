import express from "express";
import userController from "../Controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/register", userController.registerUser);
userRouter.post("/login", userController.loginUser);
userRouter.get("/verify-email", userController.verifyEmail);
userRouter.post("/forgot-password", userController.forgotPassword);
userRouter.post("/reset-password", userController.resetPassword);
userRouter.post("/refresh-token", userController.refreshToken);

export default userRouter;