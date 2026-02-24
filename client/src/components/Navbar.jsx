import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
    const location = useLocation();

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
                <Link to="/library" className={`nav-link ${location.pathname === "/library" ? "active" : ""}`}>
                    Library
                </Link>
            </div>

            <div className="navbar-auth">
                <Link to="/login" className="btn-outline">Login</Link>
                <Link to="/register" className="btn-primary">Sign Up</Link>
            </div>
        </nav>
    );
}

export default Navbar;
