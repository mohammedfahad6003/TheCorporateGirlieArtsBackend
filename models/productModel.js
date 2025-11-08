const mongoose = require("mongoose");

const customizedOptionSchema = new mongoose.Schema(
  {
    option: { type: String, required: true },
    values: [{ type: String, required: true }],
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    image: { type: String },
    type: { type: String },
    category: {
      type: String,
      required: true,
      enum: ["resin", "painting", "home decor", "crafts"],
    },
    description: { type: String },
    isAvailable: { type: Boolean, default: true },
    details: [{ type: String }],
    customizationAllowed: { type: Boolean, default: false },
    customized_details: { type: String },
    customized_options: [customizedOptionSchema],
    isSale: { type: Boolean, default: false },
    saleDiscount: { type: Number, default: 0 },
    isLatest: { type: Boolean, default: false },
    mostSeller: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Product", productSchema);
