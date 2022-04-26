const assert = require("assert");
let database = [];
let id = 0;

let controller = {
  validateUser: (req, res, next) => {
    let user = req.body;
    let { firstName, lastName, emailAdress, password } = user;
    try {
      assert(typeof firstName === "string", "First name must be a string");
      assert(typeof lastName === "string", "Last name must be a string");
      assert(typeof emailAdress === "string", "Email address must be a string");
      assert(typeof password === "string", "Password must be a string");
      next();
    } catch (err) {
      console.log(err);
      res.status(400).json({
        status: 400,
        result: err.toString(),
      });
    }
    next();
  },
  addUser: (req, res) => {
    const result = database.filter(
      (user) => user.emailaddress == req.body.emailaddress
    );
    if (result.length > 0) {
      res.status(409).json({
        message:
          "User was not added to database, because the email adress is already in use",
      });
    } else {
      let user = req.body;
      id++;
      user = {
        id,
        firstName: user.firstName,
        lastName: user.lastName,
        street: user.street,
        city: user.city,
        emailAdress: user.emailAdress,
        phoneNumber: user.phoneNumber,
        password: user.password,
        roles: user.roles,
      };
      console.log(user);
      database.push(user);
      res.status(201).json({
        status: 201,
        result: database,
      });
    }
  },
  getAllUsers: (req, res) => {
    res.status(200).json({
      status: 200,
      result: database,
    });
  },
  getUserById: (req, res) => {
    const userId = req.params.userId;
    console.log(`User met ID ${userId} gezocht`);
    let user = database.filter((item) => item.id == userId);
    if (user.length > 0) {
      console.log(user);
      res.status(200).json({
        status: 200,
        result: user,
      });
    } else {
      res.status(401).json({
        status: 401,
        result: `User with ID ${userId} not found`,
      });
    }
  },
  getUserProfile: (req, res) => {
    const userId = req.params.userId;
    console.log(`User met ID ${userId} gezocht`);
    let user = database.filter((item) => item.id == userId);
    if (user.length > 0) {
      console.log(user);
      res.status(401).json({
        status: 401,
        result: `Feature not realised yet`,
      });
    } else {
      res.status(401).json({
        status: 401,
        result: `User with ID ${userId} not found, and this feature is not yet realised`,
      });
    }
  },
  updateUser: (req, res) => {
    const userId = req.params.userId;
    console.log(`User met ID ${userId} gezocht`);
    const result = database.findIndex((user) => user.id == userId);
    if (result > -1) {
      let user = req.body;
      database[result] = {
        id: userId,
        firstName: user.firstName,
        lastName: user.lastName,
        street: user.street,
        city: user.city,
        emailAdress: user.emailAdress,
        phoneNumber: user.phoneNumber,
        password: user.password,
        roles: user.roles,
      };
      res.status(201).json({
        status: 201,
        result: database[result],
      });
    } else {
      res.status(401).json({
        status: 401,
        result: `User with ID ${userId} not found`,
      });
    }
  },
  deleteUser: (req, res) => {
    const userId = req.params.userId;
    console.log(`User met ID ${userId} gezocht`);
    let user = database.filter((item) => item.id == userId);
    if (user.length > 0) {
      console.log(user);
      database.splice(userId - 1, 1);
      res.status(200).json({
        status: 200,
        result: `User with ID ${userId} succesfully deleted`,
      });
    } else {
      res.status(401).json({
        status: 401,
        result: `User with ID ${userId} not found`,
      });
    }
  },
};
module.exports = controller;
