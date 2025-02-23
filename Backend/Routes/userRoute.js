import express from "express";
import userController from "../Controllers/userController.js";
const { loginUser, registerUser, verifyEmail, forgotPassword, resetPassword } = userController;

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/verify-email", verifyEmail);
userRouter.post("/forgot-password", forgotPassword);
userRouter.get("/reset-password/:token", (req, res) => {
    const token = req.params.token;
    res.render("reset-password", { token });
  });
  

export default userRouter;