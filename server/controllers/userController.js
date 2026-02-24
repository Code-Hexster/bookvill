// User Controller — Profile, Bookmarks, Reading Status
const getUserProfile = async (req, res) => {
    try {
        res.status(200).json({ message: "getUserProfile — coming soon" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        res.status(200).json({ message: "updateProfile — coming soon" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getBookmarks = async (req, res) => {
    try {
        res.status(200).json({ message: "getBookmarks — coming soon", bookmarks: [] });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateReadingStatus = async (req, res) => {
    try {
        res.status(200).json({ message: "updateReadingStatus — coming soon" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getUserProfile, updateProfile, getBookmarks, updateReadingStatus };
