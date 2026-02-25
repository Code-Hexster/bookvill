const mongoose = require("mongoose");

/**
 * Bookmark Collection
 *
 * Scalability notes:
 * - Separate collection (NOT embedded in User.library) for three reasons:
 *   1. Querying "all users who bookmarked book X" is a simple find({book: id})
 *      — impossible efficiently if embedded in User documents.
 *   2. A user with thousands of bookmarks won't bloat their User document.
 *   3. Bookmark-specific queries (sort by date, filter by status) get proper indexes.
 * - `position` is a flexible object that stores format-appropriate progress:
 *     Novel  → { scrollPercent: 72 }
 *     Manga  → { page: 14 }
 *     Manhwa → { scrollY: 3420 }
 * - Compound unique index on (user + book) ensures one bookmark per user/book pair.
 * - `readingStatus` doubles as a reading list manager.
 */
const bookmarkSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        book: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Book",
            required: true,
        },
        // Last chapter the user was reading
        chapter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Chapter",
            default: null,
        },
        // Last chapter number (denormalized for quick display without a join)
        lastChapterNumber: {
            type: Number,
            default: 0,
        },
        // Format-specific position within the chapter
        position: {
            scrollPercent: { type: Number, default: 0 }, // novels
            page: { type: Number, default: 0 },          // manga
            scrollY: { type: Number, default: 0 },        // manhwa / webtoon
        },
        readingStatus: {
            type: String,
            enum: ["reading", "completed", "planToRead", "dropped", "onHold"],
            default: "planToRead",
        },
        // User's personal rating for this book (1–5)
        userRating: {
            type: Number,
            min: 1,
            max: 5,
            default: null,
        },
        // Optional user note / "why I stopped here"
        note: {
            type: String,
            maxlength: 500,
            default: "",
        },
        // When user last opened this book — drives "Continue Reading" sort
        lastReadAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────
// Primary: ensure one bookmark per user/book pair
bookmarkSchema.index({ user: 1, book: 1 }, { unique: true });
// "Continue Reading" section — user's recent reads, sorted by last opened
bookmarkSchema.index({ user: 1, lastReadAt: -1 });
// Reading list by status — "show all books I'm currently reading"
bookmarkSchema.index({ user: 1, readingStatus: 1 });
// Analytics — "how many users are reading book X"
bookmarkSchema.index({ book: 1, readingStatus: 1 });

module.exports = mongoose.model("Bookmark", bookmarkSchema);
