const { update } = require("../controllers/user.controller");
const database = require("../dao/inmem-db");

const userService = {
  create: (user, callback) => {
    database.findByEmail(user.emailAdress, (err, existingUser) => {
      if (err) {
        return callback(err);
      }
      if (existingUser) {
        const error = new Error("User already exists");
        error.status = 400; // Set a specific status code for this error
        return callback(error); // Return this error with its status
      }

      // If no user exists with that email, proceed to add the new user
      database.add(user, (err, data) => {
        if (err) {
          return callback(err); // Ensure errors here are also properly handled
        }
        callback(null, {
          message: `User created with id ${data.id}.`,
          data: data,
        });
      });
    });
  },

  getAll: (callback) => {
    database.getAll((err, data) => {
      if (err) {
        callback(err, null);
      } else {
        console.log(data);
        callback(null, {
          message: `Found ${data.length} users.`,
          data: data,
        });
      }
    });
  },

  // Add the getById method to the userService object
  getById: (userId, callback) => {
    database.getById(userId, (err, data) => {
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
    database.update(id, updatedUser, (err, data) => {
      if (err) {
        callback(err, null);
      } else {
        if (data) {
          callback(null, {
            message: `User updated with id ${id}.`,
            data: data,
          });
        } else {
          callback(null, {
            message: `User not found with id ${id}.`,
            data: null,
          });
        }
      }
    });
  },

  // Add the delete method to the userService object
  delete: (userId, callback) => {
    database.delete(userId, (err, data) => {
      if (err) {
        callback(err, null);
      } else {
        if (data) {
          callback(null, {
            message: `User deleted with id ${userId}.`,
            data: data,
          });
        } else {
          callback(null, {
            message: `User not found with id ${userId}.`,
            data: null,
          });
        }
      }
    });
  },
};

module.exports = userService;
