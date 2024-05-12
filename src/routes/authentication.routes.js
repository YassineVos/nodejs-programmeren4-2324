const assert = require("assert");
const jwt = require("jsonwebtoken");
const jwtSecretKey = require("../util/config").secretkey;
const routes = require("express").Router();
const AuthController = require("../controllers/authentication.controller");
const logger = require("../util/logger");

function validateLogin(req, res, next) {
  try {
    // Check if email address is provided
    if (!req.body.emailAdress) {
      throw new Error("Email address is required");
    }
    // Check if email address is a string
    if (typeof req.body.emailAdress !== "string") {
      throw new Error("Email must be a string");
    }

    // Check if password is provided
    if (!req.body.password) {
      throw new Error("Password is required");
    }
    // Check if password is a string
    if (typeof req.body.password !== "string") {
      throw new Error("Password must be a string");
    }

    // If all checks pass, move to the next middleware
    next();
  } catch (ex) {
    next({
      status: 400, // Using HTTP 400 for bad request, as it's more appropriate for validation errors
      message: ex.message,
      data: {},
    });
  }
}

function validateToken(req, res, next) {
  logger.info("validateToken called");
  logger.trace("Headers:", req.headers);
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    logger.warn("No token provided!");
    next({
      status: 401,
      message: "No token provided!",
      data: {},
    });
  } else {
    const token = authHeader.substring(7, authHeader.length);

    jwt.verify(token, jwtSecretKey, (err, payload) => {
      if (err) {
        logger.warn("Token invalid!");
        next({
          status: 401,
          message: "Token invalid!",
          data: {},
        });
      }
      if (payload) {
        logger.debug("token is valid", payload);
        req.userId = payload.userId;
        next();
      }
    });
  }
}

routes.post("/login", validateLogin, AuthController.login);

module.exports = { routes, validateToken };
