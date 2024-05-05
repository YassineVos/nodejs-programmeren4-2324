const { add } = require("../dao/inmem-db");
const userService = require("../services/user.service");

let userController = {
  add: (req, res, next) => {
    const user = req.body;
    userService.create(user, (error, success) => {
      if (error) {
        return res.status(error.status || 500).json({
          status: error.status || 500,
          message: error.message,
          data: {},
        });
      }
      res.status(200).json({
        status: 200,
        message: success.message,
        data: success.data,
      });
    });
  },

  getAll: (req, res, next) => {
    userService.getAll((error, success) => {
      if (error) {
        return next({
          status: error.status,
          message: error.message,
          data: {},
        });
      }
      if (success) {
        res.status(200).json({
          status: 200,
          message: success.message,
          data: success.data,
        });
      }
    });
  },

  getById: (req, res, next) => {
    const userId = req.params.userId;
    userService.getById(userId, (error, success) => {
      if (error) {
        return next({
          status: error.status,
          message: error.message,
          data: {},
        });
      }
      if (success) {
        res.status(200).json({
          status: success.status,
          message: success.message,
          data: success.data,
        });
      }
    });
  },

  // Todo: Implement the update and delete methods
};

module.exports = userController;
