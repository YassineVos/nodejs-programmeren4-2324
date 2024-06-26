const { parse } = require("dotenv");
const { add } = require("../dao/mysql-db");
const userService = require("../services/user.service");

let userController = {
  add: (req, res, next) => {
    const user = req.body;

    userService.create(user, (error, success) => {
      if (error) {
        return next({
          status: error.status,
          message: error.message,
          data: {},
        });
      }
      if (success) {
        res.status(201).json({
          status: success.status,
          message: success.message,
          data: success.data,
        });
      }
    });
  },

  // user.controller.js
  getAll: (req, res, next) => {
    // Extract filters from query parameters
    const filters = req.query;
    userService.getAll(filters, (error, success) => {
      if (error) {
        return next({
          status: error.status || 400,
          message: error.message || "Invalid query parameters",
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

  getById: (req, res, next) => {
    const userId = req.params.userId;
    userService.getById(userId, (error, success) => {
      if (error) {
        return next({
          status: error.status || 500,
          message: error.message || "An error occurred.",
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
    const userId = parseInt(req.params.userId, 10);
    const loggedInUserId = req.userId; // Get the logged-in user's ID from the request

    // Check if the user exists
    userService.getById(userId, (err, user) => {
      if (err) {
        return next({
          status: err.status || 500,
          message: err.message || "Internal Server Error",
          data: {},
        });
      }

      if (!user) {
        return next({
          status: 404,
          message: `User with ID ${userId} not found`,
          data: {},
        });
      }

      // Check if the user trying to update is the same as the user being updated
      if (userId !== loggedInUserId) {
        return next({
          status: 403, // Forbidden
          message: "You are not authorized to update this user.",
          data: {},
        });
      }

      const updatedUser = req.body;
      userService.update(userId, updatedUser, (error, success) => {
        if (error) {
          return next({
            status: error.status || 500,
            message: error.message || "Internal Server Error",
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
    });
  },

  delete: (req, res, next) => {
    const userId = parseInt(req.params.userId, 10);
    const loggedInUserId = req.userId; // Get the logged-in user's ID from the request

    // Check if the user exists
    userService.getById(userId, (err, user) => {
      if (err) {
        return next({
          status: err.status || 500,
          message: err.message || "Internal Server Error",
          data: {},
        });
      }

      if (!user) {
        return next({
          status: 404,
          message: `User with ID ${userId} not found`,
          data: {},
        });
      }

      // Check if the user trying to delete is the same as the user being deleted
      if (userId !== loggedInUserId) {
        return next({
          status: 403, // Forbidden
          message: "You are not authorized to delete this user.",
          data: {},
        });
      }

      userService.delete(userId, (error, success) => {
        if (error) {
          return next({
            status: error.status || 500,
            message: error.message || "Internal Server Error",
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
    });
  },

  getProfile: (req, res, next) => {
    const userId = req.userId;

    userService.getById(userId, (error, success) => {
      if (error) {
        return next({
          message: error.message,
          data: {},
        });
      }
      if (success) {
        res.status(200).json({
          status: 200,
          message: "User profile retrieved successfully",
          data: success.data,
        });
      }
    });
  },
};

module.exports = userController;
