import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchUserHistory } from "../services/api";
import { playSound } from "../services/sound";

export default function UserProfile() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");

    const loadHistory = useCallback(async () => {
        if (!user || !user.id) return;
        setLoading(true);
        try {
            const data = await fetchUserHistory(user.id);
            setProfileData(data);
        } catch (err) {
            console.error("Failed to load user history:", err);
            setError(err.message || "Failed to load profile history.");
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    const formatDate = (dateStr) => {
        if (!dateStr) return "N/A";
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            });
        } catch {
            return dateStr;
        }
    };

    const history = profileData?.history || [];
    const stats = profileData?.stats || {
        totalGamesPlayed: 0,
        averageAccuracy: 0,
        personalBest: 0,
        favoriteCategory: "None"
    };

    const categories = ["All", ...new Set(history.map((h) => h.category).filter(Boolean))];

    const filteredHistory = history.filter((item) => {
        const matchesCat = categoryFilter === "All" || item.category === categoryFilter;
        const matchesSearch = !searchQuery || item.category.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCat && matchesSearch;
    });

    return (
        <div className="user-profile-container">
            {/* Header / Banner */}
            <div className="profile-hero-card">
                <div className="profile-hero-main">
                    <div className="user-avatar-huge">
                        {user?.username ? user.username.slice(0, 2).toUpperCase() : "US"}
                    </div>
                    <div className="profile-user-details">
                        <div className="profile-title-row">
                            <h1 className="profile-username">{user?.username || "Player"}</h1>
                            <span className={`role-badge ${user?.role === "admin" ? "role-admin" : "role-user"}`}>
                                {user?.role === "admin" ? "👑 Admin" : "👤 Player"}
                            </span>
                        </div>
                        <p className="profile-email">{user?.email}</p>
                        <p className="profile-joined">
                            📅 Member Since: <strong>{formatDate(profileData?.user?.createdAt || user?.createdAt)}</strong>
                        </p>
                    </div>
                </div>

                <div className="profile-hero-actions">
                    {user?.role === "admin" && (
                        <button
                            type="button"
                            className="primary-btn"
                            style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" }}
                            onClick={() => {
                                playSound("streak");
                                navigate("/admin");
                            }}
                        >
                            👑 Admin Panel
                        </button>
                    )}
                    <button
                        type="button"
                        className="danger-btn"
                        onClick={() => {
                            logout();
                            playSound("tick");
                            navigate("/login");
                        }}
                    >
                        Sign Out
                    </button>
                </div>
            </div>

            {/* Performance Stat Cards */}
            <div className="profile-stats-grid">
                <div className="profile-stat-card">
                    <div className="stat-icon">🎮</div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.totalGamesPlayed}</span>
                        <span className="stat-title">Games Completed</span>
                    </div>
                </div>

                <div className="profile-stat-card">
                    <div className="stat-icon">🎯</div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.averageAccuracy}%</span>
                        <span className="stat-title">Average Accuracy</span>
                    </div>
                </div>

                <div className="profile-stat-card">
                    <div className="stat-icon">🏆</div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.personalBest}%</span>
                        <span className="stat-title">Personal Best</span>
                    </div>
                </div>

                <div className="profile-stat-card">
                    <div className="stat-icon">🌟</div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.favoriteCategory}</span>
                        <span className="stat-title">Favorite Category</span>
                    </div>
                </div>
            </div>

            {/* Match History Section */}
            <div className="profile-history-section">
                <div className="section-header-row">
                    <h2>📜 Game History & Performance Log</h2>
                    <button
                        className="primary-btn"
                        onClick={() => {
                            playSound("streak");
                            navigate("/");
                        }}
                    >
                        ⚡ Play New Quiz
                    </button>
                </div>

                {/* Filters */}
                {history.length > 0 && (
                    <div className="manage-controls-card" style={{ marginBottom: "1rem" }}>
                        <div className="search-box">
                            <span className="search-icon">🔍</span>
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search history by category..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="category-select-wrapper">
                            <select
                                className="form-select"
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                            >
                                {categories.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading your game history...</p>
                    </div>
                ) : error ? (
                    <div className="error-card"><p>⚠️ {error}</p></div>
                ) : history.length === 0 ? (
                    <div className="empty-state-card">
                        <span className="empty-icon">🎮</span>
                        <h3>No Games Played Yet!</h3>
                        <p>Complete a quiz and post your score to build your personal history stats.</p>
                        <button
                            className="primary-btn"
                            style={{ marginTop: "1rem" }}
                            onClick={() => {
                                playSound("streak");
                                navigate("/");
                            }}
                        >
                            Start Your First Quiz 🚀
                        </button>
                    </div>
                ) : (
                    <div className="leaderboard-table-card">
                        <table className="leaderboard-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Category</th>
                                    <th>Score</th>
                                    <th>Accuracy</th>
                                    <th>Date & Time</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredHistory.map((item, idx) => (
                                    <tr key={item.id || idx}>
                                        <td>#{idx + 1}</td>
                                        <td><strong>{item.category}</strong></td>
                                        <td>{item.score} / {item.totalQuestions}</td>
                                        <td>
                                            <span className={`accuracy-pill ${item.percentage >= 80 ? "high" : item.percentage >= 50 ? "mid" : "low"}`}>
                                                {item.percentage}%
                                            </span>
                                        </td>
                                        <td className="date-col">{formatDate(item.playedAt)}</td>
                                        <td>
                                            <button
                                                type="button"
                                                className="role-toggle-btn"
                                                onClick={() => {
                                                    playSound("streak");
                                                    navigate("/quiz", { state: { category: item.category } });
                                                }}
                                            >
                                                Play Topic Again 🔄
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
