import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cartData: { type: Object, default: {} },
    role: { type: String, default: "user" },
    isEmailVerified: { type: Boolean, default: false }, // Email verification status
    emailVerificationToken: { type: String }, // Token for email verification
    passwordResetToken: { type: String }, // Token for password reset
    passwordResetExpires: { type: Date }, // Expiry for password reset token
  },
  {
    timestamps: true,
    minimize: false,
  }
);

export default mongoose.models.User || mongoose.model("User", userSchema);
