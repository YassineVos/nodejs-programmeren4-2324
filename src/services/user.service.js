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
};

module.exports = userService;
