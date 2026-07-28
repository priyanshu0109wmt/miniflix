const express = require("express");
const db = require("../config/db");

const router = express.Router();

// Get all active plans
router.get("/", async (req, res) => {
  try {
    const [plans] = await db.query(
      "SELECT * FROM plans WHERE is_active = TRUE ORDER BY price ASC"
    );

    res.json(plans);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;