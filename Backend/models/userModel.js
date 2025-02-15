import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
{
name: { type: String, required: true },
email: { type: String, required: true, unique: true },
password: { type: String, required: true },
cartData: { type: Object, default: {} }, // This should be able to store item IDs and quantities
},
{
timestamps: true,
minimize: false,
}
);

export default mongoose.models.User || mongoose.model("User", userSchema);