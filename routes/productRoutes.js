const express = require("express");
const router = express.Router();
const Product = require("../models/productModel");
const guestTokenMiddleware = require("../middleware/guestToken");

router.use(guestTokenMiddleware);

/**
 * ✅ GET /arts/products
 * Supports:
 * - category (string)
 * - title (string)
 * - min, max (price range)
 * - sort (best-selling | low-to-high | high-to-low | newest)
 *
 * Example:
 * /arts/products?category=Painting&title=classic&min=1000&max=6000&sort=low-to-high
 */
router.get("/", async (req, res) => {
  try {
    const { category, title, min, max, sort } = req.query;

    const filter = {};

    // 🧩 Category filter
    if (category) {
      filter.category = new RegExp(`^${category}$`, "i");
    }

    // 🔤 Title filter (case-insensitive search)
    if (title) {
      filter.title = { $regex: title, $options: "i" };
    }

    // 💰 Price range filter
    if (min && max) {
      filter.price = { $gte: Number(min), $lte: Number(max) };
    }

    // 🧮 Build query
    let query = Product.find(filter);

    // 🧭 Sorting logic
    if (sort) {
      switch (sort) {
        case "best-selling":
          query = query.where("mostSeller").equals(true);
          break;
        case "low-to-high":
          query = query.sort({ price: 1 });
          break;
        case "high-to-low":
          query = query.sort({ price: -1 });
          break;
        case "newest":
          query = query.where("isLatest").equals(true).sort({ createdAt: -1 });
          break;
        default:
          break;
      }
    }

    const products = await query;

    return res.status(200).json({
      status: 200,
      guestToken: req.guestToken,
      data: products,
      message: "Products fetched successfully",
    });
  } catch (err) {
    console.error("Error fetching products:", err);
    return res.status(500).json({
      status: 500,
      message: "Server error while fetching products",
    });
  }
});

// ✅ Get a single product by ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res
        .status(404)
        .json({ status: 404, message: "Product not found" });

    return res.status(200).json({
      status: 200,
      data: product,
      message: "Product fetched successfully",
    });
  } catch (err) {
    return res.status(500).json({ status: 500, message: "Server error" });
  }
});

module.exports = router;
