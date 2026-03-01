const express = require("express");
const router = express.Router();
const {
    getChaptersByBook,
    getChapter,
    createChapter,
    deleteChapter,
} = require("../controllers/chapterController");
const { protect } = require("../middleware/authMiddleware");

// ── Public routes ──────────────────────────────────────────────
// GET /api/chapters/book/:bookId              — chapter index for a book
router.get("/book/:bookId", getChaptersByBook);

// GET /api/chapters/book/:bookId/chapter/:chapterNumber — read a chapter + nav
router.get("/book/:bookId/chapter/:chapterNumber", getChapter);

// ── Protected routes ───────────────────────────────────────────
// POST /api/chapters/book/:bookId            — add a chapter
router.post("/book/:bookId", protect, createChapter);

// DELETE /api/chapters/:id                   — remove a chapter
router.delete("/:id", protect, deleteChapter);

module.exports = router;
