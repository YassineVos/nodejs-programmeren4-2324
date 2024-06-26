// const { update } = require("../controllers/user.controller");
const database = require("../dao/mysql-db");

const userService = {
  create: (user, callback) => {
    database.getUserByEmail(user.emailAdress, (err, existingUser) => {
      if (err) {
        return callback(err);
      }
      if (existingUser) {
        const error = new Error("User already exists");
        error.status = 403; // Set a specific status code for this error
        return callback(error); // Return this error with its status
      }

      // If no user exists with that email, proceed to add the new user
      database.addUser(user, (err, data) => {
        if (err) {
          return callback(err); // Ensure errors here are also properly handled
        }
        callback(null, {
          status: 201,
          message: `User created with id ${data.id}.`,
          data: data,
        });
      });
    });
  },

  // user.service.js
  getAll: (filters, callback) => {
    database.getAll(filters, (err, data) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, {
          message: `Found ${data.length} users.`,
          data: data,
        });
      }
    });
  },

  // Add the getById method to the userService object
  getById: (userId, callback) => {
    database.getUserById(userId, (err, data) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, {
          message: `Found user with id ${userId}.`,
          data: data,
        });
      }
    });
  },

  update: (id, updatedUser, callback) => {
    database.updateUser(id, updatedUser, (err, data) => {
      if (err) {
        callback({ status: err.status || 500, message: err.message }, null);
      } else {
        if (data) {
          callback(null, {
            message: `User updated with id ${id}.`,
            data: data,
          });
        } else {
          callback(
            {
              status: 404,
              message: `User not found with id ${id}.`,
              data: null,
            },
            null
          );
        }
      }
    });
  },

  // Add the delete method to the userService object
  delete: (id, callback) => {
    database.getUserById(id, (err, user) => {
      if (err) {
        return callback({ status: 500, message: err.message }, null);
      }

      if (!user) {
        return callback(
          { status: 404, message: `User with ID ${id} not found` },
          null
        );
      }

      database.deleteUser(id, (err, data) => {
        if (err) {
          return callback({ status: 500, message: err.message }, null);
        }

        callback(null, {
          message: `User with id ${id} deleted.`,
          data: data,
        });
      });
    });
  },
};

module.exports = userService;
