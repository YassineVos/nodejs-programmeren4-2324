const mysqlDb = require("../dao/mysql-db");

const mealService = {
  createMeal: (meal, callback) => {
    mysqlDb.createMeal(meal, (err, result) => {
      if (err) {
        callback({ status: 500, message: err.message }, null);
      } else {
        callback(null, result);
      }
    });
  },

  getAllMeals: (callback) => {
    mysqlDb.getAllMeals((err, results) => {
      if (err) {
        callback({ status: 500, message: err.message }, null);
      } else {
        callback(null, results);
      }
    });
  },

  getMealById: (mealId, callback) => {
    mysqlDb.getMealById(mealId, (err, result) => {
      if (err) {
        return callback({ status: 500, message: err.message }, null);
      }
      if (!result) {
        return callback(
          { status: 404, message: `Meal with ID ${mealId} not found` },
          null
        );
      }
      callback(null, result);
    });
  },
  deleteMeal: (mealId, callback) => {
    mysqlDb.deleteMeal(mealId, (err, result) => {
      if (err) {
        callback({ status: 500, message: err.message }, null);
      } else {
        callback(null, result);
      }
    });
  },
};

module.exports = mealService;
