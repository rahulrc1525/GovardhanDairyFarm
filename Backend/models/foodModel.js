import mongoose from "mongoose";

const foodSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  description: { 
    type: String, 
    required: true,
    trim: true
  },
  price: { 
    type: Number, 
    required: true,
    min: 0
  },
  categories: { 
    type: [String], 
    required: true,
    validate: {
      validator: function(categories) {
        return categories.length > 0;
      },
      message: "At least one category is required"
    }
  }, 
  image: { 
    type: String, 
    required: true,
    validate: {
      validator: function(image) {
        return /^(http|https):\/\/.+/.test(image) || image.startsWith('/');
      },
      message: "Image must be a valid URL"
    }
  },
  sales: { 
    type: Number, 
    default: 0,
    min: 0
  },
  clicks: { 
    type: Number, 
    default: 0,
    min: 0
  },
  ratings: [{
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    orderId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Order', 
      required: true 
    },
    rating: { 
      type: Number, 
      required: true, 
      min: 1, 
      max: 5 
    },
    review: { 
      type: String, 
      default: "",
      trim: true,
      maxlength: 500
    },
    createdAt: { 
      type: Date, 
      default: Date.now,
      immutable: true
    }
  }],
  averageRating: { 
    type: Number, 
    default: 0,
    min: 0,
    max: 5
  }
},  {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  autoIndex: true // Enable automatic index creation
});

// Indexes for better performance
foodSchema.index({ clicks: -1 });
foodSchema.index({ sales: -1 });
foodSchema.index({ categories: 1 });
foodSchema.index({ averageRating: -1 });

// Calculate average rating before saving
foodSchema.pre('save', function(next) {
  if (this.ratings.length > 0) {
    const sum = this.ratings.reduce((total, rating) => total + rating.rating, 0);
    this.averageRating = parseFloat((sum / this.ratings.length).toFixed(1));
  } else {
    this.averageRating = 0;
  }
  next();
});

// Virtual for rating count
foodSchema.virtual('ratingCount').get(function() {
  return this.ratings.length;
});

export default mongoose.models.food || mongoose.model("food", foodSchema);
