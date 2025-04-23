import express from "express";
import userController from "../Controllers/userController.js";
const { 
  loginUser, 
  registerUser, 
  verifyEmail, 
  forgotPassword, 
  resetPassword,
  checkEmail 
} = userController;

const userRouter = express.Router();

userRouter.post("/check-email", checkEmail);
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/verify-email", verifyEmail);
userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/reset-password", resetPassword);

export default userRouter;