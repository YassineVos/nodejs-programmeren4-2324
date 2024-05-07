const pool = require("./path-to/mysql-pool-example"); // Update this path to your actual pool file

const mysqlDb = {
  getAll(callback) {
    pool.query("SELECT * FROM users", (err, results) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, results);
      }
    });
  },

  getById(id, callback) {
    pool.query("SELECT * FROM users WHERE id = ?", [id], (err, results) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, results[0]);
      }
    });
  },

  add(item, callback) {
    const sql =
      "INSERT INTO users (firstName, lastName, emailAdress) VALUES (?, ?, ?)";
    const values = [item.firstName, item.lastName, item.emailAdress];
    pool.query(sql, values, (err, result) => {
      if (err) {
        callback(err, null);
      } else {
        // Return the item with the new ID assigned by the database
        item.id = result.insertId;
        callback(null, item);
      }
    });
  },

  findByEmail(email, callback) {
    pool.query(
      "SELECT * FROM users WHERE emailAdress = ?",
      [email],
      (err, results) => {
        if (err) {
          callback(err, null);
        } else {
          callback(null, results[0]);
        }
      }
    );
  },

  update(id, newData, callback) {
    const sql =
      "UPDATE users SET firstName = ?, lastName = ?, emailAdress = ? WHERE id = ?";
    const values = [
      newData.firstName,
      newData.lastName,
      newData.emailAdress,
      id,
    ];
    pool.query(sql, values, (err, result) => {
      if (err) {
        callback(err, null);
      } else {
        // If the update affects rows, it was successful
        if (result.affectedRows) {
          // Merge newData with id to simulate the updated object
          callback(null, { id, ...newData });
        } else {
          callback({ message: `Error: id ${id} does not exist!` }, null);
        }
      }
    });
  },

  delete(id, callback) {
    pool.query("DELETE FROM users WHERE id = ?", [id], (err, result) => {
      if (err) {
        callback(err, null);
      } else {
        if (result.affectedRows) {
          callback(null, { message: `Deleted user with id ${id}.` });
        } else {
          callback({ message: `Error: id ${id} does not exist!` }, null);
        }
      }
    });
  },
};

module.exports = mysqlDb;
