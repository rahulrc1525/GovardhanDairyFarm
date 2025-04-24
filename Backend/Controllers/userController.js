import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import nodemailer from "nodemailer";
import axios from "axios";

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// MailboxLayer Validation Function
const validateEmail = async (email) => {
  try {
    const response = await axios.get(
      `http://apilayer.net/api/check?access_key=${process.env.MAILBOXLAYER_API_KEY}&email=${email}`
    );

    if (!response.data.success) {
      return { valid: false, message: "Email validation service failed" };
    }

    if (!response.data.format_valid) {
      return { valid: false, message: "Invalid email format" };
    }

    if (response.data.disposable) {
      return { valid: false, message: "Disposable emails not allowed" };
    }

    if (!response.data.mx_found) {
      return { valid: false, message: "Invalid email domain" };
    }

    return { valid: true };
  } catch (error) {
    console.error("MailboxLayer error:", error);
    return { valid: false, message: "Email verification service unavailable" };
  }
};

// Updated registerUser
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Validation
    const missingFields = [];
    if (!name) missingFields.push("name");
    if (!email) missingFields.push("email");
    if (!password) missingFields.push("password");
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`
      });
    }

    const emailValidation = await validateEmail(email);
    if (!emailValidation.valid) {
      return res.status(400).json({
        success: false,
        message: emailValidation.message
      });
    }

    const existingUser = await userModel.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered"
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters"
      });
    }

    // Create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new userModel({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword
    });

    const verificationToken = jwt.sign(
      { id: newUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    newUser.emailVerificationToken = verificationToken;
    await newUser.save();

    // Send verification email
    try {
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
      await transporter.sendMail({
        from: `"Govardhan Dairy" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Verify Your Email Address",
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #2c3e50;">Email Verification</h2>
            <p>Please click the button below to verify your email address:</p>
            <a href="${verificationUrl}" 
              style="display: inline-block; padding: 12px 24px; 
              background-color: #3498db; color: white; 
              text-decoration: none; border-radius: 4px; margin: 20px 0;">
              Verify Email
            </a>
            <p style="color: #7f8c8d;">
              This link will expire in 24 hours. If you didn't request this, please ignore this email.
            </p>
          </div>
        `
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      return res.status(500).json({
        success: false,
        message: "Account created but verification email failed"
      });
    }

    res.status(201).json({
      success: true,
      message: "Registration successful. Please check your email."
    });

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Registration failed. Please try again."
    });
  }
};

// Updated verifyEmail
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
        message: "Invalid verification link"
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email already verified"
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();

    res.redirect(`${process.env.FRONTEND_URL}/login?verified=true`);
    
  } catch (error) {
    console.error("Verification error:", error);
    res.status(400).json({
      success: false,
      message: "Invalid or expired verification link"
    });
  }
};

// Updated forgotPassword
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const emailValidation = await validateEmail(email);
    if (!emailValidation.valid) {
      return res.status(400).json({
        success: false,
        message: emailValidation.message
      });
    }

    const user = await userModel.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (!user.isEmailVerified) {
      return res.status(401).json({
        success: false,
        message: "Verify your email first"
      });
    }

    const resetToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = Date.now() + 3600000;
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    await transporter.sendMail({
      from: `"Govardhan Dairy" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #2c3e50;">Password Reset</h2>
          <p>Click the button below to reset your password:</p>
          <a href="${resetUrl}" 
            style="display: inline-block; padding: 12px 24px; 
            background-color: #3498db; color: white; 
            text-decoration: none; border-radius: 4px; margin: 20px 0;">
            Reset Password
          </a>
          <p style="color: #7f8c8d;">
            This link expires in 1 hour. If you didn't request this, please ignore this email.
          </p>
        </div>
      `
    });

    res.status(200).json({
      success: true,
      message: "Password reset instructions sent to your email"
    });

  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process request"
    });
  }
};

// Updated resetPassword
const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findOne({
      _id: decoded.id,
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token"
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successful"
    });

  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to reset password"
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