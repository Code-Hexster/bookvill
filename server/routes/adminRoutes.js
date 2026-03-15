const express = require("express");
const router = express.Router();
const { getAnalytics } = require("../controllers/adminController");
const { protect, admin } = require("../middleware/authMiddleware");

// All routes here are admin-only
router.use(protect);
router.use(admin);

router.get("/analytics", getAnalytics);

module.exports = router;
