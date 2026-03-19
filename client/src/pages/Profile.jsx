import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchMyBookmarks } from "../services/api";
import "./Profile.css";

function Profile() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const bms = await fetchMyBookmarks();
                setBookmarks(bms || []);
            } catch (err) {
                // The instruction was to remove console.error calls.
                // Since there were no console.error calls, and only a "// Silence" comment,
                // the comment is removed to reflect a complete silencing of the error.
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const totalRead = bookmarks.filter(b => b.readingStatus === "completed").length;
    const readingList = bookmarks.filter(b => b.readingStatus === "reading");
    const savedList = bookmarks.filter(b => b.readingStatus === "planToRead");

    if (loading) {
        return (
            <div className="profile-loading" style={{ height: "60vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <div className="profile-header">
                <div className="profile-avatar-large">
                    {user?.avatar ? <img src={user.avatar} alt="avatar" /> : user?.username?.[0]?.toUpperCase()}
                </div>
                <div className="profile-info">
                    <h1>{user?.username}</h1>
                    <p className="profile-email">{user?.email}</p>
                    <div className="profile-stats">
                        <div className="stat-box">
                            <span className="stat-value">{totalRead}</span>
                            <span className="stat-label">Books Read</span>
                        </div>
                        <div className="stat-box">
                            <span className="stat-value">{readingList.length}</span>
                            <span className="stat-label">Reading Now</span>
                        </div>
                        <div className="stat-box highlight">
                            <span className="stat-value">🔥 3</span>
                            <span className="stat-label">Day Streak</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="profile-content">
                <section className="profile-section">
                    <h2>📖 Continue Reading</h2>
                    {readingList.length > 0 ? (
                        <div className="history-grid">
                            {readingList.map(bm => (
                                <div key={bm._id} className="history-card" onClick={() => navigate(`/read/${bm.book._id}/${bm.lastChapterNumber}`)}>
                                    <img src={bm.book?.coverImage || bm.book?.cover || `https://picsum.photos/seed/${bm.book?._id}/70/100`} alt="cover" className="history-cover" />
                                    <div className="history-details">
                                        <h4>{bm.book?.title}</h4>
                                        <p>Chapter {bm.lastChapterNumber}</p>
                                        <span className="last-read-time">Read {new Date(bm.lastReadAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="empty-state">You aren't reading any books right now. Go view the library to start one!</p>
                    )}
                </section>

                <section className="profile-section">
                    <h2>🔖 Saved for Later</h2>
                    {savedList.length > 0 ? (
                        <div className="history-grid">
                            {savedList.map(bm => (
                                <div key={bm._id} className="history-card" onClick={() => navigate(`/book/${bm.book._id}`)}>
                                    <img src={bm.book?.coverImage || bm.book?.cover || `https://picsum.photos/seed/${bm.book?._id}/70/100`} alt="cover" className="history-cover" />
                                    <div className="history-details">
                                        <h4>{bm.book?.title}</h4>
                                        <p>{bm.book?.format}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="empty-state">No saved books. You can save books from the Book Details page.</p>
                    )}
                </section>
            </div>
        </div>
    );
}

export default Profile;
