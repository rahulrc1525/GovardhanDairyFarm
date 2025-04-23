import express from "express";
import userController from "../Controllers/userController.js";
const { 
  loginUser, 
  registerUser, 
  verifyEmail, 
  verifyPhone,
  forgotPassword, 
  resetPassword 
} = userController;

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/verify-email", verifyEmail);
userRouter.post("/verify-phone", verifyPhone);
userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/reset-password", resetPassword);

export default userRouter;