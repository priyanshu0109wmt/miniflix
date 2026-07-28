const express = require("express");
const db = require("../config/db");
const { verifyToken, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// Get all movies
router.get("/", async (req, res) => {
  try {
    const [movies] = await db.query(
      "SELECT * FROM movies ORDER BY created_at DESC"
    );
    res.json(movies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
});

// Search movies
router.get("/search", async (req, res) => {
  try {
    const q = req.query.q || "";
    const [movies] = await db.query(
      `SELECT * FROM movies
       WHERE title LIKE ? OR genre LIKE ? OR year LIKE ?
       ORDER BY created_at DESC`,
      [`%${q}%`, `%${q}%`, `%${q}%`]
    );
    res.json(movies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
});

// Get one movie by ID
router.get("/:id", async (req, res) => {
  try {
    const [movies] = await db.query(
      "SELECT * FROM movies WHERE id = ?",
      [req.params.id]
    );
    if (movies.length === 0) {
      return res.status(404).json({ message: "Movie not found." });
    }
    res.json(movies[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
});

// Add movie - admin only
router.post("/", verifyToken, adminOnly, async (req, res) => {
  try {
    const { title, description, year, genre, image, video } = req.body;

    if (!title || !description || !year || !genre || !image || !video) {
      return res.status(400).json({ message: "All movie fields are required." });
    }

    const [result] = await db.query(
      `INSERT INTO movies (title, description, year, genre, image, video)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, description, year, genre, image, video]
    );

    // Notify all users about the new movie
    await db.query(
      `INSERT INTO notifications (user_id, message, type)
       SELECT id, ?, 'new_movie' FROM users`,
      [`New movie added: ${title}`]
    );

    res.status(201).json({
      message: "Movie added successfully.",
      movieId: result.insertId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
});

// Delete movie - admin only
router.delete("/:id", verifyToken, adminOnly, async (req, res) => {
  try {
    const [result] = await db.query(
      "DELETE FROM movies WHERE id = ?",
      [req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Movie not found." });
    }
    res.json({ message: "Movie deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;