// Book Controller — Get all books, single book, search
const getAllBooks = async (req, res) => {
    try {
        res.status(200).json({ message: "getAllBooks — coming soon", books: [] });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getBookById = async (req, res) => {
    try {
        res.status(200).json({ message: `getBook ${req.params.id} — coming soon` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const searchBooks = async (req, res) => {
    try {
        res.status(200).json({ message: "searchBooks — coming soon", results: [] });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getAllBooks, getBookById, searchBooks };
