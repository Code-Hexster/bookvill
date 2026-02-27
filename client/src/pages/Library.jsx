import { useState, useMemo } from "react";
import "./Library.css";

const MOCK_BOOKS = [
    { id: 1, title: "Solo Leveling", author: "Chugong", format: "Manhwa", genre: "Action", cover: "https://picsum.photos/seed/solo/160/220", rating: 4.9 },
    { id: 2, title: "One Piece", author: "Eiichiro Oda", format: "Manga", genre: "Adventure", cover: "https://picsum.photos/seed/onepiece/160/220", rating: 4.8 },
    { id: 3, title: "The Name of the Wind", author: "Patrick Rothfuss", format: "Novel", genre: "Fantasy", cover: "https://picsum.photos/seed/namewind/160/220", rating: 4.7 },
    { id: 4, title: "Tower of God", author: "SIU", format: "Manhwa", genre: "Fantasy", cover: "https://picsum.photos/seed/tog/160/220", rating: 4.6 },
    { id: 5, title: "Vinland Saga", author: "Makoto Yukimura", format: "Manga", genre: "Historical", cover: "https://picsum.photos/seed/vinland/160/220", rating: 4.8 },
    { id: 6, title: "Mushoku Tensei", author: "Rifujin na Magonote", format: "Light Novel", genre: "Isekai", cover: "https://picsum.photos/seed/mushoku/160/220", rating: 4.5 },
    { id: 7, title: "Berserk", author: "Kentaro Miura", format: "Manga", genre: "Dark Fantasy", cover: "https://picsum.photos/seed/berserk/160/220", rating: 4.9 },
    { id: 8, title: "Overlord", author: "Kugane Maruyama", format: "Light Novel", genre: "Isekai", cover: "https://picsum.photos/seed/overlord/160/220", rating: 4.6 },
];

const FORMAT_COLORS = {
    "Manga": "#e74c3c",
    "Manhwa": "#3498db",
    "Manhua": "#f39c12",
    "Novel": "#2ecc71",
    "Light Novel": "#9b59b6",
    "Comic": "#1abc9c",
};

const CATEGORIES = ["All", "Manga", "Manhwa", "Novel", "Light Novel", "Manhua"];

function Library() {
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");
    const [sortBy, setSortBy] = useState("default");

    const displayedBooks = useMemo(() => {
        let books = [...MOCK_BOOKS];

        // 1. Filter by category
        if (activeCategory !== "All") {
            books = books.filter((b) => b.format === activeCategory);
        }

        // 2. Search by title
        if (search.trim()) {
            const q = search.trim().toLowerCase();
            books = books.filter((b) => b.title.toLowerCase().includes(q));
        }

        // 3. Sort by popularity (rating desc)
        if (sortBy === "popularity") {
            books = books.sort((a, b) => b.rating - a.rating);
        }

        return books;
    }, [search, activeCategory, sortBy]);

    return (
        <div className="library-page">
            <div className="library-header">
                <h1>📚 Book Library</h1>
                <p>Discover novels, manga, manhwa, and more</p>
            </div>

            {/* Search + Sort Row */}
            <div className="library-controls">
                <div className="search-wrapper">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search by title..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                        <button className="clear-search" onClick={() => setSearch("")}>✕</button>
                    )}
                </div>

                <select
                    className="sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                >
                    <option value="default">Sort: Default</option>
                    <option value="popularity">Sort: Most Popular</option>
                </select>
            </div>

            {/* Category Filter Bar */}
            <div className="filter-bar">
                {CATEGORIES.map((f) => (
                    <button
                        key={f}
                        className={`filter-btn ${activeCategory === f ? "active" : ""}`}
                        onClick={() => setActiveCategory(f)}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Book Grid */}
            {displayedBooks.length === 0 ? (
                <div className="no-results">
                    <span>😶</span>
                    <p>No books found for <strong>"{search}"</strong></p>
                </div>
            ) : (
                <div className="books-grid">
                    {displayedBooks.map((book) => (
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
            )}
        </div>
    );
}

export default Library;
