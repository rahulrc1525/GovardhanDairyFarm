import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import nodemailer from "nodemailer";
import { verifyEmailWithMailboxLayer } from "../utils/emailVerifier.js";

// Configure nodemailer for sending emails
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generate tokens
const generateAuthToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
};

const generateEmailVerificationToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_EMAIL_SECRET, { expiresIn: "1d" });
};

// Login user with enhanced security
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = await userModel.findOne({ email });
    
    // Check if account is locked
    if (user?.accountLockedUntil && user.accountLockedUntil > new Date()) {
      return res.status(403).json({ 
        success: false, 
        message: `Account locked. Try again after ${user.accountLockedUntil}` 
      });
    }

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(403).json({ 
        success: false, 
        message: "Please verify your email before logging in" 
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Increment login attempts
      user.loginAttempts += 1;
      
      // Lock account after 5 failed attempts
      if (user.loginAttempts >= 5) {
        user.accountLockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
        await user.save();
        return res.status(403).json({ 
          success: false, 
          message: "Account locked due to too many failed attempts. Try again in 30 minutes." 
        });
      }
      
      await user.save();
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    // Reset login attempts on successful login
    user.loginAttempts = 0;
    user.accountLockedUntil = null;
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const token = generateAuthToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.status(200).json({ 
      success: true, 
      token, 
      refreshToken,
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Enhanced register user with email verification
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  
  try {
    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid email format" });
    }

    if (password.length < 8) {
      return res.status(400).json({ 
        success: false, 
        message: "Password must be at least 8 characters long" 
      });
    }

    // Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: "User already exists. Please login instead." 
      });
    }

    // Verify email with MailboxLayer
    const isEmailValid = await verifyEmailWithMailboxLayer(email);
    if (!isEmailValid) {
      return res.status(400).json({ 
        success: false, 
        message: "Please provide a valid email address" 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new userModel({ 
      name, 
      email, 
      password: hashedPassword 
    });

    // Generate email verification token
    const verificationToken = generateEmailVerificationToken(newUser._id);
    newUser.emailVerificationToken = verificationToken;
    newUser.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    await newUser.save();

    // Send verification email
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    
    const mailOptions = {
      from: `Govardhan Dairy Farm <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify Your Email Address",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Welcome to Govardhan Dairy Farm!</h2>
          <p>Thank you for registering. Please verify your email address to complete your registration.</p>
          <a href="${verificationUrl}" 
             style="display: inline-block; padding: 10px 20px; background-color: #3498db; 
             color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
            Verify Email
          </a>
          <p>If you didn't create an account with us, please ignore this email.</p>
          <p style="margin-top: 30px; color: #7f8c8d; font-size: 0.9em;">
            This link will expire in 24 hours.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ 
      success: true, 
      message: "Registration successful. Please check your email to verify your account." 
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
    if (!token) {
      return res.status(400).json({ success: false, message: "Verification token is required" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_EMAIL_SECRET);
    
    const user = await userModel.findOne({ 
      _id: decoded.id,
      emailVerificationToken: token
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired verification token" });
    }

    // Check if token is expired
    if (user.emailVerificationExpires < Date.now()) {
      return res.status(400).json({ success: false, message: "Verification token has expired" });
    }

    // Mark email as verified
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.status(200).json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    console.error("Error verifying email:", error);
    
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(400).json({ success: false, message: "Verification token has expired" });
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(400).json({ success: false, message: "Invalid verification token" });
    }
    
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Forgot password
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "If this email exists, a reset link has been sent" });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(403).json({ 
        success: false, 
        message: "Please verify your email before resetting password" 
      });
    }

    // Generate reset token
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_RESET_SECRET, { expiresIn: "1h" });
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send reset email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: `Govardhan Dairy Farm <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Password Reset</h2>
          <p>We received a request to reset your password. Click the button below to proceed:</p>
          <a href="${resetUrl}" 
             style="display: inline-block; padding: 10px 20px; background-color: #e74c3c; 
             color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
            Reset Password
          </a>
          <p>If you didn't request this, please ignore this email.</p>
          <p style="margin-top: 30px; color: #7f8c8d; font-size: 0.9em;">
            This link will expire in 1 hour.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ 
      success: true, 
      message: "If this email exists, a password reset link has been sent" 
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
    if (!token || !password) {
      return res.status(400).json({ success: false, message: "Token and new password are required" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_RESET_SECRET);
    
    const user = await userModel.findOne({ 
      _id: decoded.id,
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
    }

    // Validate new password
    if (password.length < 8) {
      return res.status(400).json({ 
        success: false, 
        message: "Password must be at least 8 characters long" 
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update password and clear reset token
    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.loginAttempts = 0; // Reset login attempts
    user.accountLockedUntil = null; // Unlock account if it was locked
    await user.save();

    res.status(200).json({ 
      success: true, 
      message: "Password reset successfully. You can now login with your new password." 
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(400).json({ success: false, message: "Reset token has expired" });
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(400).json({ success: false, message: "Invalid reset token" });
    }
    
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Refresh token
const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  
  try {
    if (!refreshToken) {
      return res.status(400).json({ success: false, message: "Refresh token is required" });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    const user = await userModel.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Generate new access token
    const newToken = generateAuthToken(user._id);

    res.status(200).json({ 
      success: true, 
      token: newToken,
      userId: user._id
    });
  } catch (error) {
    console.error("Error refreshing token:", error);
    
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ success: false, message: "Refresh token expired" });
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ success: false, message: "Invalid refresh token" });
    }
    
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export default { 
  loginUser, 
  registerUser, 
  verifyEmail, 
  forgotPassword, 
  resetPassword,
  refreshToken
};