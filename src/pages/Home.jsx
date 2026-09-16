import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCategories, fetchStats } from "../services/api";
import { playSound } from "../services/sound";

const CATEGORY_ICONS = {
    "All": "🌟",
    "Programming & Tech": "💻",
    "Science & Space": "🚀",
    "World Geography": "🌍",
    "History & Arts": "🏛️",
    "General Knowledge": "🧠"
};

const DIFFICULTY_CONFIG = {
    "All":    { emoji: "🌈", label: "All Levels", color: "#6366f1", bg: "rgba(99,102,241,0.12)" },
    "Easy":   { emoji: "🟢", label: "Easy",       color: "#22c55e", bg: "rgba(34,197,94,0.12)"  },
    "Medium": { emoji: "🟡", label: "Medium",     color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
    "Hard":   { emoji: "🔴", label: "Hard",       color: "#ef4444", bg: "rgba(239,68,68,0.12)"  },
};

const QUESTION_COUNTS = [
    { count: 5,  label: "Quick",   emoji: "⚡", desc: "~2 min" },
    { count: 10, label: "Normal",  emoji: "🎯", desc: "~5 min" },
    { count: 15, label: "Pro",     emoji: "🏆", desc: "~8 min" },
];

// view: "picker" | "quiz-config" | "word-puzzle"
export default function Home() {
    const navigate = useNavigate();

    const [view, setView] = useState("picker");
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [difficulty, setDifficulty] = useState("All");
    const [questionCount, setQuestionCount] = useState(10);
    const [isTimed, setIsTimed] = useState(true);
    const [stats, setStats] = useState(null);

    const personalBest = localStorage.getItem("quiz_personal_best") || 0;

    useEffect(() => {
        async function loadData() {
            try {
                const [catData, statData] = await Promise.all([
                    fetchCategories().catch(() => []),
                    fetchStats().catch(() => null)
                ]);
                const allCategories = [
                    { category: "All", count: catData.reduce((acc, c) => acc + c.count, 0) || 28 },
                    ...catData
                ];
                setCategories(allCategories);
                setStats(statData);
            } catch (err) {
                console.error("Error loading home data:", err);
            }
        }
        loadData();
    }, []);

    const handleStartQuiz = () => {
        playSound("streak");
        navigate("/quiz", {
            state: { category: selectedCategory, difficulty, limit: questionCount, isTimed }
        });
    };

    // ─── GAME PICKER ────────────────────────────────────────────────────────────
    if (view === "picker") {
        return (
            <div className="home-container">
                <div className="hero-section">
                    <div className="hero-badge">⚡ Interactive Knowledge Challenge</div>
                    <h1 className="hero-title">
                        Spark Your Mind with <span className="hero-gradient">QuizSpark</span>
                    </h1>
                    <p className="hero-subtitle">
                        Pick a game mode below and start playing!
                    </p>
                </div>

                {/* Game Picker Cards */}
                <div className="game-picker-grid">
                    {/* Quiz Game Card */}
                    <button
                        className="game-picker-card quiz-picker-card"
                        onClick={() => { playSound("tick"); setView("quiz-config"); }}
                    >
                        <div className="game-picker-icon">🧠</div>
                        <div className="game-picker-info">
                            <h2 className="game-picker-title">Quiz Game</h2>
                            <p className="game-picker-desc">Answer trivia questions across tech, science, history & more. Choose your category, difficulty, and challenge yourself!</p>
                        </div>
                        <div className="game-picker-arrow">Play →</div>
                    </button>

                    {/* Word Puzzle Card */}
                    <button
                        className="game-picker-card puzzle-picker-card"
                        onClick={() => { playSound("streak"); navigate("/word-puzzle"); }}
                    >
                        <div className="game-picker-icon">🔤</div>
                        <div className="game-picker-info">
                            <h2 className="game-picker-title">Word Puzzle</h2>
                            <p className="game-picker-desc">Unscramble hidden words from tech, science & history. Use clue hints and place letters to crack each puzzle!</p>
                        </div>
                        <div className="game-picker-arrow">Play →</div>
                    </button>
                </div>

                {/* Quick Stats Banner */}
                <div className="stats-banner">
                    <div className="stat-card">
                        <div className="stat-icon">🏆</div>
                        <div className="stat-info">
                            <span className="stat-value">{personalBest}%</span>
                            <span className="stat-title">Personal Best</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">📚</div>
                        <div className="stat-info">
                            <span className="stat-value">{stats ? stats.totalQuestions : "28+"}</span>
                            <span className="stat-title">Total Questions</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">🎮</div>
                        <div className="stat-info">
                            <span className="stat-value">{stats ? stats.totalGamesPlayed : "0"}</span>
                            <span className="stat-title">Games Completed</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ─── QUIZ CONFIG ─────────────────────────────────────────────────────────────
    return (
        <div className="home-container">
            {/* Back Button */}
            <button
                className="back-to-picker-btn"
                onClick={() => { playSound("tick"); setView("picker"); }}
            >
                ← Back to Games
            </button>

            <div className="hero-section" style={{ paddingTop: "0.5rem" }}>
                <div className="hero-badge">🧠 Quiz Game Setup</div>
                <h1 className="hero-title" style={{ fontSize: "2rem" }}>
                    Configure Your <span className="hero-gradient">Quiz</span>
                </h1>
                <p className="hero-subtitle">Customize your challenge below and hit Start!</p>
            </div>

            <div className="config-card">

                {/* 1. Category */}
                <div className="config-group">
                    <label className="config-label">
                        <span>1. Choose Category</span>
                        <span className="selected-tag">{selectedCategory}</span>
                    </label>
                    <div className="category-grid">
                        {categories.map((cat) => {
                            const icon = CATEGORY_ICONS[cat.category] || "📚";
                            const isSelected = selectedCategory === cat.category;
                            return (
                                <button
                                    key={cat.category}
                                    type="button"
                                    className={`category-chip ${isSelected ? "selected" : ""}`}
                                    onClick={() => { setSelectedCategory(cat.category); playSound("tick"); }}
                                >
                                    <span className="cat-icon">{icon}</span>
                                    <span className="cat-name">{cat.category}</span>
                                    <span className="cat-count">{cat.count} Qs</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 2. Difficulty — innovative card style */}
                <div className="config-group">
                    <label className="config-label">
                        <span>2. Difficulty Level</span>
                    </label>
                    <div className="difficulty-cards-row">
                        {Object.entries(DIFFICULTY_CONFIG).map(([key, cfg]) => (
                            <button
                                key={key}
                                type="button"
                                className={`difficulty-card ${difficulty === key ? "diff-selected" : ""}`}
                                style={{
                                    "--diff-color": cfg.color,
                                    "--diff-bg": cfg.bg,
                                }}
                                onClick={() => { setDifficulty(key); playSound("tick"); }}
                            >
                                <span className="diff-emoji">{cfg.emoji}</span>
                                <span className="diff-label">{cfg.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 3. Question Count — innovative segmented cards */}
                <div className="config-group">
                    <label className="config-label">
                        <span>3. Number of Questions</span>
                    </label>
                    <div className="qcount-cards-row">
                        {QUESTION_COUNTS.map(({ count, label, emoji, desc }) => (
                            <button
                                key={count}
                                type="button"
                                className={`qcount-card ${questionCount === count ? "qcount-selected" : ""}`}
                                onClick={() => { setQuestionCount(count); playSound("tick"); }}
                            >
                                <span className="qcount-emoji">{emoji}</span>
                                <span className="qcount-num">{count}</span>
                                <span className="qcount-label">{label}</span>
                                <span className="qcount-desc">{desc}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 4. Timer Mode */}
                <div className="config-group">
                    <label className="config-label"><span>4. Timer Mode</span></label>
                    <div className="timer-toggle-row">
                        <button
                            type="button"
                            className={`timer-mode-btn ${isTimed ? "timer-active" : ""}`}
                            onClick={() => { setIsTimed(true); playSound("tick"); }}
                        >
                            <span className="timer-icon">⏱️</span>
                            <span className="timer-label">15s Timer</span>
                            <span className="timer-sub">Speed challenge</span>
                        </button>
                        <button
                            type="button"
                            className={`timer-mode-btn ${!isTimed ? "timer-active" : ""}`}
                            onClick={() => { setIsTimed(false); playSound("tick"); }}
                        >
                            <span className="timer-icon">☕</span>
                            <span className="timer-label">Casual</span>
                            <span className="timer-sub">No time limit</span>
                        </button>
                    </div>
                </div>

                {/* Start Button */}
                <div className="start-action-container">
                    <button className="start-btn-huge" onClick={handleStartQuiz}>
                        <span>Start Quiz Now</span>
                        <span className="btn-arrow">→</span>
                    </button>
                </div>
            </div>
        </div>
    );
}