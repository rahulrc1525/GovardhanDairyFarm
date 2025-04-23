import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { 
      type: String, 
      required: true, 
      unique: true,
      validate: {
        validator: function(v) {
          return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
        },
        message: props => `${props.value} is not a valid email address!`
      }
    },
    phoneNumber: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple null values
      validate: {
        validator: function(v) {
          return /^\+?[1-9]\d{1,14}$/.test(v); // E.164 format validation
        },
        message: props => `${props.value} is not a valid phone number!`
      }
    },
    isPhoneVerified: { type: Boolean, default: false },
    phoneVerificationToken: { type: String },
    phoneVerificationExpires: { type: Date },
    password: { type: String, required: true },
    cartData: { type: Object, default: {} },
    role: { type: String, default: "user", enum: ["user", "admin"] },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String },
    emailVerificationExpires: { type: Date },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
    phoneResetToken: { type: String },
    phoneResetExpires: { type: Date },
    emailQualityScore: { type: Number },
    emailValid: { type: Boolean },
    lastLogin: { type: Date },
    loginAttempts: { type: Number, default: 0 },
    accountLocked: { type: Boolean, default: false },
    lockUntil: { type: Date },
    phoneCarrier: { type: String }, // From NumVerify
    phoneCountry: { type: String }, // From NumVerify
    phoneValid: { type: Boolean } // From NumVerify
  },
  {
    timestamps: true,
    minimize: false,
  }
);

// Add indexes
userSchema.index({ email: 1 });
userSchema.index({ phoneNumber: 1 }, { sparse: true });
userSchema.index({ emailVerificationToken: 1 }, { sparse: true });
userSchema.index({ passwordResetToken: 1 }, { sparse: true });
userSchema.index({ phoneVerificationToken: 1 }, { sparse: true });

export default mongoose.models.User || mongoose.model("User", userSchema);