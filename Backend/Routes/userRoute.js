import express from "express";
import userController from "../Controllers/userController.js";
import authMiddleware from "../middleware/auth.js";

const { loginUser, registerUser, verifyEmail, forgotPassword, resetPassword, updateClickedItem } = userController;

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/verify-email", verifyEmail);
userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/reset-password", resetPassword);

// New route to update clicked items, protected by auth middleware
userRouter.post("/updateclick", authMiddleware, updateClickedItem);

export default userRouter;
