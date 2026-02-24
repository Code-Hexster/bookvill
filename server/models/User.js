const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

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
            select: false, // never return password in queries by default
        },
        avatar: {
            type: String,
            default: "",
        },
        bio: {
            type: String,
            default: "",
            maxlength: 200,
        },
        totalPagesRead: { type: Number, default: 0 },
        totalMinutesRead: { type: Number, default: 0 },
        library: [
            {
                book: { type: mongoose.Schema.Types.ObjectId, ref: "Book" },
                status: {
                    type: String,
                    enum: ["reading", "completed", "planToRead", "dropped"],
                    default: "planToRead",
                },
                progress: { type: Number, default: 0 },
                bookmarkedAt: { type: Date },
            },
        ],
    },
    { timestamps: true }
);

// ── Hash password before saving ───────────────────────────────
userSchema.pre("save", async function (next) {
    // Only hash if password field was modified
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// ── Instance method: compare entered password with hashed ──────
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
