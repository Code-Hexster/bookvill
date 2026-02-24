import "./Library.css";

const MOCK_BOOKS = [
    { id: 1, title: "Solo Leveling", author: "Chugong", format: "Manhwa", genre: "Action", cover: "https://picsum.photos/seed/solo/160/220", rating: 4.9 },
    { id: 2, title: "One Piece", author: "Eiichiro Oda", format: "Manga", genre: "Adventure", cover: "https://picsum.photos/seed/onepiece/160/220", rating: 4.8 },
    { id: 3, title: "The Name of the Wind", author: "Patrick Rothfuss", format: "Novel", genre: "Fantasy", cover: "https://picsum.photos/seed/namewind/160/220", rating: 4.7 },
    { id: 4, title: "Tower of God", author: "SIU", format: "Manhwa", genre: "Fantasy", cover: "https://picsum.photos/seed/tog/160/220", rating: 4.6 },
    { id: 5, title: "Vinland Saga", author: "Makoto Yukimura", format: "Manga", genre: "Historical", cover: "https://picsum.photos/seed/vinland/160/220", rating: 4.8 },
    { id: 6, title: "Mushoku Tensei", author: "Rifujin na Magonote", format: "Light Novel", genre: "Isekai", cover: "https://picsum.photos/seed/mushoku/160/220", rating: 4.5 },
];

const FORMAT_COLORS = {
    "Manga": "#e74c3c",
    "Manhwa": "#3498db",
    "Manhua": "#f39c12",
    "Novel": "#2ecc71",
    "Light Novel": "#9b59b6",
    "Comic": "#1abc9c",
};

function Library() {
    return (
        <div className="library-page">
            <div className="library-header">
                <h1>📚 Book Library</h1>
                <p>Discover novels, manga, manhwa, and more</p>
            </div>

            {/* Filter bar */}
            <div className="filter-bar">
                {["All", "Manga", "Manhwa", "Novel", "Light Novel", "Manhua"].map((f) => (
                    <button key={f} className={`filter-btn ${f === "All" ? "active" : ""}`}>
                        {f}
                    </button>
                ))}
            </div>

            {/* Book Grid */}
            <div className="books-grid">
                {MOCK_BOOKS.map((book) => (
                    <div key={book.id} className="book-card">
                        <div className="book-cover-wrapper">
                            <img src={book.cover} alt={book.title} className="book-cover" />
                            <span
                                className="format-badge"
                                style={{ background: FORMAT_COLORS[book.format] || "#555" }}
                            >
                                {book.format}
                            </span>
                        </div>
                        <div className="book-info">
                            <h3 className="book-title">{book.title}</h3>
                            <p className="book-author">by {book.author}</p>
                            <div className="book-meta">
                                <span className="book-genre">{book.genre}</span>
                                <span className="book-rating">⭐ {book.rating}</span>
                            </div>
                            <button className="btn-read">Read Now</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Library;
