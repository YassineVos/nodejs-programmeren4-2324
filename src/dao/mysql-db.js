const pool = require("../../mysql-pool-example");
const logger = require("../util/logger");

const mysqlDb = {
  // Add a new user
  addUser(user, callback) {
    if (user.id !== undefined || user.isActive !== undefined) {
      return callback(
        new Error(
          "Invalid fields: 'id' or 'isActive' should not be manually set."
        ),
        null
      );
    }
    const sql = `
        INSERT INTO user 
        (firstName, lastName, emailAdress, password, phoneNumber, street, city, roles) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      user.firstName,
      user.lastName,
      user.emailAdress,
      user.password,
      user.phoneNumber,
      user.street,
      user.city,
      user.roles,
    ];
    pool.query(sql, values, (err, result) => {
      if (err) {
        callback(err, null);
      } else {
        user.id = result.insertId;
        user.isActive = true;
        callback(null, user);
      }
    });
  },

  // Retrieve all users
  getAll(filters, callback) {
    let sql = "SELECT * FROM user";
    const values = [];
    const conditions = [];

    if (filters) {
      const validFields = [
        "id",
        "firstName",
        "lastName",
        "emailAddress",
        "isActive",
      ]; // Define valid fields

      for (const field of Object.keys(filters)) {
        if (!validFields.includes(field)) {
          // This return effectively exits the function, preventing further execution
          return callback(new Error("Invalid field provided"), null);
        }

        let value = filters[field];

        // Check if the field is 'isActive' and translate true/false to 1/0
        if (field === "isActive") {
          value = value === "true" || value === true ? 1 : 0;
        }

        conditions.push(`${field} = ?`);
        values.push(value);
      }

      if (conditions.length > 0) {
        sql += " WHERE " + conditions.join(" AND ");
      }
    }

    pool.query(sql, values, (err, results) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, results);
      }
    });
  },

  // Get a single user by ID
  getUserById(id, callback) {
    pool.query("SELECT * FROM user WHERE id = ?", [id], (err, results) => {
      if (err) {
        callback(err, null);
      } else if (results.length === 0) {
        callback(
          {
            status: 404,
            message: `User with id ${id} not found.`,
          },
          null
        );
      } else {
        callback(null, results[0]);
      }
    });
  },

  // Update a user's information
  updateUser(id, newData, callback) {
    // First, check if the user exists
    this.getUserById(id, (err, user) => {
      if (err) {
        return callback(err, null);
      }

      if (!user) {
        // User does not exist
        return callback(
          { status: 404, message: `User with ID ${id} not found` },
          null
        );
      }

      // If user exists, continue with the update
      const sql = `
          UPDATE user
          SET firstName = ?, lastName = ?, emailAdress = ?, password = ?, phoneNumber = ?, roles = ?, street = ?, city = ?, isActive = ?
          WHERE id = ?
      `;
      const values = [
        newData.firstName,
        newData.lastName,
        newData.emailAdress,
        newData.password,
        newData.phoneNumber,
        newData.roles,
        newData.street,
        newData.city,
        newData.isActive,
        id,
      ];
      pool.query(sql, values, (err, result) => {
        if (err) {
          callback(err, null);
        } else {
          if (result.affectedRows) {
            callback(null, { id, ...newData });
          } else {
            callback(
              { status: 404, message: `User with ID ${id} not found` },
              null
            );
          }
        }
      });
    });
  },

  // Delete a user
  deleteUser(id, callback) {
    pool.query("DELETE FROM user WHERE id = ?", [id], (err, result) => {
      if (err) {
        // Check for foreign key constraint error
        if (err.code === "ER_ROW_IS_REFERENCED_2") {
          return callback(
            {
              status: 409, // Conflict
              message: `Cannot delete user with ID ${id} because of a foreign key conflict.`,
            },
            null
          );
        }
      } else {
        if (result.affectedRows) {
          callback(null, {
            message: `User with ID ${id} successfully deleted`,
          });
        } else {
          callback({ message: `User with ID ${id} not found` }, null);
        }
      }
    });
  },

  // Authenticate a user
  authenticateUser(email, password, callback) {
    pool.query(
      "SELECT * FROM user WHERE emailAdress = ? AND password = ?",
      [email, password],
      (err, results) => {
        if (err) {
          callback(err, null);
        } else {
          if (results.length > 0) {
            callback(null, results[0]);
          } else {
            callback({ message: "Authentication failed" }, null);
          }
        }
      }
    );
  },

  // Get a user with emailadress
  getUserByEmail: (email, callback) => {
    const sql = "SELECT * FROM user WHERE emailAdress = ?";
    pool.query(sql, [email], (err, results) => {
      if (err) {
        return callback(err, null);
      }
      // Check if any user was found
      if (results.length === 0) {
        // No user found, return null without an error
        return callback(null, null);
      }
      // Return the first user found
      callback(null, results[0]);
    });
  },

  getConnection: (callback) => {
    pool.getConnection((err, connection) => {
      if (err) {
        console.error("Error getting connection from pool", err);
        return callback(err, null);
      }
      callback(null, connection);
    });
  },

  //
  // Meal functions -------------------------------------------------------------------------------
  createMeal(meal, callback) {
    const sql = `
      INSERT INTO meal (name, description, isActive, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageUrl,  allergenes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      meal.name,
      meal.description,
      meal.isActive,
      meal.isVega,
      meal.isVegan,
      meal.isToTakeHome,
      meal.dateTime,
      meal.maxAmountOfParticipants,
      meal.price,
      meal.imageUrl,
      meal.allergenes,
      meal.cookId,
    ];
    pool.query(sql, values, (err, result) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, {
          id: result.insertId,
          ...meal,
        });
      }
    });
  },

  getAllMeals(callback) {
    const sql = "SELECT * FROM meal";
    pool.query(sql, (err, results) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, results);
      }
    });
  },

  getMealById(mealId, callback) {
    const sql = "SELECT * FROM meal WHERE id = ?";
    pool.query(sql, [mealId], (err, results) => {
      if (err) {
        console.error("Error executing query:", err); // Log the error
        return callback(err, null);
      }
      if (results.length === 0) {
        return callback(null, null); // No meal found
      }
      callback(null, results[0]); // Return the first meal found
    });
  },

  deleteMeal(mealId, callback) {
    const sql = "DELETE FROM meal WHERE id = ?";
    pool.query(sql, [mealId], (err, result) => {
      if (err) {
        callback(err, null);
      } else {
        if (result.affectedRows) {
          callback(null, {
            message: `Meal with ID ${mealId} deleted successfully`,
          });
        } else {
          callback(
            { status: 404, message: `Meal with ID ${mealId} not found` },
            null
          );
        }
      }
    });
  },
};

//

module.exports = mysqlDb;
//
