import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import nodemailer from "nodemailer";

// Configure nodemailer for sending emails
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "User does not exist" });
    }

    // Compare password
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
    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "All fields are required" 
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid email format" 
      });
    }

    if (password.length < 8) {
      return res.status(400).json({ 
        success: false, 
        message: "Password must be at least 8 characters" 
      });
    }

    // Check existing user
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: "Email already registered" 
      });
    }

    // Create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new userModel({ 
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword 
    });

    // Generate verification token
    const verificationToken = jwt.sign(
      { id: newUser._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: "1d" }
    );
    
    newUser.emailVerificationToken = verificationToken;
    await newUser.save();

    // Send verification email (async)
    try {
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
      await transporter.sendMail({
        from: `"Govardhan Dairy" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Verify Your Email",
        html: `<p>Click <a href="${verificationUrl}">here</a> to verify your email</p>`,
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Continue even if email fails
    }

    res.status(201).json({ 
      success: true,
      message: "Registration successful. Please verify your email."
    });

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Registration failed. Please try again." 
    });
  }
};
// Verify email
const verifyEmail = async (req, res) => {
  const { token } = req.query;
  try {
    const user = await userModel.findOne({ emailVerificationToken: token });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid token" });
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

    // Generate a reset token (optional, if you want to use tokens)
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    res.status(200).json({ success: true, message: "Proceed to reset password" });
  } catch (error) {
    console.error("Error during forgot password:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const resetPassword = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update the user's password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export default { loginUser, registerUser, verifyEmail, forgotPassword, resetPassword };