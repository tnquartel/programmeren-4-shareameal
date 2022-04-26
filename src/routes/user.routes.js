const express = require("express");
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

router.get("/api/user/:userId", userController.getUserById);

router.get("/api/user/profile/:userId", userController.getUserProfile);

router.put("/api/user/:userId", userController.updateUser);

router.delete("/api/user/:userId", userController.deleteUser);

module.exports = router;
