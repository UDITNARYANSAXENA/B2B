// models/Product.js
const mongoose = require('mongoose');

const allowedCategories = [
  'medicine', 'cosmetics', 'personal-care', 'food', 'beverages', 
  'confectionery', 'daily-use', 'home-kitchen', 'construction', 
  'machinery', 'electrical', 'apparel', 'textiles', 'electronics', 
  'automotive', 'agriculture', 'packaging', 'pet-supplies'
];

const productSchema = new mongoose.Schema({
  clerkId: { 
    type: String, 
    required: true,
    index: true
  },

  // 🔥 ADD THIS (IMPORTANT)
  sellerName: {
    type: String,
    required: true
  },
  sellerCompany: {
    type: String,
    default: ''
  },

  name: { 
    type: String, 
    required: true,
    trim: true 
  },

  category: { 
    type: String, 
    required: true,
    enum: allowedCategories,
    lowercase: true,
    trim: true
  },

  price: { 
    type: Number, 
    required: true,
    min: 1 
  },

  moq: { 
    type: Number, 
    default: 100,
    min: 1 
  },

  description: { 
    type: String,
    trim: true,
    maxlength: 2000
  },

  images: [{ 
    type: String 
  }],

  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

productSchema.index({ category: 1 });
productSchema.index({ clerkId: 1 });

module.exports = mongoose.model('Product', productSchema);