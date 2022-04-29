const mysql = require("mysql");
require("dotenv").config();
const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

module.exports = pool;

pool.on("acquire", function (connection) {
  console.log("Connection %d acquired", connection.threadId);
});

pool.on("connection", function (connection) {
  connection.query("SET SESSION auto_increment_increment=1");
});
