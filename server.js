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

// CORS Setup
const allowedOrigins = [
  "http://localhost:2330",
  "https://thecorporategirliearts.netlify.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("❌ Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// Logger to debug origins
app.use((req, res, next) => {
  console.log("🌐 Origin:", req.headers.origin, "➡️ Path:", req.path);
  next();
});

// Body parser
app.use(express.json());

// Connect DB
connectDB();

// Root route
app.get("/", (req, res) => {
  res.send("Backend API is running 🚀");
});

// Testimonials API Route
app.use("/arts/feedback", feedbackRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);
