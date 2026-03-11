import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMyBookmarks, fetchBooks } from "../services/api";
import "./Library.css";

function Library() {
    const navigate = useNavigate();
    const [bookmarks, setBookmarks] = useState([]);

    // Recommendations state
    const [trending, setTrending] = useState([]);
    const [newest, setNewest] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDashboard = async () => {
            setLoading(true);
            try {
                // Fetch Continue Reading history
                const bms = await fetchMyBookmarks();
                setBookmarks(bms || []);

                // Fetch Trending
                const trendData = await fetchBooks({ sort: "trending", limit: 6 });
                setTrending(trendData.books || []);

                // Fetch Recently Added
                const newData = await fetchBooks({ sort: "newest", limit: 6 });
                setNewest(newData.books || []);
            } catch (err) {
                console.error("Failed to load library dashboard:", err);
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, []);

    // Extract only the top 3 items for the "Continue Reading" banner to save space
    const continueReadingBooks = bookmarks.filter(b => b.book).slice(0, 3);

    const SkeletonCard = () => (
        <div className="book-card-skeleton">
            <div className="skeleton skeleton-cover"></div>
            <div className="skeleton-info">
                <div className="skeleton skeleton-text" style={{ width: '75%' }}></div>
                <div className="skeleton skeleton-text skeleton-sm" style={{ width: '50%' }}></div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="library-container fade-in">
                <h1 className="library-title">Discover & Read</h1>
                <div className="book-grid-section">
                    <div className="section-header">
                        <h2 className="section-subtitle">🔥 Trending Now</h2>
                    </div>
                    <div className="horizontal-scroll">
                        {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                </div>
                <div className="book-grid-section">
                    <div className="section-header">
                        <h2 className="section-subtitle">✨ Recently Added</h2>
                    </div>
                    <div className="horizontal-scroll">
                        {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="library-container fade-in">
            <h1 className="library-title">Discover & Read</h1>

            {/* CONTINUE READING HEADER CAROUSEL */}
            {continueReadingBooks.length > 0 && (
                <div className="continue-reading-section">
                    <h2 className="section-subtitle">Jump Back In</h2>
                    <div className="continue-cards-wrapper">
                        {continueReadingBooks.map(bm => (
                            <div key={bm._id} className="continue-card" onClick={() => navigate(`/read/${bm.book._id}/${bm.lastChapterNumber}`)}>
                                <div className="continue-card-bg" style={{ backgroundImage: `url(${bm.book.coverImage || bm.book.cover || `https://picsum.photos/seed/${bm.book._id}/400/200`})` }}></div>
                                <div className="continue-card-content">
                                    <div className="continue-text">
                                        <h3>{bm.book.title}</h3>
                                        <p>Continue from Chapter {bm.lastChapterNumber}</p>
                                    </div>
                                    <button className="btn-continue">Resume</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TRENDING CAROUSEL */}
            <div className="book-grid-section">
                <div className="section-header">
                    <h2 className="section-subtitle">🔥 Trending Now</h2>
                    <button className="btn-view-all">View All</button>
                </div>
                {trending.length > 0 ? (
                    <div className="library-grid horizontal-scroll">
                        {trending.map(book => (
                            <div key={book._id} className="book-card" onClick={() => navigate(`/book/${book._id}`)}>
                                <div className="book-cover-wrapper">
                                    <img src={book.coverImage || book.cover || `https://picsum.photos/seed/${book._id}/300/400`} alt={book.title} className="book-cover" />
                                    <div className="book-format-badge">{book.format}</div>
                                </div>
                                <div className="book-info">
                                    <h3 className="book-title" title={book.title}>{book.title}</h3>
                                    <p className="book-author">{book.author}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="empty-message">No trending books right now.</p>
                )}
            </div>

            {/* RECENTLY ADDED */}
            <div className="book-grid-section">
                <div className="section-header">
                    <h2 className="section-subtitle">✨ Recently Added</h2>
                    <button className="btn-view-all">View All</button>
                </div>
                {newest.length > 0 ? (
                    <div className="library-grid horizontal-scroll">
                        {newest.map(book => (
                            <div key={book._id} className="book-card" onClick={() => navigate(`/book/${book._id}`)}>
                                <div className="book-cover-wrapper">
                                    <img src={book.coverImage || book.cover || `https://picsum.photos/seed/${book._id}/300/400`} alt={book.title} className="book-cover" />
                                    <div className="book-format-badge">{book.format}</div>
                                </div>
                                <div className="book-info">
                                    <h3 className="book-title" title={book.title}>{book.title}</h3>
                                    <p className="book-author">{book.author}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="empty-message">No new books added.</p>
                )}
            </div>
        </div>
    );
}

export default Library;
