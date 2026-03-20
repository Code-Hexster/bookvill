import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMyBookmarks, fetchBooks } from "../services/api";
import "./Library.css";

const TABS = ["Popular", "Top Selling", "New", "Manga"];

// Mock trending authors
const TRENDING_AUTHORS = [
    { name: "Jane Austen", initials: "JA", color: "#7c3aed" },
    { name: "Bram Stoker", initials: "BS", color: "#0891b2" },
    { name: "Arthur Conan Doyle", initials: "AC", color: "#059669" },
    { name: "Herman Melville", initials: "HM", color: "#d97706" },
    { name: "Mary Shelley", initials: "MS", color: "#dc2626" },
];

// Mock popular blogs
const POPULAR_BLOGS = [
    { title: "Top 5 Public Domain Classics to Read", author: "BookVill Team", likes: 122, comments: 44, img: "https://picsum.photos/seed/blog1/60/60" },
    { title: "Why Manga Makes You Read Faster", author: "Aryan S.", likes: 88, comments: 22, img: "https://picsum.photos/seed/blog2/60/60" },
    { title: "Building a Reading Habit in 2025", author: "Demo Author", likes: 12, comments: 4, img: "https://picsum.photos/seed/blog3/60/60" },
];

export default function Library() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("Popular");
    const [books, setBooks] = useState([]);
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [followedAuthors, setFollowedAuthors] = useState([TRENDING_AUTHORS[4]]); // Start with one demo followed author

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                let params = { limit: 10 };
                if (activeTab === "Popular") params.sort = "trending";
                else if (activeTab === "Top Selling") params.sort = "rating";
                else if (activeTab === "New") params.sort = "newest";
                else if (activeTab === "Manga") { params.format = "manga"; params.sort = "trending"; }

                const [booksData, bookmarksData] = await Promise.all([
                    fetchBooks(params),
                    fetchMyBookmarks().catch(() => []),
                ]);
                setBooks(booksData.books || []);
                setBookmarks(bookmarksData || []);
            } catch {
                // silent
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [activeTab]);

    const continueReading = bookmarks.filter(b => b.book).slice(0, 3);

    const handleSearch = (e) => {
        if (e.key === "Enter" && search.trim()) {
            navigate(`/browse?q=${encodeURIComponent(search.trim())}`);
        }
    };

    const toggleFollow = (author) => {
        setFollowedAuthors(prev => {
            const isFollowing = prev.some(a => a.name === author.name);
            if (isFollowing) {
                return prev.filter(a => a.name !== author.name);
            } else {
                return [...prev, author];
            }
        });
    };

    const SkeletonCard = () => (
        <div className="lib-book-card skeleton-card">
            <div className="skeleton lib-cover-skel" />
            <div className="skeleton lib-title-skel" />
            <div className="skeleton lib-author-skel" />
        </div>
    );

    return (
        <div className="lib-layout">
            {/* ── TOP BAR ─────────────────────────────────── */}
            <div className="lib-topbar">
                <div className="lib-search-wrap">
                    <svg className="lib-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                    <input
                        className="lib-search-input"
                        placeholder="Search books, authors..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={handleSearch}
                    />
                </div>
                <div className="lib-topbar-actions">
                    <button className="lib-icon-btn" title="Dark mode">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
                    </button>
                    <button className="lib-icon-btn" title="Notifications">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                    </button>
                    <div className="lib-avatar" title="Profile">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                    </div>
                </div>
            </div>

            {/* ── MAIN CONTENT ──────────────────────────── */}
            <div className="lib-body">
                {/* ── CENTER PANEL ── */}
                <div className="lib-center">
                    {/* Tabs */}
                    <div className="lib-tabs">
                        {TABS.map(tab => (
                            <button
                                key={tab}
                                className={`lib-tab ${activeTab === tab ? "active" : ""}`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab}
                            </button>
                        ))}
                        <button className="lib-tab-next" onClick={() => navigate("/browse")}>
                            Next ›
                        </button>
                    </div>

                    {/* Book Grid */}
                    <div className="lib-book-grid">
                        {loading
                            ? Array(10).fill(0).map((_, i) => <SkeletonCard key={i} />)
                            : books.map(book => (
                                <div
                                    key={book._id}
                                    className="lib-book-card"
                                    onClick={() => navigate(`/book/${book._id}`)}
                                >
                                    <div className="lib-book-cover-wrap">
                                        <img
                                            src={book.coverImage || `https://picsum.photos/seed/${book._id}/200/280`}
                                            alt={book.title}
                                            className="lib-book-cover"
                                            loading="lazy"
                                        />
                                        <div className="lib-book-format">{book.format}</div>
                                    </div>
                                    <p className="lib-book-title" title={book.title}>{book.title}</p>
                                    <p className="lib-book-author">{book.author}</p>
                                </div>
                            ))
                        }
                    </div>

                    {/* Continue Reading */}
                    {continueReading.length > 0 && (
                        <div className="lib-continue-section">
                            <h3 className="lib-section-title">Continue Reading</h3>
                            {continueReading.map(bm => {
                                const pct = Math.round((bm.lastChapterNumber / (bm.book.chapterCount || 10)) * 100);
                                return (
                                    <div
                                        key={bm._id}
                                        className="lib-continue-row"
                                        onClick={() => navigate(`/read/${bm.book._id}/${bm.lastChapterNumber}`)}
                                    >
                                        <img
                                            src={bm.book.coverImage || `https://picsum.photos/seed/${bm.book._id}/40/56`}
                                            alt={bm.book.title}
                                            className="lib-continue-thumb"
                                        />
                                        <div className="lib-continue-info">
                                            <p className="lib-continue-title">{bm.book.title}</p>
                                            <p className="lib-continue-meta">Ch. {bm.lastChapterNumber}</p>
                                            <div className="lib-progress-bar">
                                                <div className="lib-progress-fill" style={{ width: `${Math.min(pct, 100)}%` }} />
                                            </div>
                                        </div>
                                        <span className="lib-continue-pct">{Math.min(pct, 100)}% complete</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ── RIGHT PANEL ── */}
                <aside className="lib-right">
                    {/* Favorite Authors */}
                    {followedAuthors.length > 0 && (
                        <div className="lib-widget">
                            <h3 className="lib-widget-title">Favorite Authors</h3>
                            <div className="lib-authors-list">
                                {followedAuthors.map((a, i) => (
                                    <div key={i} className="lib-author-row">
                                        <div className="lib-author-avatar" style={{ background: a.color }}>
                                            {a.initials}
                                        </div>
                                        <span className="lib-author-name">{a.name}</span>
                                        <button
                                            className="lib-follow-btn following"
                                            onClick={() => toggleFollow(a)}
                                        >
                                            Unfollow
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Trending Authors */}
                    <div className="lib-widget">
                        <h3 className="lib-widget-title">Trending Author</h3>
                        <div className="lib-authors-list">
                            {TRENDING_AUTHORS.map((a, i) => {
                                const isFollowing = followedAuthors.some(fa => fa.name === a.name);
                                return (
                                    <div key={i} className="lib-author-row">
                                        <div className="lib-author-avatar" style={{ background: a.color }}>
                                            {a.initials}
                                        </div>
                                        <span className="lib-author-name">{a.name}</span>
                                        <button
                                            className={`lib-follow-btn ${isFollowing ? "following" : ""}`}
                                            onClick={() => toggleFollow(a)}
                                        >
                                            {isFollowing ? "Unfollow" : "Follow"}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Popular Blogs */}
                    <div className="lib-widget">
                        <h3 className="lib-widget-title">Popular Blogs</h3>
                        <div className="lib-blogs-list">
                            {POPULAR_BLOGS.map((blog, i) => (
                                <div key={i} className="lib-blog-row">
                                    <img src={blog.img} alt={blog.title} className="lib-blog-img" />
                                    <div className="lib-blog-info">
                                        <p className="lib-blog-title">{blog.title}</p>
                                        <p className="lib-blog-author">Published by {blog.author}</p>
                                        <div className="lib-blog-stats">
                                            <span>👍 {blog.likes}</span>
                                            <span>💬 {blog.comments}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
