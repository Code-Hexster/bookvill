const mongoose = require("mongoose");

/**
 * Chapter Collection
 *
 * Scalability notes:
 * - Completely separate from Book — a single book can have 1000+ chapters.
 *   Embedding would hit MongoDB's 16MB doc limit and make Book fetches slow.
 * - `content` stores novel text. `pages` stores image URLs for manga/manhwa.
 *   Both fields are null-safe — only one is used depending on book format.
 * - `pages` stores URLs (S3/Cloudinary), NOT raw image data in MongoDB.
 * - Compound index on (book + chapterNumber) is the primary read pattern:
 *   "give me chapter 42 of book X" — hit without collection scan.
 * - `views` per chapter enables "most popular chapter" analytics.
 */
const chapterSchema = new mongoose.Schema(
    {
        // Foreign key back to Book
        book: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Book",
            required: true,
        },
        chapterNumber: {
            type: Number,
            required: [true, "Chapter number is required"],
        },
        title: {
            type: String,
            trim: true,
            default: "",
        },
        // ── Novel / Light Novel content (plain text or HTML) ──────
        content: {
            type: String,
            default: null,
        },
        // ── Manga / Manhwa / Manhua page image URLs ───────────────
        // Stored as array of strings pointing to CDN/S3 URLs
        pages: {
            type: [String],
            default: [],
        },
        // Word count (for novels — drives "reading time" estimate)
        wordCount: {
            type: Number,
            default: 0,
        },
        // Page count (for manga/manhwa)
        pageCount: {
            type: Number,
            default: 0,
        },
        views: {
            type: Number,
            default: 0,
        },
        // Is this chapter behind a paywall?
        isPremium: {
            type: Boolean,
            default: false,
        },
        // Unlock price in credits (0 = free)
        unlockCost: {
            type: Number,
            default: 0,
        },
        publishedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────
// Primary: "get chapter N of book B" — covers 99% of reader queries
chapterSchema.index({ book: 1, chapterNumber: 1 }, { unique: true });
// Secondary: list all chapters for a book sorted by number
chapterSchema.index({ book: 1, publishedAt: -1 });
// Analytics: most-viewed chapters globally
chapterSchema.index({ views: -1 });

// ── Pre-save: auto-compute word/page counts ───────────────────
chapterSchema.pre("save", function (next) {
    if (this.content) {
        this.wordCount = this.content.trim().split(/\s+/).length;
    }
    if (this.pages && this.pages.length) {
        this.pageCount = this.pages.length;
    }
    next();
});

module.exports = mongoose.model("Chapter", chapterSchema);
