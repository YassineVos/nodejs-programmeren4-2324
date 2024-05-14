const mealService = require("../services/meal.service");
const logger = require("../util/logger");

const mealController = {
  createMeal: (req, res, next) => {
    const userId = req.userId; // Extract userId from token (provided by validateToken)
    const meal = { ...req.body, cookId: userId }; // Include cookId in the meal
    mealService.createMeal(meal, (error, result) => {
      if (error) {
        return next({
          status: error.status || 500,
          message: error.message || "Internal Server Error",
          data: {},
        });
      }
      res.status(201).json({
        status: 201,
        message: "Meal created successfully",
        data: result,
      });
    });
  },

  getAllMeals: (req, res, next) => {
    mealService.getAllMeals((error, results) => {
      if (error) {
        return next({
          status: error.status || 500,
          message: error.message || "Internal Server Error",
          data: {},
        });
      }
      res.status(200).json({
        status: 200,
        message: "All meals retrieved successfully",
        data: results,
      });
    });
  },

  getMealById: (req, res, next) => {
    const mealId = parseInt(req.params.mealId, 10);
    mealService.getMealById(mealId, (error, result) => {
      if (error) {
        return next({
          status: error.status || 500,
          message: error.message || "Internal Server Error",
          data: {},
        });
      }

      if (!result) {
        return next({
          status: 404,
          message: `Meal with ID ${mealId} not found`,
          data: {},
        });
      }

      res.status(200).json({
        status: 200,
        message: `Meal with ID ${mealId} retrieved successfully`,
        data: result,
      });
    });
  },

  deleteMeal: (req, res, next) => {
    const mealId = parseInt(req.params.mealId, 10);
    const userId = req.userId; // Extract userId from token (provided by validateToken)
    logger.info(`User ${userId} is trying to delete meal ${mealId}`);

    mealService.getMealById(mealId, (error, meal) => {
      if (error) {
        return next({
          status: error.status || 500,
          message: error.message || "Internal Server Error",
          data: {},
        });
      }

      // Ensure that only the creator (cook) can delete their own meal
      if (meal.cookId !== userId) {
        return next({
          status: 403,
          message: "You are not authorized to delete this meal.",
          data: {},
        });
      }

      mealService.deleteMeal(mealId, (error, result) => {
        if (error) {
          return next({
            status: error.status || 500,
            message: error.message || "Internal Server Error",
            data: {},
          });
        }
        res.status(200).json({
          status: 200,
          message: result.message,
          data: {},
        });
      });
    });
  },
};

module.exports = mealController;
