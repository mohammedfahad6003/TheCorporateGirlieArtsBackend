const express = require("express");
const router = express.Router();
const Product = require("../models/productModel");
const guestTokenMiddleware = require("../middleware/guestToken");
const adminAuth = require("../middleware/adminAuth");
const { body, validationResult } = require("express-validator");

router.use(guestTokenMiddleware);

/* ============================
   🔍 SEARCH SUGGESTIONS (Public)
============================ */
router.get("/suggestions", async (req, res) => {
  try {
    const { search } = req.query;

    if (!search || search.trim().length < 2) {
      return res.status(400).json({
        status: 400,
        message: "Please provide at least 2 characters to search.",
      });
    }

    const regex = new RegExp(search.trim(), "i");

    const suggestions = await Product.find(
      { title: { $regex: regex }, isDeleted: false },
      { productId: 1, title: 1, category: 1, _id: 0 }
    )
      .sort({ title: 1 })
      .lean();

    return res.status(200).json({
      data: {
        status: suggestions.length ? 200 : 204,
        count: suggestions.length,
        data: suggestions,
        message: suggestions.length
          ? "Suggestions fetched successfully."
          : "No matching products found.",
      },
    });
  } catch {
    return res.status(500).json({
      status: 500,
      message: "Server error while fetching suggestions.",
    });
  }
});

/* ============================
   📦 GET ALL PRODUCTS (Public)
============================ */
router.get("/", async (req, res) => {
  try {
    const {
      category,
      title,
      type,
      available,
      min,
      max,
      sort,
      page = 1,
      limit,
    } = req.query;

    const filter = { isDeleted: false };

    if (category) {
      filter.category = {
        $in: category.split(",").map((c) => new RegExp(`^${c}$`, "i")),
      };
    }

    if (title) filter.title = { $regex: title, $options: "i" };

    if (type) {
      filter.type = {
        $in: type.split(",").map((t) => new RegExp(`^${t}$`, "i")),
      };
    }

    if (min && max) filter.price = { $gte: +min, $lte: +max };
    if (available !== undefined) filter.isAvailable = available === "true";

    let query = Product.find(filter).lean();

    if (sort === "best-selling") query.where("mostSeller").equals(true);
    if (sort === "low-to-high") query.sort({ price: 1 });
    if (sort === "high-to-low") query.sort({ price: -1 });
    if (sort === "newest") query.sort({ createdAt: -1 });
    if (!sort) query.sort({ productId: 1 });

    if (limit) {
      const skip = (Number(page) - 1) * Number(limit);
      query = query.skip(skip).limit(Number(limit));
    }

    const [products, total] = await Promise.all([
      query,
      Product.countDocuments(filter),
    ]);

    return res.status(200).json({
      data: {
        status: products.length ? 200 : 204,
        count: total,
        data: products,
        message: products.length
          ? "Products fetched successfully"
          : "No products found",
      },
      pagination: {
        totalItems: total,
        currentPage: +page,
        pageSize: +limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch {
    return res.status(500).json({
      status: 500,
      message: "Server error while fetching products",
    });
  }
});

/* ============================
   📄 GET PRODUCT BY ID
============================ */
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findOne({
      productId: req.params.id,
      isDeleted: false,
    }).lean();

    if (!product) {
      return res.status(404).json({
        data: { status: 404, message: "Product not found", data: [] },
      });
    }

    return res.status(200).json({
      data: {
        status: 200,
        data: product,
        message: "Product fetched successfully",
      },
    });
  } catch {
    return res.status(500).json({
      status: 500,
      message: "Server error while fetching product",
    });
  }
});

/* ============================
   ➕ ADD PRODUCT (ADMIN)
============================ */
router.post(
  "/addProducts",
  adminAuth,
  [
    body("title").notEmpty(),
    body("price").isFloat({ gt: 0 }),
    body("category").notEmpty(),
    body("type").notEmpty(),
    body("materialsAndProcess").isArray({ min: 1 }),
    body("image")
      .optional()
      .custom((value) => {
        try {
          new URL(value);
          return true;
        } catch {
          throw new Error("Invalid image URL");
        }
      }),

    /* 🎨 CUSTOMIZATION VALIDATION */
    body("customizationOptions").optional().isArray(),

    body("customizationOptions.*.key").optional().trim().notEmpty(),

    body("customizationOptions.*.label").optional().trim().notEmpty(),

    body("customizationOptions.*.type")
      .optional()
      .isIn(["select", "text", "number", "boolean"]),

    body("customizationOptions.*.required").optional().isBoolean(),

    body("customizationOptions.*.options").optional().isArray(),

    body("customizationOptions.*.options.*.label").optional().notEmpty(),

    body("customizationOptions.*.options.*.value").optional().notEmpty(),

    body("customizationOptions.*.options.*.priceDelta").optional().isFloat(),

    body("customizationOptions.*.priceDelta").optional().isFloat(),

    body("isSale").optional().isBoolean(),

    body("saleDiscount")
      .if(body("isSale").equals("true"))
      .isInt({ min: 1, max: 99 })
      .withMessage("saleDiscount must be between 1 and 99"),

    body("saleDiscount")
      .if(body("isSale").not().equals("true"))
      .custom((val) => val === undefined || val === 0)
      .withMessage("saleDiscount must be 0 when isSale is false"),
    body("isLatest").optional().isBoolean(),
    body("mostSeller").optional().isBoolean(),
    body("isAvailable").optional().isBoolean(),
  ],

  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          data: {
            status: 400,
            message: "Validation failed",
            errors: errors.array(),
          },
        });
      }

      const exists = await Product.findOne({
        title: new RegExp(`^${req.body.title}$`, "i"),
        isDeleted: false,
      });

      if (exists) {
        return res.status(400).json({
          data: { status: 400, message: "Product title already exists" },
        });
      }

      const { customizationOptions = [], ...safeBody } = req.body;

      safeBody.customizationAllowed = customizationOptions.length > 0;
      safeBody.customizationOptions = customizationOptions;
      safeBody.isDeleted = false;

      const product = new Product(safeBody);
      await product.save();

      return res.status(201).json({
        data: {
          status: 201,
          message: "Product added successfully",
          data: product,
        },
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        status: 500,
        message: "Server error while adding product",
      });
    }
  }
);

module.exports = router;
