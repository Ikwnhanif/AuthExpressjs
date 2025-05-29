// app.js
require("dotenv").config(); // Pastikan dotenv dimuat paling awal
const express = require("express");
const cors = require("cors");
const authRoutes = require("./src/routes/authRoutes");

const app = express();
const PORT = process.env.PORT || 3001; // Gunakan port dari .env atau default 3001

// Middleware
app.use(cors()); // Mengizinkan request dari semua origin (sesuaikan untuk produksi)
app.use(express.json()); // Untuk mem-parsing body request JSON
app.use(express.urlencoded({ extended: true })); // Untuk mem-parsing body request URL-encoded

// Rute Dasar untuk Testing
app.get("/", (req, res) => {
  res.send("Selamat datang di Flutter Auth Backend API!");
});

// Gunakan Rute Otentikasi
app.use("/api/auth", authRoutes); // Semua rute di authRoutes akan berprefix /api/auth

// Penanganan Error Sederhana (bisa dikembangkan lebih lanjut)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .send({ success: false, message: "Terjadi kesalahan pada server!" });
});

app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});
