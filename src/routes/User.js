const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const authController = require("../controllers/auth.controller");

router.post("/", userController.validateUser, userController.addUser);

router.get("/", authController.validateToken, userController.getAllUsers);

router.get(
  "/profile",
  authController.validateToken,
  userController.getUserProfile
);

router.get(
  "/:id",
  authController.validateToken,
  userController.validateId,
  userController.getUserById
);

router.put(
  "/:id",
  authController.validateToken,
  userController.validatePhoneNumber,
  userController.validateId,
  userController.validateUser,
  userController.updateUser
);

router.delete(
  "/:id",
  authController.validateToken,
  userController.validateId,
  userController.deleteUser
);

module.exports = router;
