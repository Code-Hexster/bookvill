import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { fetchBooks } from "../services/api";
import "./Browse.css";

function Browse() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Filters from URL
    const query = searchParams.get("q") || "";
    const format = searchParams.get("format") || "";
    const category = searchParams.get("category") || "";
    const sort = searchParams.get("sort") || "newest";

    const loadBooks = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page,
                limit: 12,
                search: query,
                format,
                category,
                sort
            };
            const data = await fetchBooks(params);
            setBooks(data.books || []);
            setTotal(data.total || 0);
            setTotalPages(data.totalPages || 1);
        } catch (err) {
            console.error("Browse load error:", err);
        } finally {
            setLoading(false);
        }
    }, [page, query, format, category, sort]);

    useEffect(() => {
        loadBooks();
    }, [loadBooks]);

    const updateFilter = (key, value) => {
        const newParams = new URLSearchParams(searchParams);
        if (value) {
            newParams.set(key, value);
        } else {
            newParams.delete(key);
        }
        newParams.set("page", "1"); // Reset to page 1 on filter change
        setSearchParams(newParams);
        setPage(1);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        const q = e.target.q.value;
        updateFilter("q", q);
    };

    return (
        <div className="browse-page fade-in">
            <div className="browse-header">
                <h1>Browse Library</h1>
                <p>Discover your next favorite story</p>
            </div>

            <div className="browse-controls">
                <form className="search-bar-large" onSubmit={handleSearch}>
                    <input
                        type="text"
                        name="q"
                        placeholder="Search by title, author, or tags..."
                        defaultValue={query}
                    />
                    <button type="submit">🔍 Search</button>
                </form>

                <div className="filters-row">
                    <select value={format} onChange={(e) => updateFilter("format", e.target.value)}>
                        <option value="">All Formats</option>
                        <option value="novel">Novels</option>
                        <option value="manga">Manga</option>
                        <option value="manhwa">Manhwa</option>
                    </select>

                    <select value={sort} onChange={(e) => updateFilter("sort", e.target.value)}>
                        <option value="newest">Newest</option>
                        <option value="trending">Trending</option>
                        <option value="top-rated">Top Rated</option>
                        <option value="a-z">A-Z</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="browse-loading">
                    <div className="spinner"></div>
                    <p>Fetching books...</p>
                </div>
            ) : (
                <>
                    <div className="results-count">
                        Found {total} books {query && `for "${query}"`}
                    </div>

                    <div className="browse-grid">
                        {books.map(book => (
                            <div key={book._id} className="book-card" onClick={() => navigate(`/book/${book._id}`)}>
                                <div className="book-cover-wrapper">
                                    <img src={book.coverImage || `https://picsum.photos/seed/${book._id}/300/400`} alt={book.title} />
                                    <div className="book-format-badge">{book.format}</div>
                                </div>
                                <div className="book-info">
                                    <h3>{book.title}</h3>
                                    <p>{book.author}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {books.length === 0 && (
                        <div className="empty-browse">
                            <p>No books found matching your criteria.</p>
                            <button className="btn-primary" onClick={() => setSearchParams({})}>Clear All Filters</button>
                        </div>
                    )}

                    {totalPages > 1 && (
                        <div className="pagination">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                            >
                                Previous
                            </button>
                            <span>Page {page} of {totalPages}</span>
                            <button
                                disabled={page === totalPages}
                                onClick={() => setPage(p => p + 1)}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default Browse;
