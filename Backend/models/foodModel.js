import mongoose from "mongoose";

const foodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  categories: { type: [String], required: true }, 
  image: { type: String, required: true },
  sales: { type: Number, default: 0 },
  clicks: { type: Number, default: 0 }
});

const foodModel = mongoose.models.food || mongoose.model("food", foodSchema);

export default foodModel;

