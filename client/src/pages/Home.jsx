import { Link } from "react-router-dom";
import "./Home.css";

const FORMATS = [
    { icon: "📖", label: "Novels" },
    { icon: "🎌", label: "Manga" },
    { icon: "🇰🇷", label: "Manhwa" },
    { icon: "🇨🇳", label: "Manhua" },
    { icon: "💥", label: "Comics" },
    { icon: "✨", label: "Light Novels" },
];

function Home() {
    return (
        <div className="home">
            {/* Hero */}
            <section className="hero">
                <h1 className="hero-title">
                    Read Everything.<br />
                    <span className="gradient-text">All in One Place.</span>
                </h1>
                <p className="hero-subtitle">
                    Novels, Manga, Manhwa, Manhua &amp; more — one library, one reader, zero hassle.
                </p>
                <div className="hero-actions">
                    <Link to="/library" className="btn-primary btn-large">Browse Library</Link>
                    <Link to="/register" className="btn-outline btn-large">Get Started Free</Link>
                </div>
            </section>

            {/* Format Cards */}
            <section className="formats-section">
                <h2 className="section-title">Every Format You Love</h2>
                <div className="formats-grid">
                    {FORMATS.map((f) => (
                        <div key={f.label} className="format-card">
                            <span className="format-icon">{f.icon}</span>
                            <span className="format-label">{f.label}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features */}
            <section className="features-section">
                <h2 className="section-title">Why BookVill?</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <span className="feature-icon">📚</span>
                        <h3>Unified Library</h3>
                        <p>All your books across every format in one place.</p>
                    </div>
                    <div className="feature-card">
                        <span className="feature-icon">🔖</span>
                        <h3>Smart Bookmarks</h3>
                        <p>Never lose your place — auto-saves progress across devices.</p>
                    </div>
                    <div className="feature-card">
                        <span className="feature-icon">🌙</span>
                        <h3>Reader Modes</h3>
                        <p>Format-native reading — scroll for manhwa, panels for manga, text for novels.</p>
                    </div>
                    <div className="feature-card">
                        <span className="feature-icon">🔍</span>
                        <h3>Powerful Search</h3>
                        <p>Find any title by name, genre, author, or format instantly.</p>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Home;
