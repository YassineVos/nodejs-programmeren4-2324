const pool = require("../../mysql-pool-example");

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
        (firstName, lastName, emailAdress, password, phoneNumber, roles, street, city) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      user.firstName,
      user.lastName,
      user.emailAdress,
      user.password,
      user.phoneNumber,
      user.roles,
      user.street,
      user.city,
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
  getAll(callback) {
    pool.query("SELECT * FROM user", (err, results) => {
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
      } else {
        callback(null, results[0]);
      }
    });
  },

  // Update a user's information
  updateUser(id, newData, callback) {
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
          callback({ message: `User with ID ${id} not found` }, null);
        }
      }
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
};

module.exports = mysqlDb;
