// Central API service — all backend calls go through here
const API_BASE = "http://localhost:5000/api";

// ── Helpers ───────────────────────────────────────────────────
const getToken = () => localStorage.getItem("bookvill_token");

const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
});

// ── Auth ──────────────────────────────────────────────────────
export const registerUser = async (username, email, password) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Registration failed");
    return data; // { _id, username, email, avatar, token }
};

export const loginUser = async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login failed");
    return data; // { _id, username, email, avatar, token }
};

export const fetchCurrentUser = async () => {
    const res = await fetch(`${API_BASE}/auth/me`, {
        headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Unauthorized");
    return data;
};

// ── Books ──────────────────────────────────────────────────────
export const fetchAllBooks = async () => {
    const res = await fetch(`${API_BASE}/books?limit=100`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch books");
    return data;
};

export const fetchBooks = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/books?${query}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch books");
    return data; // { books, total, page, totalPages }
};

export const fetchBookDetails = async (bookId) => {
    const res = await fetch(`${API_BASE}/books/${bookId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch book details");
    return data; // { _id, title, ...book details, chapters: [...] }
};

export const createBook = async (bookData) => {
    const res = await fetch(`${API_BASE}/books`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(bookData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to create book");
    return data;
};

// ── Reviews ────────────────────────────────────────────────────
export const addBookReview = async (bookId, reviewPayload) => {
    const res = await fetch(`${API_BASE}/books/${bookId}/reviews`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(reviewPayload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to add review");
    return data;
};

export const deleteBookReview = async (bookId, reviewId) => {
    const res = await fetch(`${API_BASE}/books/${bookId}/reviews/${reviewId}`, {
        method: "DELETE",
        headers: authHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to delete review");
    return data;
};

// ── Chapters ───────────────────────────────────────────────────
export const fetchChaptersByBook = async (bookId) => {
    const res = await fetch(`${API_BASE}/chapters/book/${bookId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch chapters");
    return data; // array of { chapterNumber, title, ... }
};

export const fetchChapter = async (bookId, chapterNumber) => {
    const res = await fetch(
        `${API_BASE}/chapters/book/${bookId}/chapter/${chapterNumber}`,
        { headers: authHeaders() }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch chapter");
    return data; // { chapter, navigation: { prev, next } }
};

export const createChapter = async (bookId, chapterData) => {
    const res = await fetch(`${API_BASE}/chapters/book/${bookId}`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(chapterData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to create chapter");
    return data;
};

// ── Bookmarks ──────────────────────────────────────────────────
export const fetchMyBookmarks = async () => {
    const res = await fetch(`${API_BASE}/bookmarks`, { headers: authHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch bookmarks");
    return data; // array sorted by lastReadAt desc
};

export const fetchBookmarkByBook = async (bookId) => {
    const res = await fetch(`${API_BASE}/bookmarks/${bookId}`, { headers: authHeaders() });
    if (res.status === 404) return null;
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch bookmark");
    return data;
};

export const saveProgress = async (bookId, { lastChapterNumber, chapterId, position, readingStatus }) => {
    const res = await fetch(`${API_BASE}/bookmarks/${bookId}`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ lastChapterNumber, chapterId, position, readingStatus }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to save progress");
    return data;
};

export const deleteBookmark = async (bookId) => {
    const res = await fetch(`${API_BASE}/bookmarks/${bookId}`, {
        method: "DELETE",
        headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to delete bookmark");
    return data;
};

// ── Admin Analytics ───────────────────────────────────────────
export const fetchAnalytics = async () => {
    const res = await fetch(`${API_BASE}/admin/analytics`, {
        headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch analytics");
    return data;
};

