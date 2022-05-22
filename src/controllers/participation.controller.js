const assert = require("assert");
const pool = require("../database/dbconnection");
const jwt = require("jsonwebtoken");
const controller = {
  participateInAMeal: (req, res, next) => {
    const mealId = req.params.id;
    const tokenString = req.headers.authorization.split(" ");
    const token = tokenString[1];
    const payload = jwt.decode(token);
    const userId = payload.userId;

    pool.query(
      `SELECT * FROM meal WHERE id = ${mealId}`,
      (err, result, fields) => {
        console.log(result);
        if (err) {
          const error = {
            status: 500,
            message: err.message,
          };
          next(error);
        } else if (result.length > 0) {
          //Meal exists
          const data = { mealId: mealId, userId: userId };
          pool.query(
            `SELECT * FROM meal_participants_user WHERE mealId= ${mealId} AND userId=${userId}`,
            (err, result) => {
              if (result.length > 0) {
                //User is already participating
                pool.query(
                  `DELETE FROM meal_participants_user WHERE mealId= ${mealId} AND userId=${userId}`,
                  (err, result) => {
                    res.status(200).json({
                      status: 200,
                      result: {
                        currentlyParticipating: false,
                      },
                    });
                  }
                );
              } else {
                //User is not participating
                pool.query(
                  `INSERT INTO meal_participants_user (mealId, userId) VALUES (${mealId}, ${userId})`,
                  data,
                  (err, result) => {
                    res.status(200).json({
                      status: 200,
                      result: {
                        currentlyParticipating: true,
                      },
                    });
                  }
                );
              }
            }
          );
        } else {
          //Meal does not exist
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
