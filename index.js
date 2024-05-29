require("dotenv").config();
const logger = require("./src/util/logger");

const express = require("express");
const userRoutes = require("./src/routes/user.routes");
const {
  routes: authRoutes,
  validateToken,
} = require("./src/routes/authentication.routes");
const mealRoutes = require("./src/routes/meal.routes");
const app = express();

// express.json zorgt dat we de body van een request kunnen lezen
app.use(express.json());

// Add authentication routes before other protected routes
app.use("/api", authRoutes);
app.use("/api", mealRoutes);
app.use("/api", userRoutes);

app.use(validateToken);

app.get("/", function (req, res) {
  res.json({ message: "Hello World" });
});

app.all("*", (req, res, next) => {
  console.log("Request:", req.method, req.url);
  next();
});

app.get("/api/info", (req, res) => {
  console.log("GET /api/info");
  const info = {
    studentName: "Yessin Boukrach",
    studentNumber: "2206857",
    description: "This is the API for the Share a Meal app.",
  };
  res.json(info);
});

// Error handler for undefined routes
app.use((req, res, next) => {
  next({
    status: 404,
    message: "Route not found",
    data: {},
  });
});

// General Express error handler
app.use((error, req, res, next) => {
  res.status(error.status || 500).json({
    status: error.status || 500,
    message: error.message || "Internal Server Error",
    data: {},
  });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Export for Chai to start the server
module.exports = app;
