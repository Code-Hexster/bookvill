const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Title is required"],
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
        },
        coverImage: {
            type: String,
            default: "",
        },
        // Format type determines reader mode
        format: {
            type: String,
            enum: ["novel", "manga", "manhwa", "manhua", "comic", "lightNovel"],
            required: true,
        },
        genres: [{ type: String }],
        status: {
            type: String,
            enum: ["ongoing", "completed", "hiatus"],
            default: "ongoing",
        },
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        totalRatings: {
            type: Number,
            default: 0,
        },
        chapterCount: {
            type: Number,
            default: 0,
        },
        chapters: [
            {
                chapterNumber: Number,
                title: String,
                content: String,       // For novels (text content)
                pages: [String],       // For manga/manhwa (image URLs)
                publishedAt: { type: Date, default: Date.now },
            },
        ],
        views: { type: Number, default: 0 },
        isTrending: { type: Boolean, default: false },
        isFeatured: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// Text index for search
bookSchema.index({ title: "text", author: "text", genres: "text" });

module.exports = mongoose.model("Book", bookSchema);
