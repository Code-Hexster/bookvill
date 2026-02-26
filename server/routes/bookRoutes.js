const express = require("express");
const router = express.Router();
const {
    addBook,
    getAllBooks,
    getBookById,
    getBooksByCategory,
    searchBooks,
    updateBook,
    deleteBook,
} = require("../controllers/bookController");
const { protect } = require("../middleware/authMiddleware");

// ── Public routes ─────────────────────────────────────────────
// GET /api/books              — list all (paginated, filtered, sorted)
router.get("/", getAllBooks);

// GET /api/books/search?q=    — full-text relevance search (must be before /:id)
router.get("/search", searchBooks);

// GET /api/books/category/:slug — filter by category slug
router.get("/category/:slug", getBooksByCategory);

// GET /api/books/:id          — single book with chapter list
router.get("/:id", getBookById);

// ── Protected routes ──────────────────────────────────────────
// POST /api/books             — add a new book (authenticated users)
router.post("/", protect, addBook);

// PUT /api/books/:id          — update (owner or admin)
router.put("/:id", protect, updateBook);

// DELETE /api/books/:id       — delete (admin only)
router.delete("/:id", protect, deleteBook);

module.exports = router;
