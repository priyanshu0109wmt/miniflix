const express = require("express");
const db = require("../config/db");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

// GET /api/notifications - Get all notifications for current user
router.get("/", verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20",
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
});

// GET /api/notifications/unread-count
router.get("/unread-count", verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE",
      [req.user.id]
    );
    res.json({ count: rows[0].count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
});

// POST /api/notifications/mark-read
router.post("/mark-read", verifyToken, async (req, res) => {
  try {
    await db.query(
      "UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE",
      [req.user.id]
    );
    res.json({ message: "All notifications marked as read." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;