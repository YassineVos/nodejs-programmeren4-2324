const express = require("express");
const mealController = require("../controllers/meal.controller");
const { validateToken } = require("./authentication.routes");
const router = express.Router();

// Middleware to validate meal creation and update requests

const validateMeal = (req, res, next) => {
  const {
    name,
    description,
    isActive,
    isVega,
    isVegan,
    isToTakeHome,
    dateTime,
    maxAmountOfParticipants,
    price,
    imageUrl,
    cookId,
    allergenes,
  } = req.body;

  if (
    typeof name !== "string" ||
    typeof description !== "string" ||
    typeof isActive !== "boolean" ||
    typeof isVega !== "boolean" ||
    typeof isVegan !== "boolean" ||
    typeof isToTakeHome !== "boolean" ||
    isNaN(Date.parse(dateTime)) ||
    typeof maxAmountOfParticipants !== "number" ||
    typeof price !== "number" ||
    typeof imageUrl !== "string" ||
    typeof cookId !== "string" ||
    !Array.isArray(allergenes)
  ) {
    return res.status(400).json({
      status: 400,
      message: "Invalid data types for fields",
      data: {},
    });
  }

  next();
};

// Routes
router.post("/meal", validateToken, validateMeal, mealController.createMeal); // UC-301
router.get("/meal", mealController.getAllMeals); // UC-303
router.get("/meal/:mealId", mealController.getMealById); // UC-304
router.delete("/meal/:mealId", validateToken, mealController.deleteMeal); // UC-305

module.exports = router;
