const express = require("express");
const assert = require("assert");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { validateToken } = require("./authentication.routes");

// Validation middleware for user creation
const validateUserCreateAssert = (req, res, next) => {
  try {
    assert(req.body.emailAdress, "Missing email");
    assert(req.body.firstName, "Missing first name");
    assert(req.body.lastName, "Missing last name");

    // Validate email format
    assert(
      req.body.emailAdress.match(
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
      ),
      "Invalid email address"
    );

    // Validate phonenumber input to be 10 characters long
    assert(
      req.body.phoneNumber.length === 10,
      "Phone number must be 10 characters long"
    );

    // Validate password input to be at least 6 characters long
    assert(
      req.body.password.length >= 6,
      "Password must be at least 6 characters long"
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
//
// Define user routes
router.get("/user/getAll", validateToken, userController.getAll);
router.post("/user", validateUserCreateAssert, userController.add);
router.get("/user/profile", validateToken, userController.getProfile);
router.get("/user/:userId", validateToken, userController.getById);
router.put(
  "/user/:userId",
  validateUserCreateAssert,
  validateToken,
  userController.update
);
router.delete("/user/:userId", validateToken, userController.delete);

module.exports = router;
