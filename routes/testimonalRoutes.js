const express = require("express");
const router = express.Router();
const Feedback = require("../models/testimonalModel");

router.get("/", async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.status(200).json({
      status: "success",
      data: feedbacks,
    });
  } catch (error) {
    console.error("Error fetching feedback:", error.message);
    res.status(500).json({
      status: "error",
      message: "Server Error",
    });
  }
});

module.exports = router;
