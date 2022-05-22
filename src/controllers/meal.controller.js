const assert = require("assert");
const pool = require("../database/dbconnection");
const jwt = require("jsonwebtoken");

const controller = {
  validateMeal: (req, res, next) => {
    let user = req.body;
    let { name, description, price, maxAmountOfParticipants } = user;
    try {
      assert(typeof name === "string", "Name must be a string.");
      assert(typeof description === "string", "Description must be a string.");
      assert(typeof price === "number", "Price must be an integer.");
      assert(
        typeof maxAmountOfParticipants === "number",
        "maxAmountOfParticipants must be an integer"
      );
      next();
    } catch (err) {
      const error = {
        status: 400,
        message: err.message,
      };
      next(error);
    }
  },
  validateId: (req, res, next) => {
    const userId = req.params.id;
    try {
      assert(Number.isInteger(parseInt(userId)), "Id must be a number");
      next();
    } catch (err) {
      console.log(req.body);
      const error = {
        status: 400,
        message: err.message,
      };
      next(error);
    }
  },
  getAllMeals: (req, res, next) => {
    let meals = [];
    pool.query("SELECT * FROM meal", (err, result, fields) => {
      result.forEach((meal) => {
        meals.push(meal);
      });
      res.status(200).json({
        status: 200,
        result: meals,
      });
    });
  },
  //Details of meal
  getMealById: (req, res, next) => {
    const mealId = req.params.id;
    pool.query(
      `SELECT * FROM meal where id=${mealId}`,
      (err, result, fields) => {
        if (err) {
          const error = {
            status: 500,
            message: err.message,
          };
          next(error);
        } else if (result.length > 0) {
          res.status(200).json({
            status: 200,
            result: result[0],
          });
        } else {
          const error = {
            status: 404,
            message: "meal with provided id does not exist",
          };
          next(error);
        }
      }
    );
  },
  addMeal: (req, res, next) => {
    const meal = req.body;
    pool.query(`INSERT INTO meal SET ?`, meal, (err, result) => {
      if (err) {
        console.log(err.message);
        const error = {
          status: 409,
          message: "Meal has not been added",
          error: err.message,
        };
        next(error);
      } else {
        res.status(201).json({
          status: 201,
          result: { id: result.insertId, ...meal },
        });
      }
    });
  },
  updateMeal: (req, res, next) => {
    const meal = req.body;
    const mealId = req.params.id;
    const tokenString = req.headers.authorization.split(" ");
    const token = tokenString[1];
    const payload = jwt.decode(token);
    const userId = payload.userId;

    pool.query(
      `SELECT cookId FROM meal WHERE id = ${mealId}`,
      (err, result, fields) => {
        if (err) {
          const error = {
            status: 500,
            message: err.message,
          };
          next(error);
        }
        //Kijk of meal bestaat
        else if (result.length > 0) {
          //Kijk of meal van user is
          if (result[0].cookId == userId) {
            pool.query(
              `UPDATE meal SET isActive =${meal.isActive}, isVega=${meal.isVega}, isVegan=${meal.isVegan}, isToTakeHome=${meal.isToTakeHome},maxAmountOfParticipants=${meal.maxAmountOfParticipants}, price=${meal.price}, imageUrl='${meal.imageUrl}', cookId=${userId}, name='${meal.name}', description='${meal.description}', allergenes='${meal.allergenes}' WHERE id = ${mealId} `,
              (err, results) => {
                //Update meal
                res.status(200).json({
                  status: 200,
                  message: "Succusful update!",
                  result: meal,
                });
              }
            );
          } else {
            const error = {
              status: 403,
              message: "Cannot update a meal that is not yours!",
            };
            next(error);
          }
        } else {
          const error = {
            status: 404,
            message: "Meal with provided id does not exist",
          };
          next(error);
        }
      }
    );
  },
  deleteMeal: (req, res, next) => {
    const meal = req.body;
    const mealId = req.params.id;
    const tokenString = req.headers.authorization.split(" ");
    const token = tokenString[1];
    const payload = jwt.decode(token);
    const userId = payload.userId;

    pool.query(
      `SELECT cookId FROM meal WHERE id = ${mealId}`,
      (err, result, fields) => {
        if (err) {
          const error = {
            status: 500,
            message: err.message,
          };
          next(error);
        }
        //Kijk of meal bestaat
        else if (result.length > 0) {
          //Kijk of meal van user is
          console.log(result.length);
          if (result[0].cookId == userId) {
            pool.query(
              `DELET FROM meal WHERE id = ${mealId} `,
              (err, results) => {
                //Update meal
                res.status(200).json({
                  status: 200,
                  result: "Succusful deletion!",
                });
              }
            );
          } else {
            const error = {
              status: 403,
              message:
                "You are not the owner of this meal therefore you can't delete it",
            };
            next(error);
          }
        } else {
          const error = {
            status: 404,
            message: "Meal with provided id does not exist",
          };
          next(error);
        }
      }
    );
  },
};

module.exports = controller;
