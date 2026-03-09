const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
    avatar: { type: String },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, maxlength: 1000 }
}, { timestamps: true });

/**
 * Book Collection
 *
 * Scalability notes:
 * - Chapters are NOT embedded here. A 500-chapter manhwa would
 *   blow past MongoDB's 16MB document limit. Chapters live in their
 *   own collection with a `book` foreign key.
 * - Categories referenced by ObjectId — avoids stale denormalized data.
 * - `ratings` stored as {sum, count} so average is always computable
 *   without scanning all reviews: avg = sum / count.
 * - `metadata` field is a flexible Map for format-specific data
 *   (e.g. reading direction for manga, word count for novels).
 * - Indexes cover the most common query patterns.
 */
const bookSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Title is required"],
            trim: true,
        },
        // Normalized title for fast case-insensitive lookup
        titleLower: {
            type: String,
            lowercase: true,
            trim: true,
        },
        author: {
            type: String,
            required: [true, "Author is required"],
            trim: true,
        },
        description: {
            type: String,
            default: "",
            maxlength: 5000,
        },
        coverImage: {
            type: String,
            default: "",
        },
        // Format determines how the reader renders: text scroll vs panel vs vertical scroll
        format: {
            type: String,
            enum: ["novel", "manga", "manhwa", "manhua", "comic", "lightNovel", "webtoon"],
            required: [true, "Format is required"],
        },
        // Reference to Category documents (supports multiple genres per book)
        categories: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Category",
            },
        ],
        status: {
            type: String,
            enum: ["ongoing", "completed", "hiatus", "dropped"],
            default: "ongoing",
        },
        // Efficient average calculation without scanning rating documents
        ratings: {
            sum: { type: Number, default: 0 },
            count: { type: Number, default: 0 },
        },
        reviews: [reviewSchema],
        // Denormalized for display — updated when chapters are added/removed
        chapterCount: {
            type: Number,
            default: 0,
        },
        // Total views across all chapters
        totalViews: {
            type: Number,
            default: 0,
        },
        // Flexible key-value map for format-specific metadata
        // e.g. { readingDirection: "rtl", language: "en", originalLanguage: "ja" }
        metadata: {
            type: Map,
            of: String,
            default: {},
        },
        // Tags for finer discovery beyond categories (e.g. "harem", "time-travel")
        tags: [{ type: String, trim: true, lowercase: true }],
        // Uploaded by a user (for community content)
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        isTrending: { type: Boolean, default: false },
        isFeatured: { type: Boolean, default: false },
        isPublished: { type: Boolean, default: true },
        publishedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

// ── Virtual: compute average rating on the fly ────────────────
bookSchema.virtual("averageRating").get(function () {
    if (this.ratings.count === 0) return 0;
    return (this.ratings.sum / this.ratings.count).toFixed(1);
});

// ── Pre-save: sync titleLower & update ratings ───────────────
bookSchema.pre("save", function (next) {
    if (this.isModified("title")) {
        this.titleLower = this.title.toLowerCase();
    }

    // Auto-calculate ratings on review modifications
    if (this.isModified("reviews")) {
        this.ratings.count = this.reviews.length;
        this.ratings.sum = this.reviews.reduce((acc, rev) => acc + rev.rating, 0);
    }

    next();
});

// ── Indexes ───────────────────────────────────────────────────
bookSchema.index({ titleLower: 1 });
bookSchema.index({ format: 1 });
bookSchema.index({ status: 1 });
bookSchema.index({ categories: 1 });
bookSchema.index({ tags: 1 });
bookSchema.index({ isTrending: 1, totalViews: -1 });
bookSchema.index({ isFeatured: 1 });
bookSchema.index({ createdAt: -1 });             // "newest" queries
bookSchema.index({ "ratings.count": -1 });       // "most rated" queries
// Full-text search across title, author, tags
bookSchema.index({ title: "text", author: "text", tags: "text" });

module.exports = mongoose.model("Book", bookSchema);
