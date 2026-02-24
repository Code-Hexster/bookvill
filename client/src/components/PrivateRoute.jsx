import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * PrivateRoute — wraps protected pages.
 * Redirects to /login if user is not authenticated.
 * Shows a loading state while auth is being checked on mount.
 */
function PrivateRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "60vh",
                fontSize: "1.1rem",
                color: "#888"
            }}>
                Loading...
            </div>
        );
    }

    return user ? children : <Navigate to="/login" replace />;
}

export default PrivateRoute;
