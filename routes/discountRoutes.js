const express = require("express");
const router = express.Router();
const Discount = require("../models/discountModel");
const guestTokenMiddleware = require("../middleware/guestToken");

// Apply guestToken middleware to all routes
router.use(guestTokenMiddleware);

// ✅ Fetch all active discounts
router.get("/", async (req, res) => {
  try {
    const discounts = await Discount.find({ isActive: true });
    res.json({
      guestToken: req.guestToken,
      discounts,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error fetching discounts" });
  }
});

// ✅ Validate discount
router.post("/validate", async (req, res) => {
  const { code } = req.body;

  try {
    const discount = await Discount.findOne({ code, isActive: true });

    if (!discount) {
      return res
        .status(400)
        .json({ valid: false, message: "Invalid or Inactive Discount code" });
    }

    // If valid
    return res.json({
      valid: true,
      guestToken: req.guestToken,
      discount: {
        code: discount.code,
        discountPercent: discount.discountPercent,
      },
      message: "Discount code is valid",
    });
  } catch (err) {
    res.status(500).json({
      valid: false,
      message: "Server error while validating discount",
    });
  }
});

module.exports = router;
