require("dotenv").config();
const mongoose = require("mongoose");
const Discount = require("./models/discountModel");

const discounts = [
  { code: "ARTS10", discountPercent: 10, isActive: true },
  { code: "ARTS20", discountPercent: 20, isActive: true },
  { code: "ARTS30", discountPercent: 30, isActive: true },
  { code: "SUMMER15", discountPercent: 15, isActive: true },
  { code: "WINTER25", discountPercent: 25, isActive: false },
  { code: "WELCOME5", discountPercent: 5, isActive: true },
  { code: "HOLIDAY50", discountPercent: 50, isActive: false },
  { code: "VIP30", discountPercent: 30, isActive: true },
  { code: "FESTIVE40", discountPercent: 40, isActive: true },
  { code: "NEWYEAR20", discountPercent: 20, isActive: true },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");

    // Clear existing discounts
    await Discount.deleteMany({});
    console.log("🗑️ Old discounts cleared");

    // Insert new dummy discounts
    await Discount.insertMany(discounts);
    console.log("✅ Discounts inserted successfully");

    mongoose.connection.close();
  } catch (err) {
    console.error("❌ Error seeding discounts:", err);
  }
};

seedDB();
