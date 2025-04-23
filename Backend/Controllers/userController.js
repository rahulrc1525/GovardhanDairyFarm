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

// Function to verify email using MailboxLayer API
const verifyEmailWithMailboxLayer = async (email) => {
  try {
    const response = await axios.get(
      `http://apilayer.net/api/check?access_key=${process.env.MAILBOXLAYER_API_KEY}&email=${email}&smtp=1&format=1`
    );

    if (!response.data.format_valid || !response.data.mx_found || response.data.disposable) {
      return {
        valid: false,
        message: "Invalid email address. Please use a valid email."
      };
    }

    return { valid: true };
  } catch (error) {
    console.error("MailboxLayer API error:", error);
    // Fallback to basic validation if API fails
    return {
      valid: validator.isEmail(email),
      message: "Email validation service unavailable. Using basic validation."
    };
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
      return res.status(403).json({ 
        success: false, 
        message: "Email not verified. Please verify your email before logging in." 
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.status(200).json({ 
      success: true, 
      token, 
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

// Register user
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    // Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    // Validate email format
    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid email format" });
    }

    // Validate password
    if (password.length < 8) {
      return res.status(400).json({ 
        success: false, 
        message: "Password must be at least 8 characters long" 
      });
    }

    // Verify email with MailboxLayer
    const emailVerification = await verifyEmailWithMailboxLayer(email);
    if (!emailVerification.valid) {
      return res.status(400).json({ 
        success: false, 
        message: emailVerification.message || "Invalid email address" 
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

    // Generate verification token
    const verificationToken = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { 
      expiresIn: "1d" 
    });
    
    newUser.emailVerificationToken = verificationToken;
    await newUser.save();

    // Send verification email
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify Your Email",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to Govardhan Dairy Farm!</h2>
          <p>Please click the button below to verify your email address:</p>
          <a href="${verificationUrl}" 
             style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; 
             color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
            Verify Email
          </a>
          <p>If you didn't create an account with us, please ignore this email.</p>
          <p style="font-size: 12px; color: #777;">This link will expire in 24 hours.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ 
      success: true, 
      message: "Registration successful. Please verify your email." 
    });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Server error during registration" 
    });
  }
};

// Verify email
const verifyEmail = async (req, res) => {
  const { token } = req.query;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findOne({ 
      _id: decoded.id, 
      emailVerificationToken: token 
    });

    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid or expired verification token" 
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();

    // Redirect to frontend with success message
    res.redirect(`${process.env.FRONTEND_URL}/login?verified=true`);
  } catch (error) {
    console.error("Error verifying email:", error);
    if (error.name === 'TokenExpiredError') {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=token-expired`);
    }
    res.redirect(`${process.env.FRONTEND_URL}/login?error=verification-failed`);
  }
};

// Forgot password
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: "If this email is registered, you'll receive a reset link" 
      });
    }

    // Generate reset token
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { 
      expiresIn: "1h" 
    });
    
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send password reset email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset</h2>
          <p>You requested a password reset. Click the button below to reset your password:</p>
          <a href="${resetUrl}" 
             style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; 
             color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
            Reset Password
          </a>
          <p>If you didn't request this, please ignore this email.</p>
          <p style="font-size: 12px; color: #777;">This link will expire in 1 hour.</p>
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
    res.status(500).json({ 
      success: false, 
      message: "Server error processing your request" 
    });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findOne({ 
      _id: decoded.id, 
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid or expired reset token" 
      });
    }

    // Validate password
    if (password.length < 8) {
      return res.status(400).json({ 
        success: false, 
        message: "Password must be at least 8 characters long" 
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update user
    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json({ 
      success: true, 
      message: "Password reset successful" 
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ 
        success: false, 
        message: "Reset token has expired" 
      });
    }
    res.status(500).json({ 
      success: false, 
      message: "Internal Server Error" 
    });
  }
};

export default { 
  loginUser, 
  registerUser, 
  verifyEmail, 
  forgotPassword, 
  resetPassword 
};