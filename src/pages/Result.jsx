import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { submitScore } from "../services/api";
import { playSound } from "../services/sound";
import { useAuth } from "../context/AuthContext";

export default function Result() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    const data = location.state;

    const [playerName, setPlayerName] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [showReview, setShowReview] = useState(false);

    useEffect(() => {
        if (user && user.username) {
            setPlayerName(user.username);
        }
    }, [user]);


    if (!data || data.score === undefined || data.total === undefined) {
        return (
            <div className="result-card-wrapper">
                <div className="no-result-card">
                    <h2>No Quiz Results Found</h2>
                    <p>It looks like you haven't taken a quiz in this session yet.</p>
                    <button className="primary-btn" onClick={() => navigate("/")}>
                        Start a Quiz
                    </button>
                </div>
            </div>
        );
    }

    const {
        score,
        total,
        percentage,
        maxStreak = 0,
        category = "General Knowledge",
        totalDurationSecs = 0,
        history = []
    } = data;

    const getCelebration = () => {
        if (percentage === 100) {
            return {
                icon: "🏆",
                title: "Flawless Grandmaster!",
                message: "Perfection! You got every single question right."
            };
        }
        if (percentage >= 80) {
            return {
                icon: "🥇",
                title: "Outstanding Performance!",
                message: "Brilliant work! Your knowledge in this topic is impressive."
            };
        }
        if (percentage >= 60) {
            return {
                icon: "🥈",
                title: "Great Job!",
                message: "Solid score! You demonstrated strong understanding."
            };
        }
        if (percentage >= 40) {
            return {
                icon: "🥉",
                title: "Good Effort!",
                message: "Not bad at all! A little more practice and you'll ace it."
            };
        }
        return {
            icon: "💡",
            title: "Keep Learning!",
            message: "Every quiz is a stepping stone. Review the answers below to improve!"
        };
    };

    const celebration = getCelebration();

    const handleSubmitLeaderboard = async (e) => {
        e.preventDefault();
        const trimmed = playerName.trim() || "Anonymous Player";
        setSubmitting(true);
        setSubmitError(null);

        try {
            await submitScore({
                playerName: trimmed,
                score,
                totalQuestions: total,
                percentage,
                category,
                userId: user ? user.id : null
            });
            setSubmitted(true);
            playSound("correct");
        } catch (err) {
            console.error("Score submission error:", err);
            setSubmitError(err.message || "Failed to submit score.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="result-container">
            {/* Header Banner */}
            <div className="result-header">
                <div className="celebration-icon">{celebration.icon}</div>
                <h1 className="celebration-title">{celebration.title}</h1>
                <p className="celebration-subtitle">{celebration.message}</p>
            </div>

            {/* Score Ring & Metrics Grid */}
            <div className="score-summary-card">
                <div className="score-ring-wrapper">
                    <div className="circular-score">
                        <span className="score-percentage-num">{percentage}%</span>
                        <span className="score-fraction">{score} of {total} Correct</span>
                    </div>
                </div>

                <div className="metrics-grid">
                    <div className="metric-box">
                        <span className="metric-icon">📁</span>
                        <span className="metric-label">Category</span>
                        <strong className="metric-value">{category}</strong>
                    </div>
                    <div className="metric-box">
                        <span className="metric-icon">🔥</span>
                        <span className="metric-label">Max Streak</span>
                        <strong className="metric-value">{maxStreak}x</strong>
                    </div>
                    <div className="metric-box">
                        <span className="metric-icon">⏱️</span>
                        <span className="metric-label">Time Taken</span>
                        <strong className="metric-value">{totalDurationSecs}s</strong>
                    </div>
                    <div className="metric-box">
                        <span className="metric-icon">🎯</span>
                        <span className="metric-label">Accuracy</span>
                        <strong className="metric-value">{percentage}%</strong>
                    </div>
                </div>
            </div>

            {/* Leaderboard Submit Section */}
            <div className="leaderboard-submit-box">
                {!submitted ? (
                    <form onSubmit={handleSubmitLeaderboard} className="submit-score-form">
                        <div className="form-info">
                            <h3>Save Score to Leaderboard</h3>
                            <p>Enter your nickname to showcase your score on the rankings table:</p>
                        </div>
                        <div className="form-inputs">
                            <input
                                type="text"
                                className="name-input"
                                placeholder="Enter your player name..."
                                value={playerName}
                                onChange={(e) => setPlayerName(e.target.value)}
                                maxLength={30}
                                disabled={submitting}
                            />
                            <button
                                type="submit"
                                className="submit-score-btn"
                                disabled={submitting}
                            >
                                {submitting ? "Posting..." : "Post Score 🚀"}
                            </button>
                        </div>
                        {submitError && <p className="form-error">⚠️ {submitError}</p>}
                    </form>
                ) : (
                    <div className="submit-success-banner">
                        <span>🎉 Your score of <strong>{score}/{total} ({percentage}%)</strong> has been recorded on the leaderboard!</span>
                        <button
                            type="button"
                            className="view-board-btn"
                            onClick={() => navigate("/leaderboard")}
                        >
                            View Leaderboard →
                        </button>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="result-actions-row">
                <button
                    type="button"
                    className="action-btn primary"
                    onClick={() => {
                        playSound("tick");
                        navigate("/quiz", { state: data });
                    }}
                >
                    🔄 Play Again
                </button>
                <button
                    type="button"
                    className="action-btn secondary"
                    onClick={() => {
                        playSound("tick");
                        navigate("/");
                    }}
                >
                    🌟 Other Categories
                </button>
                <button
                    type="button"
                    className="action-btn tertiary"
                    onClick={() => {
                        playSound("tick");
                        setShowReview(!showReview);
                    }}
                >
                    {showReview ? "▲ Hide Review" : "📝 Review All Answers"}
                </button>
            </div>

            {/* Answer Review Section */}
            {showReview && (
                <div className="review-section">
                    <h3 className="review-heading">Question-by-Question Breakdown</h3>
                    <div className="review-list">
                        {history.map((item, idx) => (
                            <div
                                key={idx}
                                className={`review-card ${item.isCorrect ? "review-correct" : "review-wrong"}`}
                            >
                                <div className="review-card-header">
                                    <span className="review-q-num">Q{idx + 1}</span>
                                    <span className="review-status-badge">
                                        {item.isCorrect ? "✓ Correct" : item.wasTimeout ? "⏱️ Timed Out" : "✕ Incorrect"}
                                    </span>
                                </div>
                                <h4 className="review-q-text">{item.question}</h4>

                                <div className="review-answers-box">
                                    <div className="review-ans-row">
                                        <span className="ans-label">Your Answer:</span>
                                        <span className={`ans-val ${item.isCorrect ? "correct-text" : "wrong-text"}`}>
                                            {item.selectedOption}
                                        </span>
                                    </div>
                                    {!item.isCorrect && (
                                        <div className="review-ans-row">
                                            <span className="ans-label">Correct Answer:</span>
                                            <span className="ans-val correct-text">
                                                {item.correctAnswer}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {item.explanation && (
                                    <div className="review-explanation">
                                        💡 <em>{item.explanation}</em>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}