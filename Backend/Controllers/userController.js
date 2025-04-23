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

// Helper function to verify phone with NumVerify
const verifyPhoneWithNumVerify = async (phoneNumber) => {
  try {
    const response = await axios.get(
      `http://apilayer.net/api/validate?access_key=${process.env.NUMVERIFY_API_KEY}&number=${phoneNumber}&format=1`
    );
    
    return {
      valid: response.data.valid,
      number: response.data.number,
      localFormat: response.data.local_format,
      internationalFormat: response.data.international_format,
      countryPrefix: response.data.country_prefix,
      countryCode: response.data.country_code,
      countryName: response.data.country_name,
      location: response.data.location,
      carrier: response.data.carrier,
      lineType: response.data.line_type,
      ...response.data
    };
  } catch (error) {
    console.error("NumVerify verification error:", error);
    return { valid: false };
  }
};

// Generate a random verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
};

// Register user with email and phone verification
const registerUser = async (req, res) => {
  const { name, email, password, phoneNumber } = req.body;
  
  try {
    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email, and password are required" });
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

    // Check if user already exists by email or phone
    const existingUser = await userModel.findOne({ 
      $or: [{ email }, { phoneNumber }] 
    });
    
    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ 
          success: false, 
          message: "Email already registered" 
        });
      }
      if (existingUser.phoneNumber === phoneNumber) {
        return res.status(400).json({ 
          success: false, 
          message: "Phone number already registered" 
        });
      }
    }

    // Verify email with MailboxLayer
    const emailVerification = await verifyEmailWithMailboxLayer(email);
    
    // Verify phone if provided
    let phoneVerification = { valid: false };
    if (phoneNumber && process.env.PHONE_VERIFICATION_ENABLED === 'true') {
      phoneVerification = await verifyPhoneWithNumVerify(phoneNumber);
      
      if (!phoneVerification.valid) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid phone number. Please provide a valid phone number." 
        });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new userModel({ 
      name, 
      email, 
      password: hashedPassword,
      phoneNumber: phoneVerification.valid ? phoneVerification.internationalFormat : undefined,
      emailQualityScore: emailVerification.score,
      emailValid: emailVerification.valid,
      phoneValid: phoneVerification.valid,
      phoneCarrier: phoneVerification.carrier,
      phoneCountry: phoneVerification.country_name,
      isPhoneVerified: process.env.AUTO_VERIFY_WITH_PHONE === 'true' && phoneVerification.valid
    });

    // Auto-verify if enabled and email is valid
    if (process.env.AUTO_VERIFY_EMAIL === 'true' && emailVerification.valid) {
      newUser.isEmailVerified = true;
    }

    // Generate verification tokens
    const emailVerificationToken = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { 
      expiresIn: "1d" 
    });
    
    newUser.emailVerificationToken = emailVerificationToken;
    newUser.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    // Generate phone verification code if phone is provided but not auto-verified
    if (phoneNumber && !newUser.isPhoneVerified) {
      const phoneVerificationCode = generateVerificationCode();
      newUser.phoneVerificationToken = await bcrypt.hash(phoneVerificationCode, 8);
      newUser.phoneVerificationExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
      
      // In production, send this code via SMS (e.g., using Twilio)
      console.log(`Phone verification code for ${phoneNumber}: ${phoneVerificationCode}`);
    }

    await newUser.save();

    // Send verification email
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${emailVerificationToken}`;
    
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
          ${phoneNumber && !newUser.isPhoneVerified ? 
            `<p>We've also sent a verification code to your phone number ${phoneNumber}.</p>` : ''}
          <p>If you didn't create an account with us, please ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ 
      success: true, 
      message: "Registration successful. Please check your email to verify your account." + 
        (phoneNumber && !newUser.isPhoneVerified ? " A phone verification code has also been sent." : ""),
      requiresPhoneVerification: phoneNumber && !newUser.isPhoneVerified
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

