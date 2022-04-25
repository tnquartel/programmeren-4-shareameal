const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

const bodyParser = require("body-parser");
app.use(bodyParser.json());

let database = [];
let id = 0;

app.all("*", (req, res, next) => {
  const method = req.method;
  console.log(`Method ${method} is aangeroepen`);
  next();
});

app.get('/', (req, res) => {
  res.status(200).json({
    status: 200,
    result: 'Hello World!',
  });
});

app.post("/api/user", (req, res) => {
  const result = database.filter(
    (user) => user.emailaddress == req.body.emailaddress
  );
  if (result.length > 0) {
    res.status(409).json({
      message: "User was not added to database, because the email adress is already in use",
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

app.get("/api/user", (req, res, next) => {
  res.status(200).json({
    status: 200,
    result: database,
  });
});

app.get("/api/user/:userId", (req, res, next) => {
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

app.get("/api/user/profile/:userId", (req, res, next) => {
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

app.put("/api/user/:userId", (req, res, next) => {
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

app.delete("/api/user/:userId", (req, res, next) => {
  const userId = req.params.userId;
  console.log(`User met ID ${userId} gezocht`);
  let user = database.filter((item) => item.id == userId);
  if (user.length > 0) {
    console.log(user);
    database.splice(userId - 1, 1);
    res.status(200).json({
      status: 200,
      result: `User with ID ${userId} succesfully deleted`
    });
  } else {
    res.status(401).json({
      status: 401,
      result: `User with ID ${userId} not found`,
    });
  }
});

app.all("*", (req, res) => {
  res.status(401).json({
    status: 401,
    result: "End-point not found",
  });
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
