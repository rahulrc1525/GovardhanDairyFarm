import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { 
      type: String, 
      required: true, 
      unique: true,
      validate: {
        validator: validator.isEmail,
        message: props => `${props.value} is not a valid email address!`
      }
    },
    password: { type: String, required: true },
    cartData: { type: Object, default: {} },
    role: { type: String, default: "user" },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String },
    emailVerificationExpires: { type: Date },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
    lastLogin: { type: Date },
    loginAttempts: { type: Number, default: 0 },
    accountLockedUntil: { type: Date }
  },
  {
    timestamps: true,
    minimize: false,
  }
);

export default mongoose.models.User || mongoose.model("User", userSchema);