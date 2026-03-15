const Book = require("../models/Book");
const User = require("../models/User");
const Chapter = require("../models/Chapter");
const Bookmark = require("../models/Bookmark");
const Category = require("../models/Category");

// ─────────────────────────────────────────────────────────────
// @desc    Get dashboard analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
// ─────────────────────────────────────────────────────────────
const getAnalytics = async (req, res) => {
    try {
        // 1. Quick Stats
        const [userCount, bookCount, chapterCount, reviewStats] = await Promise.all([
            User.countDocuments(),
            Book.countDocuments(),
            Chapter.countDocuments(),
            // Simple aggregation for total reviews (could also just count Book.reviews arrays)
            Book.aggregate([
                { $project: { reviewCount: { $size: "$reviews" } } },
                { $group: { _id: null, total: { $sum: "$reviewCount" } } }
            ])
        ]);

        const totalReviews = reviewStats[0]?.total || 0;

        // 2. Most Read Books
        const mostRead = await Book.find()
            .sort({ totalViews: -1 })
            .limit(5)
            .select("title author coverImage totalViews format")
            .populate("categories", "name icon");

        // 3. Top Rated Books
        const topRated = await Book.find()
            .sort({ "ratings.count": -1, "ratings.sum": -1 })
            .limit(5)
            .select("title author coverImage ratings format")
            .populate("categories", "name icon");

        // 4. Popular Categories
        const popularCategories = await Category.find()
            .sort({ bookCount: -1 })
            .limit(6)
            .select("name icon bookCount slug");

        // 5. Active Users
        const activeUsers = await User.find()
            .sort({ "stats.totalChaptersRead": -1 })
            .limit(5)
            .select("username avatar stats email");

        // 6. Format Distribution
        const formatStats = await Book.aggregate([
            { $group: { _id: "$format", count: { $sum: 1 } } }
        ]);

        res.json({
            stats: {
                users: userCount,
                books: bookCount,
                chapters: chapterCount,
                reviews: totalReviews,
                avgSession: 14.5, // Placeholder for demo
            },
            mostRead,
            topRated,
            popularCategories,
            activeUsers,
            formatStats
        });
    } catch (error) {
        console.error("getAnalytics error:", error.message);
        res.status(500).json({ message: "Server error fetching analytics" });
    }
};

module.exports = { getAnalytics };
