const express = require("express");
const mealController = require("../controllers/meal.controller");
const { validateToken } = require("./authentication.routes");
const router = express.Router();

// Middleware to validate meal creation and update requests

function validateMeal(req, res, next) {
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
    allergenes,
  } = req.body;

  if (
    !name ||
    !description ||
    isActive === undefined ||
    isVega === undefined ||
    isVegan === undefined ||
    isToTakeHome === undefined ||
    !dateTime ||
    !maxAmountOfParticipants ||
    price === undefined ||
    !imageUrl ||
    !allergenes
  ) {
    return res.status(400).json({
      status: 400,
      message:
        "Missing required fields: name, description, isActive, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageUrl, or allergenes",
      data: {},
    });
  }

  if (
    typeof name !== "string" ||
    typeof description !== "string" ||
    typeof isActive !== "boolean" ||
    typeof isVega !== "boolean" ||
    typeof isVegan !== "boolean" ||
    typeof isToTakeHome !== "boolean" ||
    typeof maxAmountOfParticipants !== "number" ||
    typeof price !== "number" ||
    typeof imageUrl !== "string" ||
    typeof allergenes !== "string"
  ) {
    return res.status(400).json({
      status: 400,
      message: "Invalid data types provided for fields",
      data: {},
    });
  }

  next();
}

// Routes
router.post("/", validateToken, validateMeal, mealController.createMeal); // UC-301
router.get("/", mealController.getAllMeals); // UC-303
router.get("/:mealId", mealController.getMealById); // UC-304
router.delete("/:mealId", validateToken, mealController.deleteMeal); // UC-305

module.exports = router;
