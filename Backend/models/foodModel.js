import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  review: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const foodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  categories: { type: [String], required: true }, 
  image: { type: String, required: true },
  sales: { type: Number, default: 0 },
  clicks: { type: Number, default: 0 },
  ratings: [ratingSchema],
  averageRating: { type: Number, default: 0 }
});

// Calculate average rating before saving
foodSchema.pre('save', function(next) {
  if (this.ratings.length > 0) {
    const sum = this.ratings.reduce((total, rating) => total + rating.rating, 0);
    this.averageRating = sum / this.ratings.length;
  } else {
    this.averageRating = 0;
  }
  next();
});

const foodModel = mongoose.models.food || mongoose.model("food", foodSchema);

export default foodModel;