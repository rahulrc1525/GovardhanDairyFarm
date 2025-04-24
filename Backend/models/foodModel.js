import mongoose from "mongoose";

const foodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  image: { type: String, required: true },
  category: { type: String },
  ratings: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    review: { type: String, maxlength: 500 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  }],
  averageRating: { type: Number, default: 0 },
  clicks: { type: Number, default: 0 },
  purchases: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.models.Food || mongoose.model("Food", foodSchema);