const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const connectDB = require("./config/db");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ─── Middleware ──────────────────────────────────────────────
app.use(helmet()); // Security headers
app.use(compression()); // Gzip compression
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Routes ─────────────────────────────────────────────────
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/books", require("./routes/bookRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/chapters", require("./routes/chapterRoutes"));
app.use("/api/bookmarks", require("./routes/bookmarkRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

// ─── Health check ────────────────────────────────────────────
app.get("/", (req, res) => {
    res.json({ message: "📚 BookVill API is running!" });
});

// ─── 404 Handler ────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

// ─── Global Error Handler ────────────────────────────────────
app.use((err, req, res, next) => {
    if (process.env.NODE_ENV !== "production") {
        console.error(err.stack);
    }
    res.status(err.status || 500).json({
        message: err.message || "Something went wrong!",
        error: process.env.NODE_ENV === "production" ? null : err.message
    });
});

// ─── Start Server ────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
