const mysql = require("mysql2");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  ssl: {
  rejectUnauthorized: false
}
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Database connection failed:");
    console.error(err.message);
    return;
  }

  console.log("✅ Connected to TiDB Cloud successfully");

  connection.release();
});

module.exports = pool.promise();