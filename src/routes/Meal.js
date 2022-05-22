const express = require("express");
const router = express.Router();
const mealController = require("../controllers/meal.controller");
const authController = require("../controllers/auth.controller");
const particpationController = require("../controllers/participation.controller");

router.get("/", mealController.getAllMeals);
router.get("/:id", mealController.validateId, mealController.getMealById);
router.post(
  "/",
  authController.validateToken,
  mealController.validateMeal,
  mealController.addMeal
);
router.put(
  "/:id",
  authController.validateToken,
  mealController.validateMeal,
  mealController.updateMeal
);
router.delete("/:id", authController.validateToken, mealController.deleteMeal);
router.get(
  "/:id/participate",
  authController.validateToken,
  particpationController.participateInAMeal
);

module.exports = router;
