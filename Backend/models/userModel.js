import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: [true, "Name is required"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"]
    },
    email: { 
      type: String, 
      required: [true, "Email is required"], 
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: validator.isEmail,
        message: props => `${props.value} is not a valid email address!`
      }
    },
    password: { 
      type: String, 
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
      select: false
    },
    cartData: { 
      type: Object, 
      default: {} 
    },
    role: { 
      type: String, 
      default: "user", 
      enum: ["user", "admin"] 
    },
    isEmailVerified: { 
      type: Boolean, 
      default: false 
    },
    emailVerificationToken: { 
      type: String,
      select: false
    },
    emailVerificationExpires: { 
      type: Date,
      select: false
    },
    passwordResetToken: { 
      type: String,
      select: false
    },
    passwordResetExpires: { 
      type: Date,
      select: false
    },
    emailValid: { 
      type: Boolean 
    },
    lastLogin: { 
      type: Date 
    },
    loginAttempts: { 
      type: Number, 
      default: 0 
    },
    accountLocked: { 
      type: Boolean, 
      default: false 
    },
    lockUntil: { 
      type: Date 
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: function(doc, ret) {
        delete ret.password;
        delete ret.emailVerificationToken;
        delete ret.emailVerificationExpires;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        return ret;
      }
    }
  }
);

// Indexes for better query performance
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ emailVerificationToken: 1 });
userSchema.index({ passwordResetToken: 1 });

// Pre-save hook to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.User || mongoose.model("User", userSchema);