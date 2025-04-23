import express from "express";
import userController from "../Controllers/userController.js";

const router = express.Router();

router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);
router.get("/verify-email", userController.verifyEmail);
router.post("/resend-verification", userController.resendVerificationEmail);
router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password", userController.resetPassword);

export default router;