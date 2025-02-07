const express = require("express");
const db = require("../db");
const router = express.Router();

// Get available ticket types for an event
router.get("/ticket-types", async (req, res) => {
  try {
    const sql = `SELECT id, name FROM ticket_types`;
    const [ticketTypes] = await db.promise().query(sql);

    if (ticketTypes.length === 0) {
      console.log("No ticket types found");
      return res.status(404).json({ message: "No ticket types found" });
    }

    res.json(ticketTypes);
  } catch (err) {
    console.error("❌ Error fetching ticket types:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
