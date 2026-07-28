const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

// Signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required."
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long."
      });
    }

    const [existingUsers] = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        message: "Email already exists."
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    );

    res.status(201).json({
      message: "Signup successful.",
      userId: result.insertId
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error."
    });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required."
      });
    }

    const [users] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        message: "Invalid credentials."
      });
    }

    const user = users[0];

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid credentials."
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    res.json({
      message: "Login successful.",
      token: token,
            user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        planId: user.plan_id,
        subscriptionStatus: user.subscription_status,
        subscriptionEnd: user.subscription_end
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error."
    });
  }
});

// GET /api/auth/me - Get fresh user data (including subscription + plan details)
router.get("/me", verifyToken, async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT
         u.id, u.name, u.email, u.role,
         u.subscription_status, u.subscription_end,
         p.name AS plan_name, p.price AS plan_price, p.features AS plan_features
       FROM users u
       LEFT JOIN plans p ON p.id = u.plan_id
       WHERE u.id = ?`,
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    const user = users[0];

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      planName: user.plan_name,
      planPrice: user.plan_price,
      planFeatures: user.plan_features,
      subscriptionStatus: user.subscription_status,
      subscriptionEnd: user.subscription_end
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;