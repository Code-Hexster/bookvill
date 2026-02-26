const Book = require("../models/Book");
const Category = require("../models/Category");

// ─────────────────────────────────────────────────────────────
// @desc    Add a new book
// @route   POST /api/books
// @access  Private (admin / author only)
// ─────────────────────────────────────────────────────────────
const addBook = async (req, res) => {
    try {
        const {
            title,
            author,
            description,
            coverImage,
            format,
            categories,
            status,
            tags,
            metadata,
        } = req.body;

        // ── Validation ─────────────────────────────────────────
        if (!title || !author || !format) {
            return res.status(400).json({ message: "title, author, and format are required" });
        }

        const validFormats = ["novel", "manga", "manhwa", "manhua", "comic", "lightNovel", "webtoon"];
        if (!validFormats.includes(format)) {
            return res.status(400).json({ message: `format must be one of: ${validFormats.join(", ")}` });
        }

        // ── Validate category ObjectIds exist ──────────────────
        if (categories && categories.length > 0) {
            const found = await Category.countDocuments({ _id: { $in: categories } });
            if (found !== categories.length) {
                return res.status(400).json({ message: "One or more category IDs are invalid" });
            }

            // Increment bookCount on each category
            await Category.updateMany(
                { _id: { $in: categories } },
                { $inc: { bookCount: 1 } }
            );
        }

        const book = await Book.create({
            title,
            author,
            description,
            coverImage,
            format,
            categories: categories || [],
            status: status || "ongoing",
            tags: tags || [],
            metadata: metadata || {},
            uploadedBy: req.user?._id || null,
        });

        // Populate categories in response
        await book.populate("categories", "name slug icon");

        res.status(201).json(book);
    } catch (error) {
        // Handle duplicate title + format combo
        if (error.code === 11000) {
            return res.status(409).json({ message: "A book with this title already exists" });
        }
        console.error("addBook error:", error.message);
        res.status(500).json({ message: "Server error while adding book" });
    }
};

// ─────────────────────────────────────────────────────────────
// @desc    Get all books (with pagination, filter, sort, search)
// @route   GET /api/books
// @access  Public
//
// Query params:
//   ?page=1          pagination (default 1)
//   ?limit=20        results per page (default 20, max 50)
//   ?format=manga    filter by format
//   ?status=ongoing  filter by status
//   ?category=<id>   filter by category ObjectId
//   ?search=solo     full-text search in title/author/tags
//   ?sort=newest|trending|top-rated  (default: newest)
// ─────────────────────────────────────────────────────────────
const getAllBooks = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            format,
            status,
            category,
            search,
            sort = "newest",
            tag,
        } = req.query;

        // ── Safety clamp on limit ──────────────────────────────
        const safeLimit = Math.min(parseInt(limit), 50);
        const skip = (parseInt(page) - 1) * safeLimit;

        // ── Build filter object ────────────────────────────────
        const filter = { isPublished: true };

        if (format) filter.format = format;
        if (status) filter.status = status;
        if (category) filter.categories = category; // MongoDB matches if array contains value
        if (tag) filter.tags = tag.toLowerCase();

        // Full-text search ($text index on title, author, tags)
        if (search) filter.$text = { $search: search };

        // ── Sort strategy ──────────────────────────────────────
        let sortOption;
        switch (sort) {
            case "trending":
                sortOption = { isTrending: -1, totalViews: -1 };
                break;
            case "top-rated":
                sortOption = { "ratings.count": -1, "ratings.sum": -1 };
                break;
            case "a-z":
                sortOption = { titleLower: 1 };
                break;
            case "oldest":
                sortOption = { createdAt: 1 };
                break;
            case "newest":
            default:
                sortOption = { createdAt: -1 };
        }

        // ── Run query + count in parallel ─────────────────────
        const [books, total] = await Promise.all([
            Book.find(filter)
                .populate("categories", "name slug icon")
                .sort(sortOption)
                .skip(skip)
                .limit(safeLimit)
                .select("-__v"),
            Book.countDocuments(filter),
        ]);

        res.status(200).json({
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / safeLimit),
            limit: safeLimit,
            books,
        });
    } catch (error) {
        console.error("getAllBooks error:", error.message);
        res.status(500).json({ message: "Server error while fetching books" });
    }
};

// ─────────────────────────────────────────────────────────────
// @desc    Get a single book by ID (with chapter list)
// @route   GET /api/books/:id
// @access  Public
// ─────────────────────────────────────────────────────────────
const getBookById = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id)
            .populate("categories", "name slug icon")
            .populate("uploadedBy", "username avatar")
            .select("-__v");

        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        // Increment view count (fire-and-forget, don't await)
        Book.findByIdAndUpdate(req.params.id, { $inc: { totalViews: 1 } }).exec();

        // Fetch chapter list (lightweight — no content or page arrays)
        const Chapter = require("../models/Chapter");
        const chapters = await Chapter.find({ book: req.params.id })
            .sort({ chapterNumber: 1 })
            .select("chapterNumber title publishedAt views wordCount pageCount isPremium");

        res.status(200).json({ ...book.toJSON(), chapters });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({ message: "Invalid book ID" });
        }
        console.error("getBookById error:", error.message);
        res.status(500).json({ message: "Server error while fetching book" });
    }
};

