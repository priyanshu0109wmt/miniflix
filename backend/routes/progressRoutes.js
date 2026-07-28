const express = require("express");
const db = require("../config/db");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

// POST /api/progress - Save/update watch progress (upsert)
router.post("/", verifyToken, async (req, res) => {
  try {
    const { movieId, secondsWatched, duration } = req.body;

    if (!movieId || secondsWatched === undefined) {
      return res.status(400).json({ message: "movieId and secondsWatched are required." });
    }

    await db.query(
      `INSERT INTO watch_progress (user_id, movie_id, seconds_watched, duration)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         seconds_watched = VALUES(seconds_watched),
         duration = VALUES(duration)`,
      [req.user.id, movieId, Math.floor(secondsWatched), Math.floor(duration || 0)]
    );

    res.json({ message: "Progress saved." });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
});

// GET /api/progress - All progress with movie info (Continue Watching row)
router.get("/", verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT
         wp.movie_id AS id,
         wp.seconds_watched,
         wp.duration,
         wp.updated_at,
         m.title, m.year, m.genre, m.image, m.video
       FROM watch_progress wp
       JOIN movies m ON m.id = wp.movie_id
       WHERE wp.user_id = ?
       ORDER BY wp.updated_at DESC`,
      [req.user.id]
    );

    res.json(rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
});

// GET /api/progress/:movieId - Progress for one movie (resume playback)
router.get("/:movieId", verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT seconds_watched, duration FROM watch_progress WHERE user_id = ? AND movie_id = ?",
      [req.user.id, req.params.movieId]
    );

    res.json(rows[0] || null);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;