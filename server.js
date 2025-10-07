require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");

const feedbackRoutes = require("./routes/testimonalRoutes");
const discountRoutes = require("./routes/discountRoutes");

const app = express();

app.use(helmet());
app.use(compression());
app.use(cookieParser());

app.use(
  cors({
    origin: [
      "http://localhost:2330",
      "https://thecorporategirliearts.netlify.app",
    ],
    credentials: true,
  })
);

app.use(express.json());
connectDB();

app.get("/", (req, res) => {
  res.send("Backend API is running 🚀");
});

app.use("/arts/feedback", feedbackRoutes);
app.use("/arts/discounts", discountRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
