import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchBookDetails, fetchBookmarkByBook, addBookReview, deleteBookReview } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./BookDetails.css";

const MOCK_BOOK = {
    _id: "1",
    title: "Solo Leveling",
    author: "Chugong",
    format: "Manhwa",
    coverImage: "https://picsum.photos/seed/solo/300/400",
    description: "Ten years ago, a mysterious phenomenon called \"The Gate\" appeared, connecting the real world with a realm full of monsters. Since then, humans who possess the ability to enter these dungeons — known as \"Hunters\" — have emerged.\n\nSung Jin-Woo is ranked at the very bottom of the hunter hierarchy: an E-rank hunter.",
    categories: [{ name: "Action" }, { name: "Fantasy" }],
    chapters: Array.from({ length: 20 }).map((_, i) => ({
        _id: `ch${i}`,
        chapterNumber: i + 1,
        title: `Chapter ${i + 1}`,
        publishedAt: new Date().toISOString()
    })),
    ratings: { sum: 49, count: 10 },
    reviews: [],
    totalViews: 1540
};

function BookDetails() {
    const { bookId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [book, setBook] = useState(null);
    const [bookmark, setBookmark] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Review Form State
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
    const [submittingReview, setSubmittingReview] = useState(false);
    const [reviewError, setReviewError] = useState("");

    const loadInfo = async () => {
        try {
            const bookData = await fetchBookDetails(bookId);
            setBook(bookData);

            try {
                const bkmk = await fetchBookmarkByBook(bookId);
                if (bkmk) setBookmark(bkmk);
            } catch (e) { }

        } catch (err) {
            console.error(err);
            if (bookId.length < 10) {
                setBook({ ...MOCK_BOOK, _id: bookId });
            } else {
                setError("Failed to load book details. Make sure the backend connection string is correct.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        loadInfo();
    }, [bookId]);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        setSubmittingReview(true);
        setReviewError("");
        try {
            await addBookReview(bookId, reviewForm);
            setReviewForm({ rating: 5, comment: "" });
            await loadInfo(); // Re-fetch to get updated averages and review list
        } catch (err) {
            setReviewError(err.message);
        } finally {
            setSubmittingReview(false);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm("Are you sure you want to delete this review?")) return;
        try {
            await deleteBookReview(bookId, reviewId);
            await loadInfo(); // Re-fetch to get updated stats
        } catch (err) {
            alert(err.message);
        }
    };

    if (loading) return <div className="book-details-loading"><div className="spinner"></div><p>Loading Book...</p></div>;
    if (error && !book) return <div className="book-details-error">{error}</div>;

    const avgRating = book.ratings?.count > 0
        ? (book.ratings.sum / book.ratings.count).toFixed(1)
        : (book.rating || "N/A");

    const userHasReviewed = book.reviews?.some(r => r.user === user?._id);

    return (
        <div className="book-details-page">
            <button className="back-button" onClick={() => navigate("/library")}>← Back to Library</button>

            <div className="book-details-hero">
                <div className="book-cover-container">
                    <img src={book.coverImage || book.cover} alt={book.title} className="book-hero-cover" />
                    <div className="format-badge">{book.format}</div>
                </div>

                <div className="book-info-main">
                    <h1 className="book-title">{book.title}</h1>
                    <p className="book-author">By {book.author}</p>

                    <div className="book-stats-row">
                        <span className="stat-item">⭐ {avgRating} ({book.ratings?.count || 0})</span>
                        <span className="stat-item">👁️ {book.totalViews || "—"} Views</span>
                        <span className="stat-item">📑 {book.chapters?.length || 0} Chapters</span>
                    </div>

                    <div className="book-tags">
                        {book.categories?.map((cat, i) => (
                            <span key={i} className="tag">{cat.name || cat}</span>
                        ))}
                    </div>

                    <div className="book-synopsis">
                        <h3>Synopsis</h3>
                        <p>{book.description || "No synopsis available for this title yet."}</p>
                    </div>

                    <div className="book-action-buttons">
                        {bookmark ? (
                            <>
                                <button className="btn-primary" onClick={() => navigate(`/read/${book._id || book.id}/${bookmark.lastChapterNumber}`)}>
                                    Continue Reading (Ch. {bookmark.lastChapterNumber})
                                </button>
                                <button className="btn-secondary" onClick={() => navigate(`/read/${book._id || book.id}/1`)}>
                                    Start from Ch. 1
                                </button>
                            </>
                        ) : (
                            <button className="btn-primary" onClick={() => navigate(`/read/${book._id || book.id}/1`)}>
                                Start Reading
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="book-chapters-section">
                <h2>Chapter List</h2>
                {book.chapters?.length > 0 ? (
                    <div className="chapter-list">
                        {book.chapters.map(ch => (
                            <div key={ch._id} className="chapter-item" onClick={() => navigate(`/read/${book._id || book.id}/${ch.chapterNumber}`)}>
                                <span className="chapter-number">Chapter {ch.chapterNumber}</span>
                                <span className="chapter-title">{ch.title}</span>
                                <span className="chapter-date">{ch.publishedAt ? new Date(ch.publishedAt).toLocaleDateString() : ""}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="no-chapters">No chapters available yet.</p>
                )}
            </div>

            {/* REVIEWS SECTION */}
            <div className="book-reviews-section">
                <h2>Reader Reviews</h2>

                {user && !userHasReviewed && (
                    <form className="review-form" onSubmit={handleReviewSubmit}>
                        <h3>Write a Review</h3>
                        {reviewError && <p className="review-error">{reviewError}</p>}
                        <div className="review-form-group">
                            <label>Rating (1-5 ⭐)</label>
                            <select value={reviewForm.rating} onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}>
                                <option value="5">5 - Masterpiece</option>
                                <option value="4">4 - Great</option>
                                <option value="3">3 - Good</option>
                                <option value="2">2 - Poor</option>
                                <option value="1">1 - Terrible</option>
                            </select>
                        </div>
                        <div className="review-form-group">
                            <label>Your Thoughts</label>
                            <textarea
                                required
                                rows={3}
                                placeholder="What did you think of this book?"
                                value={reviewForm.comment}
                                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                            ></textarea>
                        </div>
                        <button type="submit" className="btn-primary" disabled={submittingReview}>
                            {submittingReview ? "Posting..." : "Post Review"}
                        </button>
                    </form>
                )}

                {(!user) && (
                    <p className="review-login-prompt">
                        <button className="btn-outline" onClick={() => navigate("/login")}>Log in</button> to write a review.
                    </p>
                )}

                <div className="reviews-list">
                    {book.reviews?.length > 0 ? (
                        book.reviews.slice().reverse().map((rev) => (
                            <div key={rev._id} className="review-card">
                                <div className="review-header">
                                    <div className="review-user-info">
                                        <div className="review-avatar">
                                            {rev.avatar ? <img src={rev.avatar} alt="avatar" /> : rev.username?.[0]?.toUpperCase()}
                                        </div>
                                        <div className="review-meta">
                                            <strong>{rev.username}</strong>
                                            <span className="review-date">{new Date(rev.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="review-rating">{"⭐".repeat(rev.rating)}</div>
                                </div>
                                <p className="review-body">{rev.comment}</p>

                                {(user?._id === rev.user || user?.role === "admin") && (
                                    <button className="delete-review-btn" onClick={() => handleDeleteReview(rev._id)}>Delete</button>
                                )}
                            </div>
                        ))
                    ) : (
                        <p className="no-reviews">No reviews yet. Be the first to review!</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default BookDetails;
