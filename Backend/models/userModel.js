import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    minlength: [2, "Name must be at least 2 characters"],
    maxlength: [50, "Name cannot exceed 50 characters"]
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
    minlength: [8, "Password must be at least 8 characters"],
    select: false
  },
  cartData: { 
    type: Object, 
    default: {} 
  },
  role: { 
    type: String, 
    enum: ["user", "admin"], 
    default: "user" 
  },
  isEmailVerified: { 
    type: Boolean, 
    default: false 
  },
  emailVerificationToken: { 
    type: String,
    select: false
  },
  passwordResetToken: { 
    type: String,
    select: false
  },
  passwordResetExpires: { 
    type: Date,
    select: false
  }
}, {
  timestamps: true,
  minimize: false
});

// Prevent password from being returned in queries
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.emailVerificationToken;
  delete user.passwordResetToken;
  delete user.passwordResetExpires;
  return user;
};

export default mongoose.models.User || mongoose.model("User", userSchema);