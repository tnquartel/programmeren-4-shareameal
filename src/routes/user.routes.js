const express = require("express");
const { validateId } = require("../controllers/user.controller");
const router = express.Router();
const userController = require("../controllers/user.controller");

router.get("/", (req, res) => {
  res.status(200).json({
    status: 200,
    result: "Hello World!",
  });
});

router.post("/api/user", userController.validateUser, userController.addUser);

router.get("/api/user", userController.getAllUsers);

router.get("/api/user/:id", userController.getUserById);

router.get("/api/profile", userController.getUserProfile);

router.put(
  "/api/user/:id",
  userController.validateId,
  userController.updateUser
);

router.delete(
  "/api/user/:id",
  userController.validateUser,
  userController.validateId,
  userController.deleteUser
);

module.exports = router;
