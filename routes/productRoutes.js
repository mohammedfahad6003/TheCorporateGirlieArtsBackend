const express = require("express");
const router = express.Router();
const Product = require("../models/productModel");
const guestTokenMiddleware = require("../middleware/guestToken");

router.use(guestTokenMiddleware);

/**
 * ✅ GET /arts/products
 * Supports:
 * - category (string)
 * - title (partial match)
 * - available (true | false)
 * - min, max (price range)
 * - sort (best-selling | low-to-high | high-to-low | newest)
 * - pagination (page, limit)
 *
 * Example:
 * /arts/products?category=Painting&title=classic&available=true&min=1000&max=6000&sort=low-to-high&page=1&limit=10
 */
router.get("/", async (req, res) => {
  try {
    const {
      category,
      title,
      available,
      min,
      max,
      sort,
      page = 1,
      limit,
    } = req.query;

    const filter = {};

    // 🎨 Category filter (supports single or multiple)
    if (category) {
      const categories = Array.isArray(category)
        ? category
        : category.split(",");
      filter.category = {
        $in: categories.map((c) => new RegExp(`^${c}$`, "i")),
      };
    }

    // 🔤 Title filter (case-insensitive search)
    if (title) {
      filter.title = { $regex: title, $options: "i" };
    }

    // 💰 Price range filter
    if (min && max) {
      filter.price = { $gte: Number(min), $lte: Number(max) };
    }

    // 🟢 Availability filter
    if (available !== undefined) {
      filter.isAvailable = available === "true";
    }

    // 🧭 Sorting logic
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
          query = query.sort({ createdAt: -1 });
          break;
        default:
          break;
      }
    } else {
      // Default sort — to maintain consistent ordering
      query = query.sort({ productId: 1 });
    }

    // 🔢 Total count for frontend
    const totalCount = await Product.countDocuments(filter);

    // 📄 Optional pagination
    if (limit) {
      const skip = (Number(page) - 1) * Number(limit);
      query = query.skip(skip).limit(Number(limit));
    }

    const products = await query;

    const pagination = {
      totalItems: totalCount,
      currentPage: Number(page),
      pageSize: limit ? Number(limit) : totalCount,
      totalPages: limit ? Math.ceil(totalCount / Number(limit)) : 1,
    };

    return res.status(200).json({
      data: {
        status: 200,
        guestToken: req.guestToken,
        pagination,
        data: products,
        message: "Products fetched successfully",
      },
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
    const product = await Product.findOne({ productId: req.params.id });

    if (!product) {
      return res.status(404).json({
        data: {
          status: 404,
          message: "Product not found",
        },
      });
    }

    return res.status(200).json({
      data: {
        status: 200,
        data: product,
        message: "Product fetched successfully",
      },
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Server error",
    });
  }
});

// ✅ Search suggestions API — LIKE search anywhere in title
router.get("/suggestions", async (req, res) => {
  try {
    const { query } = req.query;

    // ❌ Require minimum input length for performance
    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        status: 400,
        message: "Please provide at least 2 characters to search.",
      });
    }

    // 🔍 LIKE search (anywhere in title, case-insensitive)
    const regex = new RegExp(query.trim(), "i");

    // 🧠 Find top 5 products matching anywhere in title
    const suggestions = await Product.find(
      { title: { $regex: regex } },
      { productId: 1, title: 1, category: 1, _id: 0 }
    )
      .limit(7)
      .sort({ title: 1 }); // optional sorting alphabetically

    if (!suggestions.length) {
      return res.status(200).json({
        data: {
          status: 204,
          message: "No matching products found.",
          data: [],
        },
      });
    }

    return res.status(200).json({
      data: {
        status: 200,
        count: suggestions.length,
        data: suggestions,
        message: "Suggestions fetched successfully.",
      },
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Server error while fetching suggestions.",
    });
  }
});

module.exports = router;
