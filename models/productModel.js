const mongoose = require("mongoose");
const Counter = require("./counterModel");

/* ============================
   🔧 SUB-SCHEMAS
============================ */

/**
 * Customization Option Schema
 * Amazon-style (size, text, gift wrap, etc.)
 */
const customizationOptionSchema = new mongoose.Schema(
  {
    /* 🔑 Stable key for frontend + cart */
    key: {
      type: String,
      required: true,
    },
    // e.g. "size", "name_text", "gift_wrap"

    /* 🏷 UI Label */
    label: {
      type: String,
      required: true,
    },

    /* 🧩 Input Type */
    type: {
      type: String,
      enum: ["select", "text", "boolean"],
      required: true,
    },

    /* ❗ Required or Optional */
    required: {
      type: Boolean,
      default: false,
    },

    /* 🔽 Only for SELECT type */
    options: [
      {
        label: {
          type: String,
        },
        value: {
          type: String,
        },
        priceDelta: {
          type: Number,
          default: 0,
        },
      },
    ],

    /* 💰 For text / boolean */
    priceDelta: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

/* ============================
   📦 PRODUCT SCHEMA
============================ */

const productSchema = new mongoose.Schema(
  {
    /* 🔢 AUTO-INCREMENT ID */
    productId: {
      type: Number,
      unique: true,
      index: true,
    },

    /* 🏷 BASIC INFO */
    title: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      required: true,
    },

    image: String,
    description: String,

    /* 🧪 MATERIALS & PROCESS */
    materialsAndProcess: {
      type: [String],
      default: [],
    },

    /* 🎨 CUSTOMIZATION */
    customizationAllowed: {
      type: Boolean,
      default: false,
    },

    customizationOptions: {
      type: [customizationOptionSchema],
      default: [],
    },

    /* 🔥 SALE */
    isSale: {
      type: Boolean,
      default: false,
    },

    saleDiscount: {
      type: Number,
      default: 0,
    },

    /* 🟢 FLAGS */
    isLatest: {
      type: Boolean,
      default: false,
    },

    mostSeller: {
      type: Boolean,
      default: false,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

/* ============================
   📌 INDEXES (PERFORMANCE)
============================ */
productSchema.index({ title: 1, isDeleted: 1 });
productSchema.index({ category: 1, isDeleted: 1 });
productSchema.index({ type: 1, isDeleted: 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });

/* ============================
   🔢 AUTO-INCREMENT LOGIC
============================ */
productSchema.pre("save", async function (next) {
  if (this.productId) return next();

  const counter = await Counter.findOneAndUpdate(
    { _id: "productId" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  this.productId = counter.seq;
  next();
});

module.exports = mongoose.model("Product", productSchema);
