const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
//console.log("STRIPE_SECRET_KEY =", process.env.STRIPE_SECRET_KEY);
//console.log("STRIPE_PUBLISHABLE_KEY =", process.env.STRIPE_PUBLISHABLE_KEY);


const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const movieRoutes = require("./routes/movieRoutes");
const watchlistRoutes = require("./routes/watchlistRoutes");
const planRoutes = require("./routes/planRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const progressRoutes = require("./routes/progressRoutes");
const ratingRoutes = require("./routes/ratingRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

app.get("/", (req, res) => {
  res.json({
    message: "MiniFlix API is running."
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/watchlist", watchlistRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/notifications", notificationRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
