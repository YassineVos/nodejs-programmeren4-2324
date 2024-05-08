const { add } = require("../dao/mysql-db");
const userService = require("../services/user.service");

let userController = {
  add: (req, res, next) => {
    const user = req.body;
    //
    // Todo: Validate user input
    //
    userService.create(user, (error, success) => {
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
  update: (req, res, next) => {
    const userId = req.params.userId;
    const updatedUser = req.body;

    userService.update(userId, updatedUser, (error, success) => {
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

  delete: (req, res, next) => {
    const userId = req.params.userId;
    userService.delete(userId, (error, success) => {
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
};

module.exports = userController;
