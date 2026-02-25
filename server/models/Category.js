const mongoose = require("mongoose");

/**
 * Category Collection
 *
 * Scalability notes:
 * - Stored as a separate collection (not embedded in Book) so categories
 *   can be queried, renamed, or expanded independently.
 * - `parent` ref enables sub-genre nesting (e.g. Fantasy → Isekai).
 * - `slug` enables clean URL routing: /library/fantasy
 */
const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Category name is required"],
            unique: true,
            trim: true,
        },
        // URL-safe identifier e.g. "light-novel", "slice-of-life"
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        description: {
            type: String,
            default: "",
            maxlength: 300,
        },
        // Emoji or icon class string for UI display
        icon: {
            type: String,
            default: "📚",
        },
        // Self-reference for nested categories (e.g. Action > Martial Arts)
        parent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            default: null,
        },
        // Is this a top-level genre shown in navigation?
        isFeatured: {
            type: Boolean,
            default: false,
        },
        // How many books in this category (denormalized for fast count display)
        bookCount: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

// Index for fast slug lookups and parent traversals
categorySchema.index({ slug: 1 });
categorySchema.index({ parent: 1 });

module.exports = mongoose.model("Category", categorySchema);
