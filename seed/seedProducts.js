// require("dotenv").config();
// const mongoose = require("mongoose");
// const Discount = require("../models/discountModel");

// const discounts = [
//   { code: "ARTS10", discountPercent: 10, isActive: true },
//   { code: "ARTS20", discountPercent: 20, isActive: true },
//   { code: "ARTS30", discountPercent: 30, isActive: true },
//   { code: "SUMMER15", discountPercent: 15, isActive: true },
//   { code: "WINTER25", discountPercent: 25, isActive: false },
//   { code: "WELCOME5", discountPercent: 5, isActive: true },
//   { code: "HOLIDAY50", discountPercent: 50, isActive: false },
//   { code: "VIP30", discountPercent: 30, isActive: true },
//   { code: "FESTIVE40", discountPercent: 40, isActive: true },
//   { code: "NEWYEAR20", discountPercent: 20, isActive: true },
// ];

// const seedDB = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URI);
//     console.log("✅ MongoDB Connected");

//     // Clear existing discounts
//     await Discount.deleteMany({});
//     console.log("🗑️ Old discounts cleared");

//     // Insert new dummy discounts
//     await Discount.insertMany(discounts);
//     console.log("✅ Discounts inserted successfully");

//     mongoose.connection.close();
//   } catch (err) {
//     console.error("❌ Error seeding discounts:", err);
//   }
// };

// seedDB();

// seed/seedData.js

// seed/seedProducts.js

const axios = require("axios");
const products = require('./productsDummy.js');

const API_URL = "https://thecorporategirlieartsbackend.onrender.com/arts/products/addProducts";
const ADMIN_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NjY5ODAwMjAsImV4cCI6MTc2NzU4NDgyMH0.w0Uck6G-EJfPXGm-W6VMETS67R_mtQZuSGJwTbM8ePQ";

(async () => {
  console.log(`🚀 Seeding ${products.length} products`);

  for (let i = 0; i < products.length; i++) {
    try {
      const res = await axios.post(API_URL, products[i], {
        headers: {
          Authorization: `Bearer ${ADMIN_TOKEN}`,
          "Content-Type": "application/json",
        },
      });

      console.log(
        `✅ ${i + 1}. ${products[i].title} → ProductId:`,
        res.data.data.data.productId
      );
    } catch (err) {
      console.error(`❌ Failed at product ${i + 1}`);
      console.error(err.response?.data || err.message);
      process.exit(1);
    }
  }

  console.log("🎉 Seeding completed");
  process.exit(0);
})();
