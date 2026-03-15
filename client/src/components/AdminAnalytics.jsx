import React, { useState, useEffect } from "react";
import { fetchAnalytics } from "../services/api";
import "./AdminAnalytics.css";

const AdminAnalytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAnalytics()
            .then(setData)
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="analytics-loading">
                <div className="spinner"></div>
                <p>Calculating platform metrics...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="analytics-error alert-error">
                <p>⚠️ {error}</p>
            </div>
        );
    }

    const { stats, mostRead, topRated, popularCategories, activeUsers, formatStats } = data;

    return (
        <div className="analytics-dashboard">
            {/* ── Quick Stats Grid ── */}
            <div className="stats-grid">
                <div className="stat-card">
                    <span className="stat-icon">👥</span>
                    <div className="stat-info">
                        <h3>{stats.users}</h3>
                        <p>Total Readers</p>
                    </div>
                </div>
                <div className="stat-card">
                    <span className="stat-icon">📚</span>
                    <div className="stat-info">
                        <h3>{stats.books}</h3>
                        <p>Total Books</p>
                    </div>
                </div>
                <div className="stat-card">
                    <span className="stat-icon">📑</span>
                    <div className="stat-info">
                        <h3>{stats.chapters}</h3>
                        <p>Chapters</p>
                    </div>
                </div>
                <div className="stat-card">
                    <span className="stat-icon">⭐</span>
                    <div className="stat-info">
                        <h3>{stats.reviews}</h3>
                        <p>Reviews</p>
                    </div>
                </div>
                <div className="stat-card highlight">
                    <span className="stat-icon">⏱️</span>
                    <div className="stat-info">
                        <h3>{stats.avgSession}m</h3>
                        <p>Avg Session</p>
                    </div>
                </div>
            </div>

            <div className="analytics-main-grid">
                {/* ── Most Read Books ── */}
                <div className="analytics-section">
                    <div className="section-header">
                        <h2>Most Read Books</h2>
                        <span className="badge">By Views</span>
                    </div>
                    <div className="top-list">
                        {mostRead.map((book, idx) => (
                            <div key={book._id} className="top-item">
                                <span className="rank">{idx + 1}</span>
                                <img src={book.coverImage} alt={book.title} className="small-cover" />
                                <div className="item-meta">
                                    <h4>{book.title}</h4>
                                    <p>{book.author} • {book.format}</p>
                                </div>
                                <div className="item-value">
                                    <span className="value">{book.totalViews.toLocaleString()}</span>
                                    <span className="label">views</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Top Rated ── */}
                <div className="analytics-section">
                    <div className="section-header">
                        <h2>Top Rated</h2>
                        <span className="badge">By Score</span>
                    </div>
                    <div className="top-list">
                        {topRated.map((book, idx) => {
                            const avg = book.ratings.count > 0
                                ? (book.ratings.sum / book.ratings.count).toFixed(1)
                                : "0.0";
                            return (
                                <div key={book._id} className="top-item">
                                    <span className="rank">{idx + 1}</span>
                                    <div className="item-meta no-img">
                                        <h4>{book.title}</h4>
                                        <div className="stars">
                                            {"★".repeat(Math.round(avg))}{"☆".repeat(5 - Math.round(avg))}
                                            <span className="avg-num">{avg}</span>
                                        </div>
                                    </div>
                                    <div className="item-value">
                                        <span className="value">{book.ratings.count}</span>
                                        <span className="label">ratings</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ── Popular Categories ── */}
                <div className="analytics-section full-width">
                    <div className="section-header">
                        <h2>Popular Categories</h2>
                    </div>
                    <div className="category-stats">
                        {popularCategories.map(cat => (
                            <div key={cat.slug} className="cat-stat-card">
                                <span className="cat-icon">{cat.icon}</span>
                                <div className="cat-info">
                                    <h4>{cat.name}</h4>
                                    <p>{cat.bookCount} Books</p>
                                </div>
                                <div className="cat-progress">
                                    <div
                                        className="progress-fill"
                                        style={{ width: `${(cat.bookCount / Math.max(...popularCategories.map(c => c.bookCount))) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Most Active Users ── */}
                <div className="analytics-section">
                    <div className="section-header">
                        <h2>Most Active Readers</h2>
                    </div>
                    <div className="user-list">
                        {activeUsers.map(user => (
                            <div key={user._id} className="user-item">
                                <div className="user-avatar-small">
                                    {user.avatar ? (
                                        <img src={user.avatar} alt={user.username} />
                                    ) : (
                                        <div className="avatar-placeholder">{user.username[0]}</div>
                                    )}
                                </div>
                                <div className="user-info">
                                    <h4>{user.username}</h4>
                                    <p>{user.email}</p>
                                </div>
                                <div className="user-stat">
                                    <span className="value">{user.stats.totalChaptersRead}</span>
                                    <span className="label">CH Read</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Format Distribution ── */}
                <div className="analytics-section">
                    <div className="section-header">
                        <h2>Library Breakdown</h2>
                    </div>
                    <div className="format-grid">
                        {formatStats.map(stat => (
                            <div key={stat._id} className="format-stat">
                                <span className="format-name">{stat._id}</span>
                                <span className="format-count">{stat.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAnalytics;
