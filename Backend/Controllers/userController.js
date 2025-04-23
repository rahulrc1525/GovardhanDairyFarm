import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import nodemailer from "nodemailer";
import axios from "axios";

// Configure nodemailer for sending emails
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Helper function to verify email with MailboxLayer
const verifyEmailWithMailboxLayer = async (email) => {
  try {
    const response = await axios.get(
      `http://apilayer.net/api/check?access_key=${process.env.MAILBOXLAYER_API_KEY}&email=${email}&smtp=1&format=1`
    );
    
    return {
      valid: response.data.format_valid && response.data.mx_found && response.data.smtp_check,
      score: response.data.score,
      ...response.data
    };
  } catch (error) {
    console.error("MailboxLayer verification error:", error);
    return { valid: false, score: 0 };
  }
};

// Register user with email verification
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  
  try {
    // Basic validation
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
        message: "User already exists" 
      });
    }

    // Verify email with MailboxLayer
    const emailVerification = await verifyEmailWithMailboxLayer(email);
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new userModel({ 
      name, 
      email, 
      password: hashedPassword,
      emailQualityScore: emailVerification.score,
      emailValid: emailVerification.valid
    });

    // Auto-verify if enabled and email is valid
    if (process.env.AUTO_VERIFY_EMAIL === 'true' && emailVerification.valid) {
      newUser.isEmailVerified = true;
      await newUser.save();
      
      return res.status(201).json({ 
        success: true, 
        message: "Registration successful. Your email has been automatically verified." 
      });
    }

    // Otherwise, proceed with email verification
    const verificationToken = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { 
      expiresIn: "1d" 
    });
    
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
          <p style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #3498db; color: white; padding: 10px 20px; 
                      text-decoration: none; border-radius: 5px; font-weight: bold;">
              Verify Email
            </a>
          </p>
          <p>If you didn't create an account with us, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #777;">
            This link will expire in 24 hours. If it expires, you can request a new verification email.
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
    res.status(500).json({ 
      success: false, 
      message: "Server error during registration" 
    });
  }
};

// Verify email
const verifyEmail = async (req, res) => {
  const { token } = req.query;
  
  try {
    if (!token) {
      return res.status(400).json({ 
        success: false, 
        message: "Verification token is required" 
      });
    }

    // Find user by token
    const user = await userModel.findOne({ 
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() } 
    });

    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid or expired verification token" 
      });
    }

    // Mark as verified
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.status(200).json({ 
      success: true, 
      message: "Email verified successfully. You can now log in." 
    });
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error during email verification" 
    });
  }
};

// Login user with enhanced security
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Email and password are required" 
      });
    }

    // Find user
    const user = await userModel.findOne({ email });
    
    // Check if user exists
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }

    // Check if account is locked
    if (user.accountLocked && user.lockUntil > Date.now()) {
      const remainingTime = Math.ceil((user.lockUntil - Date.now()) / (60 * 1000));
      return res.status(403).json({ 
        success: false, 
        message: `Account is locked. Try again in ${remainingTime} minutes.` 
      });
    }

    // Check email verification
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
      
      // Lock account after 5 failed attempts for 30 minutes
      if (user.loginAttempts >= 5) {
        user.accountLocked = true;
        user.lockUntil = Date.now() + 30 * 60 * 1000; // 30 minutes
      }
      
      await user.save();
      
      return res.status(400).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }

    // Reset login attempts on successful login
    user.loginAttempts = 0;
    user.accountLocked = false;
    user.lockUntil = undefined;
    user.lastLogin = Date.now();
    await user.save();

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { 
      expiresIn: "1d" 
    });

    res.status(200).json({ 
      success: true, 
      token, 
      userId: user._id,
      user: {
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error during login" 
    });
  }
};

// Forgot password
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  
  try {
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: "Email is required" 
      });
    }

    const user = await userModel.findOne({ email });
    
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: "If this email exists, a reset link has been sent" 
      });
    }

    // Generate reset token
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { 
      expiresIn: "1h" 
    });
    
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
          <h2 style="color: #2c3e50;">Password Reset Request</h2>
          <p>We received a request to reset your password. Click the button below to proceed:</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #e74c3c; color: white; padding: 10px 20px; 
                      text-decoration: none; border-radius: 5px; font-weight: bold;">
              Reset Password
            </a>
          </p>
          <p>If you didn't request this, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #777;">
            This link will expire in 1 hour. For security reasons, please do not share this link.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ 
      success: true, 
      message: "If this email exists, a reset link has been sent" 
    });
  } catch (error) {
    console.error("Error during forgot password:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error during password reset" 
    });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  
  try {
    if (!token || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Token and new password are required" 
      });
    }

    if (password.length < 8) {
      return res.status(400).json({ 
        success: false, 
        message: "Password must be at least 8 characters long" 
      });
    }

    // Find user by token
    const user = await userModel.findOne({ 
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() } 
    });

    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid or expired reset token" 
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
    user.accountLocked = false;
    user.lockUntil = undefined;
    await user.save();

    res.status(200).json({ 
      success: true, 
      message: "Password reset successful. You can now log in with your new password." 
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error during password reset" 
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