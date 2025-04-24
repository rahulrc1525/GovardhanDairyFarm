import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: [true, "Name is required."],
      trim: true
    },
    email: { 
      type: String, 
      required: [true, "Email is required."],
      unique: true,
      trim: true,
      lowercase: true,
      validate: [validator.isEmail, "Invalid email format."]
    },
    password: { 
      type: String, 
      required: [true, "Password is required."],
      minlength: [8, "Password must be at least 8 characters long."]
    },
    cartData: { type: Object, default: {} },
    role: { type: String, default: "user" },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
  },
  {
    timestamps: true,
    minimize: false,
  }
);

export default mongoose.models.User || mongoose.model("User", userSchema);