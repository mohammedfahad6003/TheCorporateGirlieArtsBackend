const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();

// Generate token for admin (called when accessing /admin-products page)
router.post("/generateToken", (req, res) => {
  const { password } = req.body;

  // simple password check
  if (password !== process.env.ADMIN_PAGE_PASSWORD) {
    return res.status(401).json({ success: false, message: "Wrong password" });
  }

  const token = jwt.sign(
    { role: "admin" },
    process.env.ADMIN_JWT_SECRET,
    { expiresIn: "7d" } // token valid for 7 days
  );

  res.json({ success: true, token });
});

module.exports = router;
