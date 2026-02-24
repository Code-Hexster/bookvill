import { createContext, useContext, useState, useEffect } from "react";
import { fetchCurrentUser } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);       // current user object
    const [loading, setLoading] = useState(true); // checking if user is already logged in

    // ── On app load: restore session from localStorage token ────
    useEffect(() => {
        const restoreSession = async () => {
            const token = localStorage.getItem("bookvill_token");
            if (token) {
                try {
                    const userData = await fetchCurrentUser();
                    setUser(userData);
                } catch {
                    // Token invalid/expired — clear it
                    localStorage.removeItem("bookvill_token");
                }
            }
            setLoading(false);
        };
        restoreSession();
    }, []);

    // ── Login: save token + set user ────────────────────────────
    const login = (userData) => {
        localStorage.setItem("bookvill_token", userData.token);
        setUser(userData);
    };

    // ── Logout: clear token + user ──────────────────────────────
    const logout = () => {
        localStorage.removeItem("bookvill_token");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook for easy access in any component
export const useAuth = () => useContext(AuthContext);
