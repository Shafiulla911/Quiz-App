import { useState, useEffect, useRef } from "react";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { isSoundMuted, toggleSound, playSound } from "../services/sound";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isAuthenticated, isAdmin, logout } = useAuth();
    const isOnLoginPage = location.pathname === "/login";
    const [muted, setMuted] = useState(isSoundMuted());
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setUserMenuOpen(false);
            }
        };

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setUserMenuOpen(false);
            }
        };

        if (userMenuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            document.addEventListener("keydown", handleKeyDown);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [userMenuOpen]);

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
                        to="/word-puzzle"
                        className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                    >
                        🔤 Word Puzzle
                    </NavLink>
                    <NavLink
                        to="/leaderboard"
                        className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                    >
                        🏆 Leaderboard
                    </NavLink>
                    {isAdmin && (
                        <NavLink
                            to="/admin"
                            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                        >
                            👑 Admin Panel
                        </NavLink>
                    )}
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
                    <div className="user-profile-menu-container" ref={menuRef}>
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
                                    <div style={{ marginTop: "4px" }}>
                                        <span className={`role-badge ${isAdmin ? "role-admin" : "role-user"}`}>
                                            {isAdmin ? "👑 Admin" : "👤 User"}
                                        </span>
                                    </div>
                                </div>
                                <hr className="dropdown-divider" />
                                {isAdmin && (
                                    <Link
                                        to="/admin"
                                        className="dropdown-item"
                                        onClick={() => setUserMenuOpen(false)}
                                    >
                                        👑 Admin Studio
                                    </Link>
                                )}
                                <Link
                                    to="/profile"
                                    className="dropdown-item"
                                    onClick={() => setUserMenuOpen(false)}
                                >
                                    👤 My Profile & History
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
                    !isOnLoginPage && (
                        <Link to="/login" className="login-nav-btn">
                            Sign In / Register
                        </Link>
                    )
                )}
            </div>
        </header>
    );
}