// Verify phone number
const verifyPhone = async (req, res) => {
  const { phoneNumber, code } = req.body;
  
  try {
    if (!phoneNumber || !code) {
      return res.status(400).json({ 
        success: false, 
        message: "Phone number and verification code are required" 
      });
    }

    // Find user by phone number
    const user = await userModel.findOne({ 
      phoneNumber,
      phoneVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid phone number or verification code expired" 
      });
    }

    // Check verification code
    const isMatch = await bcrypt.compare(code, user.phoneVerificationToken);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid verification code" 
      });
    }

    // Mark phone as verified
    user.isPhoneVerified = true;
    user.phoneVerificationToken = undefined;
    user.phoneVerificationExpires = undefined;
    await user.save();

    res.status(200).json({ 
      success: true, 
      message: "Phone number verified successfully" 
    });
  } catch (error) {
    console.error("Error verifying phone:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error during phone verification" 
    });
  }
};

// Login user with email or phone
const loginUser = async (req, res) => {
  const { email, phoneNumber, password } = req.body;
  
  try {
    // Basic validation
    if ((!email && !phoneNumber) || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Email/phone and password are required" 
      });
    }

    // Find user by email or phone
    const user = await userModel.findOne({ 
      $or: [{ email }, { phoneNumber }] 
    });
    
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

    // Check email verification (if logged in with email)
    if (email && !user.isEmailVerified) {
      return res.status(403).json({ 
        success: false, 
        message: "Please verify your email before logging in" 
      });
    }

    // Check phone verification (if logged in with phone)
    if (phoneNumber && !user.isPhoneVerified) {
      return res.status(403).json({ 
        success: false, 
        message: "Please verify your phone number before logging in" 
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
        phoneNumber: user.phoneNumber,
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

// Forgot password with email or phone
const forgotPassword = async (req, res) => {
  const { email, phoneNumber } = req.body;
  
  try {
    if (!email && !phoneNumber) {
      return res.status(400).json({ 
        success: false, 
        message: "Email or phone number is required" 
      });
    }

    // Find user by email or phone
    const user = await userModel.findOne({ 
      $or: [{ email }, { phoneNumber }] 
    });
    
    if (!user) {
      // Don't reveal if user exists for security
      return res.status(200).json({ 
        success: true, 
        message: "If this account exists, a reset link has been sent" 
      });
    }

    // Generate reset token
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { 
      expiresIn: "1h" 
    });
    
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = Date.now() + 3600000; // 1 hour
    
    // If resetting via phone, generate a code
    if (phoneNumber) {
      const resetCode = generateVerificationCode();
      user.phoneResetToken = await bcrypt.hash(resetCode, 8);
      user.phoneResetExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
      
      // In production, send this code via SMS
      console.log(`Password reset code for ${phoneNumber}: ${resetCode}`);
    }

    await user.save();

    // Send reset email if requested via email
    if (email) {
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
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
    }

    res.status(200).json({ 
      success: true, 
      message: "If this account exists, a reset link has been sent",
      resetVia: phoneNumber ? 'phone' : 'email'
    });
  } catch (error) {
    console.error("Error during forgot password:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error during password reset" 
    });
  }
};

// Reset password with token or phone verification
const resetPassword = async (req, res) => {
  const { token, phoneNumber, code, password } = req.body;
  
  try {
    if ((!token && (!phoneNumber || !code)) || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Token or phone verification code and new password are required" 
      });
    }

    if (password.length < 8) {
      return res.status(400).json({ 
        success: false, 
        message: "Password must be at least 8 characters long" 
      });
    }

    // Find user by token or phone verification
    let user;
    if (token) {
      user = await userModel.findOne({ 
        passwordResetToken: token,
        passwordResetExpires: { $gt: Date.now() } 
      });
    } else {
      user = await userModel.findOne({ 
        phoneNumber,
        phoneResetExpires: { $gt: Date.now() } 
      });
      
      if (user) {
        const isMatch = await bcrypt.compare(code, user.phoneResetToken);
        if (!isMatch) {
          return res.status(400).json({ 
            success: false, 
            message: "Invalid verification code" 
          });
        }
      }
    }

    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid or expired reset token/code" 
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update password and clear reset tokens
    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.phoneResetToken = undefined;
    user.phoneResetExpires = undefined;
    user.loginAttempts = 0;
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

// Export all controller functions
export default { 
  loginUser, 
  registerUser, 
  verifyEmail,
  verifyPhone,
  forgotPassword, 
  resetPassword 
};