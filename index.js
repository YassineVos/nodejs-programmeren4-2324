require("dotenv").config();

const express = require("express");
const userRoutes = require("./src/routes/user.routes");

const app = express();

// express.json zorgt dat we de body van een request kunnen lezen
app.use(express.json());
app.use("/api", userRoutes);

const port = process.env.PORT || 3000;

app.all("*", (req, res, next) => {
  console.log("Request:", req.method, req.url);
  next();
});

app.get("/", function (req, res) {
  res.json({ message: "Hello World" });
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

// Hier komen alle routes
app.use(userRoutes);

// Hier komt de route error handler te staan!
app.use((req, res, next) => {
  next({
    status: 404,
    message: "Route not found",
    data: {},
  });
});

// Hier komt je Express error handler te staan!
app.use((error, req, res, next) => {
  res.status(error.status || 500).json({
    status: error.status || 500,
    message: error.message || "Internal Server Error",
    data: {},
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Deze export is nodig zodat Chai de server kan opstarten
module.exports = app;
