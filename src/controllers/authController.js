// src/controllers/authController.js
const db = require("../config/db"); // Koneksi database kita
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  // 1. Validasi Input Sederhana
  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Semua field harus diisi" });
  }
  if (password.length < 6) {
    return res
      .status(400)
      .json({ success: false, message: "Password minimal 6 karakter" });
  }

  try {
    // 2. Cek apakah email atau username sudah ada
    const [existingUser] = await db.query(
      "SELECT * FROM users WHERE email = ? OR username = ?",
      [email, username]
    );

    if (existingUser.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email atau username sudah terdaftar",
      });
    }

    // 3. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Simpan pengguna ke database (asumsi kolom 'role' ada dengan default 'user')
    const defaultRole = "user"; // Anda bisa mengambil ini dari request jika ada logika khusus
    const [result] = await db.query(
      "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
      [username, email, hashedPassword, defaultRole]
    );

    res.status(201).json({
      success: true,
      message: "Registrasi berhasil!",
      userId: result.insertId,
    });
  } catch (error) {
    console.error("Error saat registrasi:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server saat registrasi",
    });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body; // Bisa juga login dengan username

  // 1. Validasi Input
  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Email dan password harus diisi" });
  }

  try {
    // 2. Cari pengguna berdasarkan email
    const [users] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (users.length === 0) {
      return res
        .status(401)
        .json({ success: false, message: "Email atau password salah" });
    }

    const user = users[0];

    // 3. Bandingkan password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Email atau password salah" });
    }

    // 4. Buat JWT Token
    const payload = {
      userId: user.id,
      username: user.username,
      role: user.role, // Sertakan peran dalam token
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    res.status(200).json({
      success: true,
      message: "Login berhasil!",
      token: token,
      user: {
        // Kirim juga data user (tanpa password)
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error saat login:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server saat login",
    });
  }
};