// ─────────────────────────────────────────────────────────────
// @desc    Get books filtered by category slug
// @route   GET /api/books/category/:slug
// @access  Public
//
// Query params: ?page=1 ?limit=20 ?format=manga ?sort=newest
// ─────────────────────────────────────────────────────────────
const getBooksByCategory = async (req, res) => {
    try {
        const { slug } = req.params;
        const { page = 1, limit = 20, format, sort = "newest" } = req.query;

        // Resolve slug → category document
        const category = await Category.findOne({ slug });
        if (!category) {
            return res.status(404).json({ message: `Category '${slug}' not found` });
        }

        const safeLimit = Math.min(parseInt(limit), 50);
        const skip = (parseInt(page) - 1) * safeLimit;

        const filter = { isPublished: true, categories: category._id };
        if (format) filter.format = format;

        let sortOption;
        switch (sort) {
            case "trending": sortOption = { isTrending: -1, totalViews: -1 }; break;
            case "top-rated": sortOption = { "ratings.count": -1 }; break;
            case "oldest": sortOption = { createdAt: 1 }; break;
            default: sortOption = { createdAt: -1 };
        }

        const [books, total] = await Promise.all([
            Book.find(filter)
                .populate("categories", "name slug icon")
                .sort(sortOption)
                .skip(skip)
                .limit(safeLimit)
                .select("-__v"),
            Book.countDocuments(filter),
        ]);

        res.status(200).json({
            category: { name: category.name, slug: category.slug, icon: category.icon },
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / safeLimit),
            limit: safeLimit,
            books,
        });
    } catch (error) {
        console.error("getBooksByCategory error:", error.message);
        res.status(500).json({ message: "Server error while filtering by category" });
    }
};

// ─────────────────────────────────────────────────────────────
// @desc    Search books by title, author, or tags
// @route   GET /api/books/search?q=solo+leveling
// @access  Public
// ─────────────────────────────────────────────────────────────
const searchBooks = async (req, res) => {
    try {
        const { q, format, page = 1, limit = 20 } = req.query;

        if (!q || q.trim().length < 2) {
            return res.status(400).json({ message: "Search query must be at least 2 characters" });
        }

        const safeLimit = Math.min(parseInt(limit), 50);
        const skip = (parseInt(page) - 1) * safeLimit;

        // Use $text index for relevance-scored search
        const filter = {
            isPublished: true,
            $text: { $search: q.trim() },
        };
        if (format) filter.format = format;

        const [books, total] = await Promise.all([
            Book.find(filter, { score: { $meta: "textScore" } })
                .populate("categories", "name slug icon")
                .sort({ score: { $meta: "textScore" } }) // best match first
                .skip(skip)
                .limit(safeLimit)
                .select("-__v"),
            Book.countDocuments(filter),
        ]);

        res.status(200).json({
            query: q,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / safeLimit),
            books,
        });
    } catch (error) {
        console.error("searchBooks error:", error.message);
        res.status(500).json({ message: "Server error during search" });
    }
};

// ─────────────────────────────────────────────────────────────
// @desc    Update a book
// @route   PUT /api/books/:id
// @access  Private (admin / uploader)
// ─────────────────────────────────────────────────────────────
const updateBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ message: "Book not found" });

        // Only admin or the uploader can update
        const isOwner = book.uploadedBy?.toString() === req.user._id.toString();
        const isAdmin = req.user.role === "admin";
        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: "Not authorized to update this book" });
        }

        const allowedFields = [
            "title", "author", "description", "coverImage",
            "format", "categories", "status", "tags", "metadata",
            "isTrending", "isFeatured", "isPublished",
        ];

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) book[field] = req.body[field];
        });

        await book.save();
        await book.populate("categories", "name slug icon");

        res.status(200).json(book);
    } catch (error) {
        if (error.name === "CastError") return res.status(400).json({ message: "Invalid book ID" });
        console.error("updateBook error:", error.message);
        res.status(500).json({ message: "Server error while updating book" });
    }
};

// ─────────────────────────────────────────────────────────────
// @desc    Delete a book
// @route   DELETE /api/books/:id
// @access  Private (admin only)
// ─────────────────────────────────────────────────────────────
const deleteBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ message: "Book not found" });

        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Admin access required" });
        }

        // Also delete all chapters and bookmarks for this book
        const Chapter = require("../models/Chapter");
        const Bookmark = require("../models/Bookmark");

        await Promise.all([
            Chapter.deleteMany({ book: book._id }),
            Bookmark.deleteMany({ book: book._id }),
            Category.updateMany(
                { _id: { $in: book.categories } },
                { $inc: { bookCount: -1 } }
            ),
        ]);

        await book.deleteOne();

        res.status(200).json({ message: "Book and all related data deleted successfully" });
    } catch (error) {
        if (error.name === "CastError") return res.status(400).json({ message: "Invalid book ID" });
        console.error("deleteBook error:", error.message);
        res.status(500).json({ message: "Server error while deleting book" });
    }
};

module.exports = {
    addBook,
    getAllBooks,
    getBookById,
    getBooksByCategory,
    searchBooks,
    updateBook,
    deleteBook,
};
