const jwt = require("jsonwebtoken");

/**
 * Generate a signed JWT token for a user
 * @param {string} id - MongoDB user _id
 * @returns {string} signed JWT string
 */
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "7d", // token valid for 7 days
    });
};

module.exports = generateToken;
