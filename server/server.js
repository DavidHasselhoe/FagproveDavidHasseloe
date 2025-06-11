const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./routes/auth.routes");
const competitionsRoutes = require("./routes/competitions.routes");
const leaderboardRoutes = require("./routes/leaderboard.routes");
const toursRoutes = require("./routes/tours.routes");
const lotteryRoutes = require("./routes/lottery.routes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "../public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index/index.html"));
});
app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/register/register.html"));
});

//---API Routes with proper prefixes---//
app.use("/api/auth", authRoutes);
app.use("/api/competitions", competitionsRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/tours", toursRoutes);
app.use("/api/lottery", lotteryRoutes);

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/login/login.html"));
});
app.get("/competitions", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../public/competitions/competitions.html")
  );
});
app.get("/tours", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/tours/tours.html"));
});
app.get("/leaderboard", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/leaderboard/leaderboard.html"));
});
app.get("/lottery", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/lottery/lottery.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Database Admin: http://localhost:8080`);
});

module.exports = app;
