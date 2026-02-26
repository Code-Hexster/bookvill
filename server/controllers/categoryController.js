const Category = require("../models/Category");

// ─────────────────────────────────────────────────────────────
// @desc    Create a new category
// @route   POST /api/categories
// @access  Private (admin only)
// ─────────────────────────────────────────────────────────────
const createCategory = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Admin access required" });
        }

        const { name, slug, description, icon, parent, isFeatured } = req.body;

        if (!name || !slug) {
            return res.status(400).json({ message: "name and slug are required" });
        }

        // Validate parent exists if provided
        if (parent) {
            const parentCat = await Category.findById(parent);
            if (!parentCat) return res.status(400).json({ message: "Parent category not found" });
        }

        const category = await Category.create({
            name,
            slug,
            description,
            icon,
            parent: parent || null,
            isFeatured: isFeatured || false,
        });

        res.status(201).json(category);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: "Category name or slug already exists" });
        }
        console.error("createCategory error:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

// ─────────────────────────────────────────────────────────────
// @desc    Get all categories (tree structure)
// @route   GET /api/categories
// @access  Public
// ─────────────────────────────────────────────────────────────
const getAllCategories = async (req, res) => {
    try {
        const { featured } = req.query;

        const filter = {};
        if (featured === "true") filter.isFeatured = true;

        // Fetch all with parent populated
        const categories = await Category.find(filter)
            .populate("parent", "name slug")
            .sort({ name: 1 })
            .select("-__v");

        // Build tree: top-level + children nested
        const topLevel = categories.filter((c) => !c.parent);
        const children = categories.filter((c) => c.parent);

        const tree = topLevel.map((cat) => ({
            ...cat.toJSON(),
            children: children.filter(
                (c) => c.parent._id.toString() === cat._id.toString()
            ),
        }));

        res.status(200).json({ total: categories.length, categories: tree });
    } catch (error) {
        console.error("getAllCategories error:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

// ─────────────────────────────────────────────────────────────
// @desc    Get a single category by slug
// @route   GET /api/categories/:slug
// @access  Public
// ─────────────────────────────────────────────────────────────
const getCategoryBySlug = async (req, res) => {
    try {
        const category = await Category.findOne({ slug: req.params.slug })
            .populate("parent", "name slug");

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.status(200).json(category);
    } catch (error) {
        console.error("getCategoryBySlug error:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = { createCategory, getAllCategories, getCategoryBySlug };
