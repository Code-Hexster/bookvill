const express = require("express");
const router = express.Router();
const { getUserProfile, updateProfile, getBookmarks, updateReadingStatus } = require("../controllers/userController");

// GET  /api/users/profile         - Get user profile
router.get("/profile", getUserProfile);

// PUT  /api/users/profile         - Update user profile
router.put("/profile", updateProfile);

// GET  /api/users/bookmarks       - Get user's bookmarks
router.get("/bookmarks", getBookmarks);

// PUT  /api/users/reading-status  - Update reading status for a book
router.put("/reading-status", updateReadingStatus);

module.exports = router;
