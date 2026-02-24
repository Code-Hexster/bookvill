import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <nav className="navbar">
            <Link to="/" className="navbar-logo">
                <span className="logo-icon">📚</span>
                <span className="logo-text">BookVill</span>
            </Link>

            <div className="navbar-links">
                <Link to="/" className={`nav-link ${location.pathname === "/" ? "active" : ""}`}>
                    Home
                </Link>
                {user && (
                    <Link to="/library" className={`nav-link ${location.pathname === "/library" ? "active" : ""}`}>
                        Library
                    </Link>
                )}
            </div>

            <div className="navbar-auth">
                {user ? (
                    // ── Logged in state ──
                    <div className="user-menu">
                        <div className="user-avatar">
                            {user.avatar
                                ? <img src={user.avatar} alt={user.username} />
                                : <span className="avatar-initials">{user.username?.[0]?.toUpperCase()}</span>
                            }
                        </div>
                        <span className="user-name">{user.username}</span>
                        <button className="btn-outline btn-sm" onClick={handleLogout}>
                            Logout
                        </button>
                    </div>
                ) : (
                    // ── Logged out state ──
                    <>
                        <Link to="/login" className="btn-outline">Login</Link>
                        <Link to="/register" className="btn-primary">Sign Up</Link>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
