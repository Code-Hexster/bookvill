const mongoose = require("mongoose");

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
        // Reading stats
        totalPagesRead: { type: Number, default: 0 },
        totalMinutesRead: { type: Number, default: 0 },
        // Library — books with their reading status
        library: [
            {
                book: { type: mongoose.Schema.Types.ObjectId, ref: "Book" },
                status: {
                    type: String,
                    enum: ["reading", "completed", "planToRead", "dropped"],
                    default: "planToRead",
                },
                progress: { type: Number, default: 0 }, // chapter/page number
                bookmarkedAt: { type: Date },
            },
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
