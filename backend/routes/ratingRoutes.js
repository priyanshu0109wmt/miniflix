const express = require("express");
const db = require("../config/db");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

// POST /api/ratings - Rate a movie (upsert)
router.post("/", verifyToken, async (req, res) => {
  try {
    const { movieId, score } = req.body;

    // Strict validation
    if (!movieId || !score) {
      return res.status(400).json({ message: "movieId and score are required." });
    }

    const numScore = Number(score);
    const numMovieId = Number(movieId);

    if (isNaN(numScore) || numScore < 1 || numScore > 5) {
      return res.status(400).json({ message: "Score must be between 1 and 5." });
    }

    if (isNaN(numMovieId)) {
      return res.status(400).json({ message: "Invalid movie ID." });
    }

    await db.query(
      `INSERT INTO ratings (user_id, movie_id, score)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE score = VALUES(score)`,
      [req.user.id, numMovieId, numScore]
    );

    res.json({ message: "Rating saved." });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
});

// GET /api/ratings/recommendations - "Because You Watched"
router.get("/recommendations", verifyToken, async (req, res) => {
  try {
    // Get genres of movies the user rated 4+ stars
    const [topGenres] = await db.query(
      `SELECT m.genre, COUNT(*) as weight
       FROM ratings r
       JOIN movies m ON m.id = r.movie_id
       WHERE r.user_id = ? AND r.score >= 4
       GROUP BY m.genre
       ORDER BY weight DESC
       LIMIT 3`,
      [req.user.id]
    );

    if (topGenres.length === 0) {
      return res.json([]);
    }

    const genres = topGenres.map(g => g.genre);

    // Find movies matching those genres that the user hasn't rated
    const placeholders = genres.map(() => '?').join(' OR m.genre LIKE ');
    const [recommendations] = await db.query(
      `SELECT DISTINCT m.*
       FROM movies m
       WHERE (m.genre LIKE ${placeholders})
       AND m.id NOT IN (
         SELECT movie_id FROM ratings WHERE user_id = ?
       )
       ORDER BY RAND()
       LIMIT 8`,
      [...genres, req.user.id]
    );

    res.json(recommendations);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
});

// GET /api/ratings/:movieId - Get user's rating for a specific movie
router.get("/:movieId", verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT score FROM ratings WHERE user_id = ? AND movie_id = ?",
      [req.user.id, req.params.movieId]
    );

    res.json(rows[0] || null);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
});
module.exports = router;