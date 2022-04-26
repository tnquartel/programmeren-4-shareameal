const express = require("express");
const router = express.Router();

let database = [];
let id = 0;

router.get("/", (req, res) => {
  res.status(200).json({
    status: 200,
    result: "Hello World!",
  });
});

router.post("/api/user", (req, res) => {
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
      phonenNumber: user.phoneNumber,
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
});

router.get("/api/user", (req, res, next) => {
  res.status(200).json({
    status: 200,
    result: database,
  });
});

router.get("/api/user/:userId", (req, res, next) => {
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
});

router.get("/api/user/profile/:userId", (req, res, next) => {
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
});

router.put("/api/user/:userId", (req, res, next) => {
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
});

router.delete("/api/user/:userId", (req, res, next) => {
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
});

module.exports = router;
