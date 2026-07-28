const express = require("express");
const db = require("../config/db");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

// Get current user's watchlist
router.get("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [watchlist] = await db.query(
      `SELECT
         movies.id,
         movies.title,
         movies.description,
         movies.year,
         movies.genre,
         movies.image,
         movies.video,
         watchlist.created_at AS added_at
       FROM watchlist
       JOIN movies ON movies.id = watchlist.movie_id
       WHERE watchlist.user_id = ?
       ORDER BY watchlist.created_at DESC`,
      [userId]
    );

    res.json(watchlist);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error."
    });
  }
});

// Add movie to watchlist
router.post("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { movieId } = req.body;

    if (!movieId) {
      return res.status(400).json({
        message: "movieId is required."
      });
    }

    const [result] = await db.query(
      "INSERT INTO watchlist (user_id, movie_id) VALUES (?, ?)",
      [userId, movieId]
    );

    res.status(201).json({
      message: "Movie added to watchlist.",
      watchlistId: result.insertId
    });

  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "Movie already exists in watchlist."
      });
    }

    console.error(error);
    res.status(500).json({
      message: "Server error."
    });
  }
});

// Remove movie from watchlist
router.delete("/:movieId", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const movieId = req.params.movieId;

    const [result] = await db.query(
      "DELETE FROM watchlist WHERE user_id = ? AND movie_id = ?",
      [userId, movieId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Movie not found in watchlist."
      });
    }

    res.json({
      message: "Movie removed from watchlist."
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error."
    });
  }
});

module.exports = router;