const express = require("express");
const router = express.Router();
const {
    getMyBookmarks,
    getBookmarkByBook,
    saveProgress,
    updateStatus,
    deleteBookmark,
} = require("../controllers/bookmarkController");
const { protect } = require("../middleware/authMiddleware");

// All bookmark routes are private
router.use(protect);

// GET  /api/bookmarks             — all bookmarks for current user (Continue Reading list)
router.get("/", getMyBookmarks);

// GET  /api/bookmarks/:bookId     — single bookmark for a book
router.get("/:bookId", getBookmarkByBook);

// POST /api/bookmarks/:bookId     — save / update reading progress (upsert)
router.post("/:bookId", saveProgress);

// PATCH /api/bookmarks/:bookId/status — update reading status only
router.patch("/:bookId/status", updateStatus);

// DELETE /api/bookmarks/:bookId   — remove bookmark
router.delete("/:bookId", deleteBookmark);

module.exports = router;
