const assert = require("assert");
const jwt = require("jsonwebtoken");
const jwtSecretKey = require("../util/config").secretkey;
const routes = require("express").Router();
const AuthController = require("../controllers/authentication.controller");
const logger = require("../util/logger");

function validateLogin(req, res, next) {
  try {
    assert(typeof req.body.emailAdress === "string", "email must be a string.");
    assert(typeof req.body.password === "string", "password must be a string.");
    next();
  } catch (ex) {
    next({
      status: 409,
      message: ex.toString(),
      data: {},
    });
  }
}

function validateToken(req, res, next) {
  logger.info("validateToken called");
  logger.trace("Headers:", req.headers);
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    logger.warn("Authorization header missing!");
    next({
      status: 401,
      message: "Authorization header missing!",
      data: {},
    });
  } else {
    const token = authHeader.substring(7, authHeader.length);

    jwt.verify(token, jwtSecretKey, (err, payload) => {
      if (err) {
        logger.warn("Not authorized");
        next({
          status: 401,
          message: "Not authorized!",
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
