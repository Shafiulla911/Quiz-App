import { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { isSoundMuted, toggleSound, playSound } from "../services/sound";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useAuth();
    const [muted, setMuted] = useState(isSoundMuted());
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const handleSoundToggle = () => {
        const isNowOn = toggleSound();
        setMuted(!isNowOn);
        if (isNowOn) {
            playSound("streak");
        }
    };

    return (
        <header className="navbar">
            <div className="navbar-brand">
                <Link to={isAuthenticated ? "/" : "/login"} className="navbar-logo">
                    <span className="logo-badge">🧠</span>
                    <span className="logo-text">Quiz<span className="highlight">Spark</span></span>
                </Link>
            </div>

            {/* Navigation links only visible when logged in */}
            {isAuthenticated && (
                <nav className="navbar-nav">
                    <NavLink
                        to="/"
                        end
                        className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                    >
                        ⚡ Play
                    </NavLink>
                    <NavLink
                        to="/leaderboard"
                        className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                    >
                        🏆 Leaderboard
                    </NavLink>
                    <NavLink
                        to="/add-question"
                        className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                    >
                        ➕ Add Question
                    </NavLink>
                </nav>
            )}

            <div className="navbar-actions">
                {/* Global Theme Toggle Switch */}
                <ThemeToggle />

                {/* Sound Toggle */}
                <button
                    className="sound-toggle-btn"
                    onClick={handleSoundToggle}
                    title={muted ? "Unmute sound effects" : "Mute sound effects"}
                    aria-label="Toggle Sound"
                >
                    {muted ? "🔇" : "🔊"}
                </button>

                {/* User Auth Section */}
                {isAuthenticated && user ? (
                    <div className="user-profile-menu-container">
                        <button
                            type="button"
                            className="user-avatar-pill"
                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                        >
                            <span className="avatar-circle">
                                {user.username.slice(0, 2).toUpperCase()}
                            </span>
                            <span className="user-name-label">{user.username}</span>
                            <span className="arrow-down-icon">▾</span>
                        </button>

                        {userMenuOpen && (
                            <div className="user-dropdown-menu">
                                <div className="dropdown-user-header">
                                    <strong>{user.username}</strong>
                                    <span className="dropdown-email">{user.email}</span>
                                </div>
                                <hr className="dropdown-divider" />
                                <Link
                                    to="/login"
                                    className="dropdown-item"
                                    onClick={() => setUserMenuOpen(false)}
                                >
                                    👤 My Profile
                                </Link>
                                <button
                                    type="button"
                                    className="dropdown-item logout-item"
                                    onClick={() => {
                                        logout();
                                        setUserMenuOpen(false);
                                        playSound("tick");
                                        navigate("/login");
                                    }}
                                >
                                    🚪 Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <Link to="/login" className="login-nav-btn">
                        Sign In / Register
                    </Link>
                )}
            </div>
        </header>
    );
}