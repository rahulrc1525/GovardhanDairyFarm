import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";

const clickedItemSchema = new mongoose.Schema({
  foodId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "food",
    required: true,
  },
  count: {
    type: Number,
    default: 1,
    min: 1,
  },
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    minlength: [2, "Name must be at least 2 characters"]
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: validator.isEmail,
      message: "Invalid email format"
    }
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [8, "Password must be at least 8 characters"]
  },
  cartData: { type: Object, default: {} },
  clickedItems: [clickedItemSchema], // New field to track user clicks on food items
  role: { type: String, default: "user" },
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String },
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date },
},
{
  timestamps: true,
  minimize: false,
});

export default mongoose.models.User || mongoose.model("User", userSchema);
