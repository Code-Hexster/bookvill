const express = require("express");
const router = express.Router();
const {
    createCategory,
    getAllCategories,
    getCategoryBySlug,
} = require("../controllers/categoryController");
const { protect } = require("../middleware/authMiddleware");

// GET /api/categories           — all categories (public, supports ?featured=true)
router.get("/", getAllCategories);

// GET /api/categories/:slug     — single category by slug (public)
router.get("/:slug", getCategoryBySlug);

// POST /api/categories          — create category (admin only, via protect + role check in controller)
router.post("/", protect, createCategory);

module.exports = router;
