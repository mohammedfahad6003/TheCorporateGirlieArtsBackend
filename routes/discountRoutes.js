const express = require("express");
const router = express.Router();
const Discount = require("../models/discountModel");
const guestTokenMiddleware = require("../middleware/guestToken");

router.use(guestTokenMiddleware);

router.get("/", async (req, res) => {
  try {
    const discounts = await Discount.find({ isActive: true });

    return res.status(200).json({
      status: 200,
      guestToken: req.guestToken,
      discounts,
      message: "Active discounts fetched successfully",
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Server error while fetching discounts",
    });
  }
});

// ✅ Validate discount
router.post("/validate", async (req, res) => {
  const { code } = req.body;

  try {
    const discount = await Discount.findOne({
      code: new RegExp(`^${code}$`, "i"),
      isActive: true,
    });

    if (!discount) {
      return res.status(400).json({
        status: 400,
        data: { valid: false, message: "Invalid or Inactive Discount code" },
      });
    }

    return res.status(200).json({
      status: 200,
      data: {
        valid: true,
        discount: {
          code: discount.code,
          discountPercent: discount.discountPercent,
        },
        message: "Discount code is valid",
      },
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      data: { valid: false, message: "Server error while validating discount" },
    });
  }
});

module.exports = router;
