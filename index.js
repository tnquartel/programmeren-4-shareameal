require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const port = process.env.PORT;

app.use(bodyParser.json());

app.all("*", (req, res, next) => {
  const method = req.method;
  console.log(`Method ${method} is aangeroepen op URL:${req.url}`);
  next();
});

app.get("/", (req, res) => {
  res.status(200).json({
    status: 200,
    result: "Hello World",
  });
});

const userRoute = require("./src/routes/User");
const mealRoute = require("./src/routes/Meal");
const authRoute = require("./src/routes/Auth");
app.use("/api/user", userRoute);
app.use("/api/meal", mealRoute);
app.use("/api/auth", authRoute);

app.all("*", (req, res) => {
  res.status(404).json({
    status: 404,
    result: "End-point not found",
  });
});

//Error handler
app.use((err, req, res, next) => {
  res.status(err.status).json(err);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

module.exports = app;
