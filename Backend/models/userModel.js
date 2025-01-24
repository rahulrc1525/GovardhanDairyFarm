import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cartData: {
      items: [
        {
          productId: { type: mongoose.Schema.Types.ObjectId, ref: "food" }, // Reference foodModel
          quantity: { type: Number, default: 1 },
        },
      ],
    },
  },
  {
    timestamps: true,
    minimize: false,
  }
);

export default mongoose.models.User || mongoose.model("User", userSchema);
