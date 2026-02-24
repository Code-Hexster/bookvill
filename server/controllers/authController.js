const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// ─────────────────────────────────────────────────────────────
// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
// ─────────────────────────────────────────────────────────────
const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // --- Validation ---
        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        // --- Check existing user ---
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(409).json({ message: "Email already in use" });
        }

        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(409).json({ message: "Username already taken" });
        }

        // --- Create user (password is hashed by the pre-save hook in User model) ---
        const user = await User.create({ username, email, password });

        // --- Return user data + JWT ---
        res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error("Register error:", error.message);
        res.status(500).json({ message: "Server error during registration" });
    }
};

// ─────────────────────────────────────────────────────────────
// @desc    Login existing user
// @route   POST /api/auth/login
// @access  Public
// ─────────────────────────────────────────────────────────────
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // --- Validation ---
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        // --- Find user — explicitly select password (it's hidden by default) ---
        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // --- Compare password via bcrypt ---
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // --- Return user data + JWT ---
        res.status(200).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error("Login error:", error.message);
        res.status(500).json({ message: "Server error during login" });
    }
};

// ─────────────────────────────────────────────────────────────
// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private (requires JWT via protect middleware)
// ─────────────────────────────────────────────────────────────
const getMe = async (req, res) => {
    try {
        // req.user is attached by the `protect` middleware
        res.status(200).json({
            _id: req.user._id,
            username: req.user.username,
            email: req.user.email,
            avatar: req.user.avatar,
            bio: req.user.bio,
            totalPagesRead: req.user.totalPagesRead,
            totalMinutesRead: req.user.totalMinutesRead,
            createdAt: req.user.createdAt,
        });
    } catch (error) {
        console.error("getMe error:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = { register, login, getMe };
