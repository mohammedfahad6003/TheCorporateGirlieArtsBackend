require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const connectDB = require("./config/db");

const feedbackRoutes = require("./routes/testimonalRoutes");

const app = express();

// Security Middlewares
app.use(helmet());
app.use(compression());

// CORS
app.use(
  cors({
    origin: ["http://localhost:2330", "https://thecorporategirliearts.netlify.app/"],
    methods: ["GET", "POST", "PUT", "DELETE"]
  })
);

// Body parser
app.use(express.json());

// Connect DB
connectDB();

// Routes
app.get("/", (req, res) => {
  res.send("Backend API is running 🚀");
});

// Testimonials API Route
app.use("/arts/feedback", feedbackRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
