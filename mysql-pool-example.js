const mysql = require("mysql2");
const logger = require("../nodejs-programmeren4-2324/src/util/logger");
require("dotenv").config();

// Set the log level to the value of the LOG_LEVEL environment variable
// Only here to show how to set the log level
const tracer = require("tracer");
tracer.setLevel(process.env.LOG_LEVEL);

// Hier worden de db connection settings opgehaald uit de .env file
const dbConfig = {
  connectionLimit: 10,
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_DATABASE || "share-a-meal",
};

logger.trace(dbConfig);

// Hier wordt de pool aangemaakt
const pool = mysql.createPool(dbConfig);

//
// Hier worden de events van de pool gelogd, zodat je kunt zien wat er gebeurt
//
pool.on("connection", function (connection) {
  logger.trace(
    `Connected to database '${connection.config.database}' on '${connection.config.host}:${connection.config.port}'`
  );
});

pool.on("acquire", function (connection) {
  logger.trace("Connection %d acquired", connection.threadId);
});

pool.on("release", function (connection) {
  logger.trace("Connection %d released", connection.threadId);
});

// Hier wordt de query gedefinieerd met behulp van ? placeholders (prepared statement)
queryString = "SELECT * FROM `user` WHERE `firstName` = ? AND `id` > ?";
name = "Herman";
isActive = 1;

// use the pool to get one connection from the pool
pool.getConnection(function (err, connection) {
  if (err) {
    logger.error(err);
    // in je server: next(err)!
    return 1; // exit the program, alleen hier omdat het een voorbeeld is
  }

  // Use the connection to execute a query
  connection.query(
    queryString,
    [name, isActive],
    function (error, results, fields) {
      // When done with the connection, release it.
      connection.release();

      // Handle error after the release.
      if (err) {
        logger.error(err);
        // in je server: next(err)!
        return 1; // exit the program, alleen hier omdat het een voorbeeld is
      }

      logger.debug("#results = ", results.length);
      logger.debug({
        statusCode: 200,
        results: results,
      });
    }
  );
});

// Export the pool, so that testcases can use it
module.exports = pool;
