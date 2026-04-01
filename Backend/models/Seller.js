const mongoose = require('mongoose');

const sellerSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true
  },
  name: String,
  email: String,
  phone: String,
  company: {
    type: String,
    required: true
  },
  avatar: String,
  businessType: String,     // Manufacturer, Exporter, Wholesaler, etc.
  address: String,
  city: String,
  state: String,
  country: String,
  gstNumber: String,        // Optional but useful for Indian sellers
}, { timestamps: true });

module.exports = mongoose.model('Seller', sellerSchema);