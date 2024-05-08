require("dotenv").config();
const express = require("express");
const userRoutes = require("./src/routes/user.routes");
const {
  routes: authRoutes,
  validateToken,
} = require("./src/routes/authentication.routes");
const app = express();

app.use(express.json());

// Add authentication routes before other protected routes
app.use("/api", authRoutes);

// Public info endpoint
app.get("/api/info", (req, res) => {
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

module.exports = app;
