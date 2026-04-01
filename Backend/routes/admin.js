// routes/admin.js
const express = require('express');
const router = express.Router();

const Product = require('../models/Product');
const Enquiry = require('../models/Enquiry');
const Seller = require('../models/Seller');

// ==================== ALL COMPANIES (Sellers) ====================
router.get('/companies', async (req, res) => {
  try {
    const companies = await Seller.find()
      .select('name company email phone gstNumber address city state country createdAt')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      companies: companies
    });
  } catch (err) {
    console.error("Error fetching companies:", err);
    res.status(500).json({ success: false, message: "Failed to fetch companies" });
  }
});

// Update Company
router.put('/companies/:id', async (req, res) => {
  try {
    const updatedCompany = await Seller.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedCompany) {
      return res.status(404).json({ success: false, message: "Company not found" });
    }

    res.json({ success: true, message: "Company updated", company: updatedCompany });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update company" });
  }
});

// ==================== ALL PRODUCTS (with Seller Name) ====================
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find()
      .populate({
        path: 'clerkId',           // We will use virtual or join Seller
        select: 'name company'
      })
      .sort({ createdAt: -1 });

    // Better approach: Manually enrich with Seller data
    const enrichedProducts = await Promise.all(
      products.map(async (product) => {
        const seller = await Seller.findOne({ clerkId: product.clerkId });
        return {
          ...product.toObject(),
          sellerName: seller?.name || "Unknown Seller",
          sellerCompany: seller?.company || product.supplierName || "Not Provided"
        };
      })
    );

    res.json({
      success: true,
      products: enrichedProducts
    });
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ success: false, message: "Failed to fetch products" });
  }
});

// Update Product
router.put('/products/:id', async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) return res.status(404).json({ success: false, message: "Product not found" });

    res.json({ success: true, message: "Product updated", product: updatedProduct });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update product" });
  }
});

// Delete Product (Already requested by you)
router.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    res.json({ success: true, message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete product" });
  }
});

// ==================== ALL ENQUIRIES ====================
router.get('/enquiries', async (req, res) => {
  try {
    const enquiries = await Enquiry.find()
      .populate({
        path: 'productId',
        select: 'name price category images clerkId'
      })
      .sort({ createdAt: -1 });

    // 🔥 Seller data attach karo
    const enriched = await Promise.all(
      enquiries.map(async (enq) => {
        let seller = null;

        if (enq.productId?.clerkId) {
          seller = await Seller.findOne({ clerkId: enq.productId.clerkId });
        }

        return {
          ...enq.toObject(),
          sellerName: seller?.name || "Unknown Seller",
          sellerEmail: seller?.email || "N/A",
          sellerCompany: seller?.company || "N/A",
        };
      })
    );

    res.json({
      success: true,
      enquiries: enriched
    });

  } catch (err) {
    console.error("Error fetching enquiries:", err);
    res.status(500).json({ success: false, message: "Failed to fetch enquiries" });
  }
});

module.exports = router;