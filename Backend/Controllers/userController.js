import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    if (!user.isEmailVerified && !process.env.AUTO_VERIFY_EMAIL) {
      return res.status(403).json({ 
        success: false, 
        message: "Please verify your email first" 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.status(200).json({ 
      success: true, 
      token, 
      userId: user._id,
      name: user.name,
      email: user.email
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  
  try {
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

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ 
        success: false, 
        message: "Email already registered" 
      });
    }

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

    if (process.env.AUTO_VERIFY_EMAIL === "true") {
      newUser.isEmailVerified = true;
      await newUser.save();
    } else {
      try {
        const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
        await transporter.sendMail({
          from: `"Govardhan Dairy" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: "Verify Your Email",
          html: `
            <p>Please click the link below to verify your email:</p>
            <a href="${verificationUrl}">Verify Email</a>
            <p>If you didn't request this, please ignore this email.</p>
          `,
        });
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
      }
    }

    res.status(201).json({ 
      success: true,
      message: process.env.AUTO_VERIFY_EMAIL === "true" 
        ? "Registration successful" 
        : "Registration successful. Please verify your email."
    });

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Registration failed" 
    });
  }
};

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
        message: "Invalid or expired token" 
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();

    res.status(200).json({ 
      success: true, 
      message: "Email verified successfully" 
    });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(400).json({ 
      success: false, 
      message: "Invalid or expired token" 
    });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      // Don't reveal whether user exists
      return res.status(200).json({ 
        success: true, 
        message: "If the email exists, a reset link has been sent" 
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

    try {
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      await transporter.sendMail({
        from: `"Govardhan Dairy" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Password Reset Request",
        html: `
          <p>You requested a password reset. Click the link below to proceed:</p>
          <a href="${resetUrl}">Reset Password</a>
          <p>This link expires in 1 hour. If you didn't request this, please ignore this email.</p>
        `,
      });
    } catch (emailError) {
      console.error("Password reset email failed:", emailError);
    }

    res.status(200).json({ 
      success: true, 
      message: "If the email exists, a reset link has been sent" 
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

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

    user.password = await bcrypt.hash(password, 10);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json({ 
      success: true, 
      message: "Password reset successful" 
    });
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(400).json({ 
      success: false, 
      message: "Invalid or expired token" 
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