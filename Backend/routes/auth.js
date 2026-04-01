const express = require('express');
const router = express.Router();
const Buyer = require('../models/Buyer');
const Seller = require('../models/Seller');
const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');

const authMiddleware = ClerkExpressRequireAuth({
  onError: (err, req, res) => res.status(401).json({ error: "Unauthorized" })
});





// ================= GET CURRENT USER =================
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const clerkId = req.auth.userId;
    const session = req.auth.sessionClaims;

    const role = session?.unsafeMetadata?.role || 'buyer';

    let user;

    if (role === 'seller') {
      user = await Seller.findOne({ clerkId });

      if (!user) {
        user = new Seller({
          clerkId,
          name: `${session?.firstName || ''} ${session?.lastName || ''}`,
          email: session?.email || "",
          phone: session?.unsafeMetadata?.phone || "",
          company: session?.unsafeMetadata?.company || "",
          avatar: session?.imageUrl || "",
        });
        await user.save();
      }
    } else {
      user = await Buyer.findOne({ clerkId });

      if (!user) {
        user = new Buyer({
          clerkId,
          name: `${session?.firstName || ''} ${session?.lastName || ''}`,
          email: session?.email || "",
          phone: session?.unsafeMetadata?.phone || "",
          company: session?.unsafeMetadata?.company || "",
          avatar: session?.imageUrl || "",
        });
        await user.save();
      }
    }

    res.json({
      success: true,
      role,
      user: {
        id: user._id,
        clerkId: user.clerkId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        company: user.company,
        role,
      }
    });

  } catch (error) {
    console.error("GET /me ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// ================= SET ROLE =================
router.post('/set-role', authMiddleware, async (req, res) => {
  try {
    const { clerkId, role, company, name, email, phone } = req.body;

    if (!clerkId || !role) {
      return res.status(400).json({ error: "Missing fields" });
    }

    if (role === 'seller') {
      let seller = await Seller.findOne({ clerkId });

      if (!seller) {
        seller = new Seller({
          clerkId,
          name,
          email,
          phone,
          company: company || "Not Provided",
        });
        await seller.save();
      }
    } else {
      let buyer = await Buyer.findOne({ clerkId });

      if (!buyer) {
        buyer = new Buyer({
          clerkId,
          name,
          email,
          phone,
          company: company || "",
        });
        await buyer.save();
      }
    }

    res.json({ success: true, message: "Role saved successfully" });

  } catch (error) {
    console.error("SET ROLE ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;