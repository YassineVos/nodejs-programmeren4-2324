const express = require("express");
const assert = require("assert");
const chai = require("chai");
chai.should();
const router = express.Router();
const userController = require("../controllers/user.controller");
const AuthController = require("../controllers/authentication.controller");

// Tijdelijke functie om niet bestaande routes op te vangen
const notFound = (req, res, next) => {
  res.status(404).json({
    status: 404,
    message: "Route not found",
    data: {},
  });
};

// Input validation function 2 met gebruik van assert
const validateUserCreateAssert = (req, res, next) => {
  try {
    assert(req.body.emailAdress, "Missing email");
    assert(req.body.firstName, "Missing first name");
    assert(req.body.lastName, "Missing last name");

    //validate email format
    assert(
      req.body.emailAdress.match(
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
      ),
      "Invalid email address"
    );

    next();
  } catch (ex) {
    return res.status(400).json({
      status: 400,
      message: ex.message,
      data: {},
    });
  }
};

// Userroutes
router.post("/api/user", validateUserCreateAssert, userController.add);
router.get("/api/user", userController.getAll);
router.get("/api/user/:userId", userController.getById);

// Tijdelijke routes om niet bestaande routes op te vangen
router.put("/api/user/:userId", userController.update);
router.delete("/api/user/:userId", userController.delete);

// router.post("/api/login", AuthController.login);

module.exports = router;
