const db = require("../config/db");

// ✅ Submit feedback
exports.submitFeedback = async (req, res) => {
  try {
    const userId = req.user.id; // From JWT
    const { category, stars, comment } = req.body;

    // Validation
    if (!category || !stars || !comment) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Insert feedback
    const [result] = await db.query(
      "INSERT INTO feedback (user_id, category, stars, comment) VALUES (?, ?, ?, ?)",
      [userId, category, stars, comment]
    );

    res.json({ 
      message: "✅ Feedback submitted successfully", 
      feedback_id: result.insertId 
    });
  } catch (err) {
    console.error("❌ Feedback submit error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ Get user's feedback
exports.getUserFeedback = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.query(
      "SELECT feedback_id, category, stars, comment, status, created_at FROM feedback WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );

    res.json({ feedback: rows });
  } catch (err) {
    console.error("❌ Fetch feedback error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
