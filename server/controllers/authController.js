// Auth Controller — Register, Login, Get Current User
// Full JWT logic will be wired up in the authentication day

const register = async (req, res) => {
    try {
        res.status(201).json({ message: "register endpoint — coming soon" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const login = async (req, res) => {
    try {
        res.status(200).json({ message: "login endpoint — coming soon" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMe = async (req, res) => {
    try {
        res.status(200).json({ message: "getMe endpoint — coming soon" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { register, login, getMe };
