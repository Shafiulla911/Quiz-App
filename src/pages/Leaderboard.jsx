import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchLeaderboard } from "../services/api";
import { playSound } from "../services/sound";

export default function Leaderboard() {
    const navigate = useNavigate();
    const [scores, setScores] = useState([]);
    const [filterCategory, setFilterCategory] = useState("All");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function load() {
            try {
                const data = await fetchLeaderboard(50);
                setScores(data);
            } catch (err) {
                console.error("Leaderboard fetch error:", err);
                setError(err.message || "Failed to load leaderboard.");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const categories = ["All", ...new Set(scores.map((s) => s.category).filter(Boolean))];

    const filteredScores = filterCategory === "All"
        ? scores
        : scores.filter((s) => s.category === filterCategory);

    const topThree = filteredScores.slice(0, 3);

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
        } catch {
            return dateStr;
        }
    };

    return (
        <div className="leaderboard-container">
            {/* Header */}
            <div className="leaderboard-header">
                <div className="leaderboard-badge">🏆 Hall of Fame</div>
                <h1 className="leaderboard-title">Top Quiz Masters</h1>
                <p className="leaderboard-subtitle">
                    The highest accuracy and fastest thinkers across all quiz categories.
                </p>
            </div>

            {/* Category Filter Tabs */}
            {categories.length > 1 && (
                <div className="category-filter-tabs">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            type="button"
                            className={`filter-tab ${filterCategory === cat ? "active" : ""}`}
                            onClick={() => {
                                setFilterCategory(cat);
                                playSound("tick");
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            )}

            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p className="loading-text">Loading rankings...</p>
                </div>
            ) : error ? (
                <div className="error-card">
                    <p>⚠️ {error}</p>
                </div>
            ) : filteredScores.length === 0 ? (
                <div className="empty-leaderboard">
                    <span className="empty-icon">🎮</span>
                    <h3>No Scores Yet!</h3>
                    <p>Be the first player to complete a quiz and claim the #1 spot on the leaderboard!</p>
                    <button
                        className="primary-btn"
                        onClick={() => {
                            playSound("streak");
                            navigate("/");
                        }}
                    >
                        Play a Quiz Now 🚀
                    </button>
                </div>
            ) : (
                <>
                    {/* Top 3 Podium (if at least 3 players) */}
                    {topThree.length > 0 && (
                        <div className="podium-grid">
                            {/* Silver - 2nd */}
                            {topThree[1] && (
                                <div className="podium-card silver">
                                    <div className="podium-medal">🥈 2nd</div>
                                    <div className="podium-name">{topThree[1].playerName}</div>
                                    <div className="podium-score">{topThree[1].percentage}%</div>
                                    <div className="podium-details">
                                        {topThree[1].score}/{topThree[1].totalQuestions} • {topThree[1].category}
                                    </div>
                                </div>
                            )}

                            {/* Gold - 1st */}
                            {topThree[0] && (
                                <div className="podium-card gold">
                                    <div className="crown-badge">👑 Champion</div>
                                    <div className="podium-medal">🥇 1st</div>
                                    <div className="podium-name">{topThree[0].playerName}</div>
                                    <div className="podium-score">{topThree[0].percentage}%</div>
                                    <div className="podium-details">
                                        {topThree[0].score}/{topThree[0].totalQuestions} • {topThree[0].category}
                                    </div>
                                </div>
                            )}

                            {/* Bronze - 3rd */}
                            {topThree[2] && (
                                <div className="podium-card bronze">
                                    <div className="podium-medal">🥉 3rd</div>
                                    <div className="podium-name">{topThree[2].playerName}</div>
                                    <div className="podium-score">{topThree[2].percentage}%</div>
                                    <div className="podium-details">
                                        {topThree[2].score}/{topThree[2].totalQuestions} • {topThree[2].category}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Table View */}
                    <div className="leaderboard-table-card">
                        <table className="leaderboard-table">
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Player</th>
                                    <th>Category</th>
                                    <th>Score</th>
                                    <th>Accuracy</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredScores.map((item, idx) => (
                                    <tr key={item.id || idx} className={idx < 3 ? "top-rank-row" : ""}>
                                        <td className="rank-col">
                                            <span className="rank-num">
                                                {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
                                            </span>
                                        </td>
                                        <td className="player-col">
                                            <strong>{item.playerName}</strong>
                                        </td>
                                        <td>
                                            <span className="category-tag">{item.category}</span>
                                        </td>
                                        <td>
                                            {item.score} / {item.totalQuestions}
                                        </td>
                                        <td>
                                            <span className="accuracy-pill">{item.percentage}%</span>
                                        </td>
                                        <td className="date-col">
                                            {formatDate(item.playedAt)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="leaderboard-actions">
                        <button
                            className="primary-btn-large"
                            onClick={() => {
                                playSound("streak");
                                navigate("/");
                            }}
                        >
                            ⚡ Play & Climb The Ranks
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
