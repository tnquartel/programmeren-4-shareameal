const assert = require("assert");
const pool = require("../database/dbconnection");
const jwt = require("jsonwebtoken");

let controller = {
  validateUser: (req, res, next) => {
    let user = req.body;
    let {
      firstName,
      lastName,
      street,
      city,
      isActive,
      emailAdress,
      phoneNumber,
      password,
    } = user;
    try {
      assert(typeof firstName === "string", "Firstname must be a string");
      assert(typeof lastName === "string", "LastName must be a string");
      assert(typeof street === "string", "Street must be a string");
      assert(typeof city === "string", "City must be a string");
      // assert(typeof isActive === "number", "IsActive must be a number");
      assert(typeof emailAdress === "string", "EmailAddress must be a string");
      assert(typeof phoneNumber === "string", "PhoneNumber must be a string");
      assert(typeof password === "string", "Password must a string");
      const pattern = /[a-z0-9]+@[a-z]+\.[a-z]{2,5}/;
      assert(pattern.test(req.body.emailAdress), "EmailAdress is not valid");
      next();
    } catch (err) {
      const error = {
        status: 400,
        result: err.message,
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
  validatePhoneNumber: (req, res, next) => {
    const phoneNumber = req.body.phoneNumber;
    try {
      assert(
        phoneNumber.length <= 11 && phoneNumber.length >= 8,
        "Length of a phone number can only be between 8 and 11"
      );
      next();
    } catch (error) {
      const err = {
        status: 400,
        message: error.message,
      };
      next(err);
    }
  },
  addUser: (req, res, next) => {
    const user = req.body;
    pool.query("INSERT INTO user SET ?", user, (dbError, result) => {
      if (dbError) {
        console.log(dbError.message);
        const error = {
          status: 409,
          message: "User has not been added",
        };
        next(error);
      } else {
        res.status(201).json({
          status: 201,
          message: "User is toegevoegd in database",
          result: { id: result.insertId, ...user },
        });
      }
    });
  },
  getAllUsers: (req, res) => {
    const queryParams = req.query;

    let { firstName, isActive } = queryParams;
    let queryString = "SELECT * FROM user";
    if (firstName || isActive) {
      queryString += " WHERE ";
      if (firstName) {
        queryString += `firstName LIKE '${firstName}%'`;
      }
      if (firstName && isActive) {
        queryString += " AND ";
      }
      if (isActive) {
        queryString += `isActive = ${isActive}`;
      }
    }
    queryString += ";";
    let users = [];

    pool.query(queryString, (error, results, fields) => {
      results.forEach((user) => {
        users.push(user);
      });
      res.status(200).json({
        status: 200,
        result: users,
      });
    });
  },
  getUserById: (req, res, next) => {
    const userId = req.params.id;
    pool.query(
      `SELECT * FROM user WHERE id =${userId}`,
      (err, results, fields) => {
        const user = results[0];
        if (err) {
          const error = {
            status: 500,
            message: err.message,
          };
          next(error);
        } else if (user != null) {
          res.status(200).json({
            status: 200,
            result: user,
          });
        } else {
          const error = {
            status: 404,
            message: "User with provided Id does not exist",
          };
          next(error);
        }
      }
    );
  },
  getUserProfile: (req, res, next) => {
    const tokenString = req.headers.authorization.split(" ");
    const token = tokenString[1];
    const payload = jwt.decode(token);
    const userId = payload.userId;

    pool.query(
      `SELECT id, firstName, lastName, emailAdress FROM user where id=${userId}`,
      (err, results, fields) => {
        if (err) {
          const error = {
            status: 500,
            message: err.message,
          };
          next(error);
        } else if (!(results.length > 0)) {
          const error = {
            status: 404,
            message: "User does not exist",
          };
          next(error);
        } else {
          res.status(200).json({
            status: 200,
            results: results,
          });
        }
      }
    );
  },
  updateUser: (req, res, next) => {
    const userId = req.params.id;
    const tokenString = req.headers.authorization.split(" ");
    const token = tokenString[1];
    const payload = jwt.decode(token);
    const userIdToken = payload.userId;

    if (userId == userIdToken) {
      const user = req.body;
      pool.query(
        `UPDATE user SET firstName = '${user.firstName}', lastName = '${user.lastName}', street = '${user.street}', city = '${user.city}', emailAdress = '${user.emailAdress}', password = '${user.password}' WHERE id = ${userId}`,
        (err, results) => {
          const { affectedRows } = results;

          if (err) {
            const error = {
              status: 500,
              message: err.message,
            };
            next(error);
          } else if (affectedRows == 0) {
            const error = {
              status: 400,
              message: "User with provided id does not exist",
            };
            next(error);
          } else {
            res.status(200).json({ status: 200, result: "Succusful update!" });
          }
        }
      );
    } else {
      const error = {
        status: 403,
        message: "You cannot update an account that is not yours!",
      };
      next(error);
    }
  },
  deleteUser: (req, res, next) => {
    const userId = req.params.id;
    const tokenString = req.headers.authorization.split(" ");
    const token = tokenString[1];
    const payload = jwt.decode(token);
    const userIdToken = payload.userId;

    if (userId == userIdToken) {
      pool.query(`DELETE FROM user WHERE id=${userId}`, (err, results) => {
        const { affectedRows } = results;
        if (err) {
          const error = {
            status: 500,
            message: err.message,
          };
          next(error);
        } else if (!affectedRows) {
          const error = {
            status: 400,
            message: "User does not exist",
          };
          next(error);
        } else {
          res.status(200).json({ status: 200, message: "Succesful deletion" });
        }
      });
    } else {
      const error = {
        status: 403,
        message: "You cannot delete an account that is not yours!",
      };
      next(error);
    }
  },
};

module.exports = controller;
