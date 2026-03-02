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

