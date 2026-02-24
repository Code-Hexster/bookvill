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
