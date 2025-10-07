const mongoose = require("mongoose");

const discountSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },
    discountPercent: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Discount", discountSchema);
