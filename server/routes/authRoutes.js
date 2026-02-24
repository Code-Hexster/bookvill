const express = require("express");
const router = express.Router();
const { register, login, getMe } = require("../controllers/authController");

// POST /api/auth/register
router.post("/register", register);

// POST /api/auth/login
router.post("/login", login);

// GET /api/auth/me  (protected - to be implemented with auth middleware)
router.get("/me", getMe);

module.exports = router;
