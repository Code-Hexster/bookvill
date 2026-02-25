const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

/**
 * User Collection
 *
 * Scalability notes:
 * - The `library` array is REMOVED. Reading progress, bookmarks, and
 *   reading status all live in the Bookmark collection. This keeps User
 *   documents small regardless of how many books a user reads.
 * - `stats` is a lightweight denormalized counter object — updated
 *   incrementally (e.g. $inc) so we never need to aggregate Bookmarks
 *   just to show "451 pages read" on a dashboard.
 * - `credits` field is pre-built for future premium chapter unlocks.
 * - `isAdmin` + `role` allow simple RBAC without a separate roles collection.
 * - Password is excluded from all queries by default (select: false).
 */
const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, "Username is required"],
            unique: true,
            trim: true,
            minlength: 3,
            maxlength: 30,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: 6,
            select: false,
        },
        // ── Profile ───────────────────────────────────────────────
        avatar: {
            type: String,
            default: "",
        },
        bio: {
            type: String,
            default: "",
            maxlength: 200,
        },
        // ── Role-based access control ─────────────────────────────
        role: {
            type: String,
            enum: ["reader", "author", "admin"],
            default: "reader",
        },
        // ── Reading stats (denormalized — updated with $inc) ──────
        // Do NOT compute these by aggregating Bookmarks on every request
        stats: {
            totalPagesRead: { type: Number, default: 0 },
            totalChaptersRead: { type: Number, default: 0 },
            totalMinutesRead: { type: Number, default: 0 },
            booksCompleted: { type: Number, default: 0 },
            currentStreak: { type: Number, default: 0 }, // days
            longestStreak: { type: Number, default: 0 },
            lastReadAt: { type: Date, default: null },
        },
        // ── Premium / Credits ─────────────────────────────────────
        credits: {
            type: Number,
            default: 0,
        },
        // ── Account state ─────────────────────────────────────────
        isVerified: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        // OAuth provider IDs for future Google/Discord login
        googleId: { type: String, default: null },
        discordId: { type: String, default: null },
    },
    { timestamps: true }
);

// ── Hash password before saving ───────────────────────────────
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// ── Compare entered password with hashed ─────────────────────
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// ── Indexes ───────────────────────────────────────────────────
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ role: 1 });

module.exports = mongoose.model("User", userSchema);
