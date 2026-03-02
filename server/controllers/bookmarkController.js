const Bookmark = require("../models/Bookmark");

// ─────────────────────────────────────────────────────────────
// @desc    Get all bookmarks for the logged-in user
//          (sorted by lastReadAt — powers "Continue Reading")
// @route   GET /api/bookmarks
// @access  Private
// ─────────────────────────────────────────────────────────────
const getMyBookmarks = async (req, res) => {
    try {
        const bookmarks = await Bookmark.find({ user: req.user._id })
            .sort({ lastReadAt: -1 })
            .populate("book", "title coverImage format author")
            .select("-__v");

        res.status(200).json(bookmarks);
    } catch (error) {
        console.error("getMyBookmarks error:", error.message);
        res.status(500).json({ message: "Server error while fetching bookmarks" });
    }
};

// ─────────────────────────────────────────────────────────────
// @desc    Get a single bookmark for a specific book (by the logged-in user)
// @route   GET /api/bookmarks/:bookId
// @access  Private
// ─────────────────────────────────────────────────────────────
const getBookmarkByBook = async (req, res) => {
    try {
        const bookmark = await Bookmark.findOne({
            user: req.user._id,
            book: req.params.bookId,
        }).populate("book", "title coverImage format author");

        if (!bookmark) {
            return res.status(404).json({ message: "No bookmark found for this book" });
        }

        res.status(200).json(bookmark);
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({ message: "Invalid book ID" });
        }
        console.error("getBookmarkByBook error:", error.message);
        res.status(500).json({ message: "Server error while fetching bookmark" });
    }
};

// ─────────────────────────────────────────────────────────────
// @desc    Save / update reading progress for a book
//          Creates bookmark if it doesn't exist (upsert)
// @route   POST /api/bookmarks/:bookId
// @access  Private
// ─────────────────────────────────────────────────────────────
const saveProgress = async (req, res) => {
    try {
        const { lastChapterNumber, chapterId, position, readingStatus } = req.body;

        const update = {
            lastReadAt: new Date(),
            ...(lastChapterNumber !== undefined && { lastChapterNumber }),
            ...(chapterId && { chapter: chapterId }),
            ...(readingStatus && { readingStatus }),
            ...(position && { position }),
        };

        // readingStatus auto-upgrades to "reading" on first progress save
        if (!readingStatus) {
            update.readingStatus = "reading";
        }

        const bookmark = await Bookmark.findOneAndUpdate(
            { user: req.user._id, book: req.params.bookId },
            { $set: update },
            { new: true, upsert: true, runValidators: true }
        ).populate("book", "title coverImage format author");

        res.status(200).json(bookmark);
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({ message: "Invalid book ID" });
        }
        console.error("saveProgress error:", error.message);
        res.status(500).json({ message: "Server error while saving progress" });
    }
};

// ─────────────────────────────────────────────────────────────
// @desc    Update reading status (reading / completed / dropped etc.)
// @route   PATCH /api/bookmarks/:bookId/status
// @access  Private
// ─────────────────────────────────────────────────────────────
const updateStatus = async (req, res) => {
    try {
        const { readingStatus } = req.body;
        const valid = ["reading", "completed", "planToRead", "dropped", "onHold"];
        if (!valid.includes(readingStatus)) {
            return res.status(400).json({ message: `readingStatus must be one of: ${valid.join(", ")}` });
        }

        const bookmark = await Bookmark.findOneAndUpdate(
            { user: req.user._id, book: req.params.bookId },
            { $set: { readingStatus } },
            { new: true, upsert: true }
        );

        res.status(200).json(bookmark);
    } catch (error) {
        console.error("updateStatus error:", error.message);
        res.status(500).json({ message: "Server error while updating status" });
    }
};

// ─────────────────────────────────────────────────────────────
// @desc    Delete a bookmark
// @route   DELETE /api/bookmarks/:bookId
// @access  Private
// ─────────────────────────────────────────────────────────────
const deleteBookmark = async (req, res) => {
    try {
        const result = await Bookmark.findOneAndDelete({
            user: req.user._id,
            book: req.params.bookId,
        });

        if (!result) {
            return res.status(404).json({ message: "Bookmark not found" });
        }

        res.status(200).json({ message: "Bookmark removed" });
    } catch (error) {
        console.error("deleteBookmark error:", error.message);
        res.status(500).json({ message: "Server error while deleting bookmark" });
    }
};

module.exports = { getMyBookmarks, getBookmarkByBook, saveProgress, updateStatus, deleteBookmark };
