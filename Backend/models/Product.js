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
    trim: true,
    lowercase: true,
    // Enum hataya nahi → validation dynamically karenge
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

// Dynamic Category Validation (Pre-save hook)
productSchema.pre('save', async function(next) {
  const Category = mongoose.model('Category');
  
  const isInAllowed = allowedCategories.includes(this.category);
  const existsInDB = await Category.exists({ name: this.category });

  if (!isInAllowed && !existsInDB) {
    return next(new Error(`Invalid category: "${this.category}". Allowed categories ya admin se add kiye gaye categories hi use kar sakte ho.`));
  }
  next();
});

productSchema.index({ category: 1 });
productSchema.index({ clerkId: 1 });

module.exports = mongoose.model('Product', productSchema);