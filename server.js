require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const connectDB = require("./config/db");

const itemRoutes = require("./routes/itemRoutes");

const app = express();

// Security Middlewares
app.use(helmet()); // Protects against common vulnerabilities by setting HTTP headers
app.use(mongoSanitize()); // Prevents MongoDB injection attacks

// CORS (restrict only to your frontend)
app.use(cors({
  origin: "http://localhost:3000", // React frontend (change if deployed)
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// Body parser
app.use(express.json());

// Connect DB
connectDB();

// Routes
app.use("/api/items", itemRoutes);

app.get("/", (req, res) => {
  res.send("Backend API is running 🚀");
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
