// src/config/db.js
const mysql = require("mysql2");
require("dotenv").config(); // Memuat variabel dari .env

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test koneksi (opsional, tapi bagus untuk debugging awal)
pool.getConnection((err, connection) => {
  if (err) {
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      console.error("Koneksi database terputus.");
    }
    if (err.code === "ER_CON_COUNT_ERROR") {
      console.error("Database memiliki terlalu banyak koneksi.");
    }
    if (err.code === "ECONNREFUSED") {
      console.error("Koneksi database ditolak.");
    }
    return;
  }
  if (connection) {
    connection.release();
    console.log("Berhasil terhubung ke database MySQL!");
  }
  return;
});

module.exports = pool.promise(); // Menggunakan promise API untuk query yang lebih modern
