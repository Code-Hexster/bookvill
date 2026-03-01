const Chapter = require("../models/Chapter");

// ─────────────────────────────────────────────────────────────
// @desc    Get all chapters (index) for a book
// @route   GET /api/chapters/book/:bookId
// @access  Public
// ─────────────────────────────────────────────────────────────
const getChaptersByBook = async (req, res) => {
    try {
        const chapters = await Chapter.find({ book: req.params.bookId })
            .sort({ chapterNumber: 1 })
            .select("chapterNumber title publishedAt views wordCount pageCount isPremium");

        res.status(200).json(chapters);
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({ message: "Invalid book ID" });
        }
        console.error("getChaptersByBook error:", error.message);
        res.status(500).json({ message: "Server error while fetching chapters" });
    }
};

// ─────────────────────────────────────────────────────────────
// @desc    Get a single chapter by book + chapterNumber
// @route   GET /api/chapters/book/:bookId/chapter/:chapterNumber
// @access  Public
// ─────────────────────────────────────────────────────────────
const getChapter = async (req, res) => {
    try {
        const { bookId, chapterNumber } = req.params;

        const chapter = await Chapter.findOne({
            book: bookId,
            chapterNumber: parseInt(chapterNumber),
        });

        if (!chapter) {
            return res.status(404).json({ message: "Chapter not found" });
        }

        // Increment view count fire-and-forget
        Chapter.findByIdAndUpdate(chapter._id, { $inc: { views: 1 } }).exec();

        // Find prev and next chapter numbers for navigation
        const [prev, next] = await Promise.all([
            Chapter.findOne({ book: bookId, chapterNumber: { $lt: chapter.chapterNumber } })
                .sort({ chapterNumber: -1 })
                .select("chapterNumber title"),
            Chapter.findOne({ book: bookId, chapterNumber: { $gt: chapter.chapterNumber } })
                .sort({ chapterNumber: 1 })
                .select("chapterNumber title"),
        ]);

        res.status(200).json({
            chapter,
            navigation: {
                prev: prev ? { chapterNumber: prev.chapterNumber, title: prev.title } : null,
                next: next ? { chapterNumber: next.chapterNumber, title: next.title } : null,
            },
        });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({ message: "Invalid book ID" });
        }
        console.error("getChapter error:", error.message);
        res.status(500).json({ message: "Server error while fetching chapter" });
    }
};

// ─────────────────────────────────────────────────────────────
// @desc    Create a new chapter
// @route   POST /api/chapters/book/:bookId
// @access  Private
// ─────────────────────────────────────────────────────────────
const createChapter = async (req, res) => {
    try {
        const { chapterNumber, title, content, pages, isPremium, unlockCost } = req.body;

        if (!chapterNumber) {
            return res.status(400).json({ message: "chapterNumber is required" });
        }

        const chapter = await Chapter.create({
            book: req.params.bookId,
            chapterNumber,
            title: title || `Chapter ${chapterNumber}`,
            content: content || null,
            pages: pages || [],
            isPremium: isPremium || false,
            unlockCost: unlockCost || 0,
        });

        res.status(201).json(chapter);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: "Chapter number already exists for this book" });
        }
        if (error.name === "CastError") {
            return res.status(400).json({ message: "Invalid book ID" });
        }
        console.error("createChapter error:", error.message);
        res.status(500).json({ message: "Server error while creating chapter" });
    }
};

// ─────────────────────────────────────────────────────────────
// @desc    Delete a chapter
// @route   DELETE /api/chapters/:id
// @access  Private
// ─────────────────────────────────────────────────────────────
const deleteChapter = async (req, res) => {
    try {
        const chapter = await Chapter.findByIdAndDelete(req.params.id);
        if (!chapter) {
            return res.status(404).json({ message: "Chapter not found" });
        }
        res.status(200).json({ message: "Chapter deleted" });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({ message: "Invalid chapter ID" });
        }
        console.error("deleteChapter error:", error.message);
        res.status(500).json({ message: "Server error while deleting chapter" });
    }
};

module.exports = { getChaptersByBook, getChapter, createChapter, deleteChapter };
