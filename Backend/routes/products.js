// routes/products.js
const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const Seller = require("../models/Seller");        // ← Important: Add this
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { ClerkExpressRequireAuth } = require("@clerk/clerk-sdk-node");

// ================= CLOUDINARY =================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ================= MULTER =================
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// ================= AUTH =================
const requireAuth = ClerkExpressRequireAuth({
  onError: (err, req, res) => {
    console.error("Auth Error:", err);
    res.status(401).json({ error: "Unauthorized" });
  },
});

// ================= GET ALL PRODUCTS (with Seller Details) =================
router.get("/", async (req, res) => {
  try {
    const { category } = req.query;
    let query = {};

    if (category) {
      query.category = category.toLowerCase().trim();
    }

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    // Enrich products with Seller information
    const enrichedProducts = await Promise.all(
      products.map(async (product) => {
        const seller = await Seller.findOne({ clerkId: product.clerkId });

        return {
          ...product.toObject(),
          sellerName: seller?.name || "Unknown Seller",
          sellerCompany: seller?.company || product.supplierName || "Not Provided",
        };
      })
    );

    res.json(enrichedProducts);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ================= GET MY PRODUCTS =================
router.get("/my", requireAuth, async (req, res) => {
  try {
    const products = await Product.find({
      clerkId: req.auth.userId,
    }).sort({ createdAt: -1 });

    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ================= ADD PRODUCT =================
router.post("/", requireAuth, upload.array("images", 4), async (req, res) => {
  try {
    const { name, category, price, moq, description } = req.body;

    if (!name || !category || !price) {
      return res.status(400).json({ 
        error: "Required fields missing: name, category, price" 
      });
    }

    const clerkId = req.auth.userId;

    // Get seller info - First from Clerk metadata, then from Seller collection
    let supplierName = "Unknown Supplier";
    let supplierCompany = "";

    const metadata = req.auth.sessionClaims?.unsafeMetadata || {};
    
    if (metadata.company) {
      supplierCompany = metadata.company;
      supplierName = metadata.company;
    } else if (metadata.name) {
      supplierName = metadata.name;
    }

    // If still no company, fetch from Seller model
    if (!supplierCompany) {
      const seller = await Seller.findOne({ clerkId });
      if (seller) {
        supplierName = seller.name || "Unknown Seller";
        supplierCompany = seller.company || "";
      }
    }

    // Upload images to Cloudinary
    let imageUrls = [];
    if (req.files?.length > 0) {
      for (const file of req.files) {
        try {
          const result = await new Promise((resolve, reject) => {
            cloudinary.uploader
              .upload_stream({ resource_type: "auto" }, (err, result) => {
                if (err) reject(err);
                else resolve(result);
              })
              .end(file.buffer);
          });
          imageUrls.push(result.secure_url);
        } catch (uploadErr) {
          console.error("Cloudinary upload error:", uploadErr);
        }
      }
    }

    const product = new Product({
      clerkId,
      name: name.trim(),
      category: category.toLowerCase().trim(),
      price: Number(price),
      moq: moq ? Number(moq) : 100,
      description: description?.trim() || "",
      images: imageUrls,
      supplierName: supplierName,        // keeping for backward compatibility
    });

    await product.save();

    res.status(201).json(product);
  } catch (err) {
    console.error("Add Product Error:", err);
    if (err.name === "ValidationError") {
      return res.status(400).json({
        error: "Validation failed",
        details: Object.values(err.errors).map(e => e.message)
      });
    }
    res.status(500).json({ error: "Failed to add product", message: err.message });
  }
});

// ================= UPDATE & DELETE (unchanged) =================
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, clerkId: req.auth.userId },
      req.body,
      { new: true }
    );
    if (!product) return res.status(404).json({ error: "Not found" });
    res.json(product);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      clerkId: req.auth.userId,
    });
    if (!product) return res.status(404).json({ error: "Not found" });
    res.json({ message: "Deleted successfully" });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;