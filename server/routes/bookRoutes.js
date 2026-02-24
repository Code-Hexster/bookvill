const express = require("express");
const router = express.Router();
const { getAllBooks, getBookById, searchBooks } = require("../controllers/bookController");

// GET /api/books          - Get all books (with optional filters)
router.get("/", getAllBooks);

// GET /api/books/search   - Search books
router.get("/search", searchBooks);

// GET /api/books/:id      - Get single book
router.get("/:id", getBookById);

module.exports = router;
