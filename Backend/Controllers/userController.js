import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import nodemailer from "nodemailer";
import axios from "axios";

// Configure nodemailer for sending emails
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Email verification with MailboxLayer
const verifyEmailWithMailboxLayer = async (email) => {
  try {
    const response = await axios.get(
      `http://apilayer.net/api/check?access_key=${process.env.MAILBOXLAYER_API_KEY}&email=${email}`
    );
    
    return {
      valid: response.data.format_valid && response.data.mx_found,
      disposable: response.data.disposable,
      catchAll: response.data.catch_all,
      score: response.data.score,
      didYouMean: response.data.did_you_mean
    };
  } catch (error) {
    console.error("MailboxLayer error:", error);
    return { valid: false, error: "Email verification service unavailable" };
  }
};

// Check email availability and validity
const checkEmail = async (req, res) => {
  const { email } = req.body;
  try {
    if (!validator.isEmail(email)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid email format" 
      });
    }

    // Check if email exists in database
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(200).json({ 
        success: false, 
        exists: true,
        message: "Email already registered" 
      });
    }

    // Verify email with MailboxLayer
    const verificationResult = await verifyEmailWithMailboxLayer(email);
    
    if (!verificationResult.valid) {
      return res.status(200).json({
        success: false,
        exists: false,
        valid: false,
        message: "This email address does not appear to be valid",
        suggestion: verificationResult.didYouMean
      });
    }

    if (verificationResult.disposable) {
      return res.status(200).json({
        success: false,
        exists: false,
        valid: true,
        disposable: true,
        message: "Disposable email addresses are not allowed"
      });
    }

    return res.status(200).json({ 
      success: true, 
      exists: false,
      valid: true,
      message: "Email is valid and available",
      score: verificationResult.score
    });
  } catch (error) {
    console.error("Error checking email:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error during email verification" 
    });
  }
};

// Login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "User does not exist" });
    }

    if (!user.isEmailVerified) {
      return res.status(400).json({ 
        success: false, 
        message: "Please verify your email first. Check your inbox for verification link." 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.status(200).json({ success: true, token, userId: user._id });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Register user
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    // First verify with MailboxLayer
    const verificationResult = await verifyEmailWithMailboxLayer(email);
    
    if (!verificationResult.valid) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid email address",
        suggestion: verificationResult.didYouMean
      });
    }

    if (verificationResult.disposable) {
      return res.status(400).json({ 
        success: false, 
        message: "Disposable email addresses are not allowed" 
      });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid email format" });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters long" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({ name, email, password: hashedPassword });
    const verificationToken = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    newUser.emailVerificationToken = verificationToken;
    await newUser.save();

    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify Your Email",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #5ed527;">Welcome to Govardhan Dairy Farm</h2>
          <p>Please click the button below to verify your email address:</p>
          <a href="${verificationUrl}" 
             style="display: inline-block; padding: 10px 20px; background-color: #5ed527; 
             color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
            Verify Email
          </a>
          <p>If you didn't create an account, please ignore this email.</p>
          <p style="margin-top: 30px; font-size: 12px; color: #777;">
            © ${new Date().getFullYear()} Govardhan Dairy Farm. All rights reserved.
          </p>
        </div>
      `,
    };
    await transporter.sendMail(mailOptions);

    res.status(201).json({ 
      success: true, 
      message: "Registration successful. Please check your email for verification link." 
    });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Verify email
const verifyEmail = async (req, res) => {
  const { token } = req.query;
  try {
    const user = await userModel.findOne({ emailVerificationToken: token });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired token" });
    }
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();
    res.status(200).json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Forgot password
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = Date.now() + 3600000;
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #5ed527;">Password Reset</h2>
          <p>We received a request to reset your password. Click the button below to proceed:</p>
          <a href="${resetUrl}" 
             style="display: inline-block; padding: 10px 20px; background-color: #5ed527; 
             color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
            Reset Password
          </a>
          <p>If you didn't request this, please ignore this email.</p>
          <p style="margin-top: 30px; font-size: 12px; color: #777;">
            © ${new Date().getFullYear()} Govardhan Dairy Farm. All rights reserved.
          </p>
        </div>
      `,
    };
    await transporter.sendMail(mailOptions);

    res.status(200).json({ 
      success: true, 
      message: "Password reset link sent to your email" 
    });
  } catch (error) {
    console.error("Error during forgot password:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  try {
    const user = await userModel.findOne({ 
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired token" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export default { 
  loginUser, 
  registerUser, 
  verifyEmail, 
  forgotPassword, 
  resetPassword,
  checkEmail 
};
