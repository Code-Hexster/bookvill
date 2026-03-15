import React, { useState, useEffect } from "react";
import { fetchAllBooks, createBook, createChapter } from "../services/api";
import AdminAnalytics from "../components/AdminAnalytics";
import "./AdminDashboard.css";

function AdminDashboard() {
    const [tab, setTab] = useState("analytics"); // "book", "chapter", or "analytics"
    const [books, setBooks] = useState([]);

    // Status
    const [message, setMessage] = useState({ text: "", type: "" });
    const [loading, setLoading] = useState(false);

    // Book Form
    const [bookForm, setBookForm] = useState({
        title: "", author: "", format: "novel",
        coverImage: "", description: "", tags: ""
    });

    // Chapter Form
    const [chapterForm, setChapterForm] = useState({
        bookId: "", chapterNumber: "", title: "",
        content: "", pages: ""
    });

    useEffect(() => {
        if (tab === "chapter") {
            fetchAllBooks()
                .then(data => setBooks(data.books || []))
                .catch(err => console.error(err));
        }
    }, [tab]);

    const handleMessage = (text, type = "success") => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: "", type: "" }), 4000);
    };

    const submitBook = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                ...bookForm,
                tags: bookForm.tags.split(",").map(t => t.trim()).filter(Boolean)
            };
            await createBook(payload);
            handleMessage("Book created successfully! Add a chapter next.");
            setBookForm({ title: "", author: "", format: "novel", coverImage: "", description: "", tags: "" });
        } catch (err) {
            handleMessage(err.message, "error");
        } finally {
            setLoading(false);
        }
    };

    const submitChapter = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const bookId = chapterForm.bookId;
            if (!bookId) throw new Error("Please select a book.");

            const payload = {
                chapterNumber: parseInt(chapterForm.chapterNumber),
                title: chapterForm.title,
                content: chapterForm.content || null,
                pages: chapterForm.pages ? chapterForm.pages.split("\n").map(l => l.trim()).filter(Boolean) : []
            };

            await createChapter(bookId, payload);
            handleMessage(`Chapter ${payload.chapterNumber} added successfully!`);
            setChapterForm({
                ...chapterForm,
                chapterNumber: parseInt(chapterForm.chapterNumber) + 1,
                title: "",
                content: "",
                pages: ""
            });
        } catch (err) {
            handleMessage(err.message, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-page">
            <div className="admin-header">
                <h1>Admin Dashboard 🛠️</h1>
                <p>Manage content, upload books, and publish chapters securely.</p>
            </div>

            <div className="admin-tabs">
                <button className={`admin-tab ${tab === "book" ? "active" : ""}`} onClick={() => setTab("book")}>
                    📚 Add New Book
                </button>
                <button className={`admin-tab ${tab === "chapter" ? "active" : ""}`} onClick={() => setTab("chapter")}>
                    📑 Upload Chapter
                </button>
                <button className={`admin-tab ${tab === "analytics" ? "active" : ""}`} onClick={() => setTab("analytics")}>
                    📈 Platform Analytics
                </button>
            </div>

            {message.text && (
                <div className={`admin-message ${message.type}`}>
                    {message.text}
                </div>
            )}

            {tab === "book" && (
                <form className="admin-form" onSubmit={submitBook}>
                    <div className="form-group">
                        <label>Title *</label>
                        <input required type="text" value={bookForm.title} onChange={e => setBookForm({ ...bookForm, title: e.target.value })} placeholder="e.g. Solo Leveling" />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Author *</label>
                            <input required type="text" value={bookForm.author} onChange={e => setBookForm({ ...bookForm, author: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Format *</label>
                            <select value={bookForm.format} onChange={e => setBookForm({ ...bookForm, format: e.target.value })}>
                                <option value="novel">Novel (Text)</option>
                                <option value="manga">Manga (Images)</option>
                                <option value="manhwa">Manhwa (Vertical Images)</option>
                                <option value="lightNovel">Light Novel</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Cover Image URL</label>
                        <input type="text" value={bookForm.coverImage} onChange={e => setBookForm({ ...bookForm, coverImage: e.target.value })} placeholder="https://example.com/cover.jpg" />
                    </div>
                    <div className="form-group">
                        <label>Tags & Genres (comma separated)</label>
                        <input type="text" value={bookForm.tags} onChange={e => setBookForm({ ...bookForm, tags: e.target.value })} placeholder="Action, Fantasy, System" />
                    </div>
                    <div className="form-group">
                        <label>Synopsis / Description</label>
                        <textarea rows={4} value={bookForm.description} onChange={e => setBookForm({ ...bookForm, description: e.target.value })}></textarea>
                    </div>
                    <button type="submit" disabled={loading} className="admin-submit-btn">
                        {loading ? "Saving..." : "Create Book Entry"}
                    </button>
                </form>
            )}

            {tab === "chapter" && (
                <form className="admin-form" onSubmit={submitChapter}>
                    <div className="form-group">
                        <label>Select Book *</label>
                        <select required value={chapterForm.bookId} onChange={e => setChapterForm({ ...chapterForm, bookId: e.target.value })}>
                            <option value="">-- Choose Book --</option>
                            {books.map(b => (
                                <option key={b._id} value={b._id}>{b.title} ({b.format})</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Chapter Number *</label>
                            <input required type="number" step="0.1" value={chapterForm.chapterNumber} onChange={e => setChapterForm({ ...chapterForm, chapterNumber: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Chapter Title (Optional)</label>
                            <input type="text" value={chapterForm.title} onChange={e => setChapterForm({ ...chapterForm, title: e.target.value })} />
                        </div>
                    </div>

                    <p className="admin-hint">Fill out ONLY the content input that matches your book's format.</p>

                    <div className="form-group">
                        <label>Text Content (For Novels)</label>
                        <textarea rows={8} placeholder="Paste raw novel text here. Double newline separates paragraphs." value={chapterForm.content} onChange={e => setChapterForm({ ...chapterForm, content: e.target.value })}></textarea>
                    </div>

                    <div className="form-group">
                        <label>Image URLs (For Manga/Manhwa)</label>
                        <textarea rows={5} placeholder="Paste image URLs here, one per line." value={chapterForm.pages} onChange={e => setChapterForm({ ...chapterForm, pages: e.target.value })}></textarea>
                    </div>

                    <button type="submit" disabled={loading} className="admin-submit-btn">
                        {loading ? "Uploading..." : "Publish Chapter"}
                    </button>
                </form>
            )}

            {tab === "analytics" && <AdminAnalytics />}
        </div>
    );
}

export default AdminDashboard;
