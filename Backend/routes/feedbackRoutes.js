const express = require("express");
const router = express.Router();
const { submitFeedback, getUserFeedback } = require("../controllers/feedbackController");
const { verifyToken } = require("../middleware/authMiddleware");

// ✅ Routes
router.post("/submitFeedback", verifyToken, submitFeedback);
router.get("/getUserFeedback", verifyToken, getUserFeedback);

module.exports = router;
