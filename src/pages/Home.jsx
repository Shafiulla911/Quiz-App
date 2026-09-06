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

export default function Home() {
    const navigate = useNavigate();

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
            state: {
                category: selectedCategory,
                difficulty,
                limit: questionCount,
                isTimed
            }
        });
    };

    return (
        <div className="home-container">
            {/* Hero Section */}
            <div className="hero-section">
                <div className="hero-badge">⚡ Interactive Knowledge Challenge</div>
                <h1 className="hero-title">
                    Spark Your Mind with <span className="hero-gradient">QuizSpark</span>
                </h1>
                <p className="hero-subtitle">
                    Challenge yourself with trivia across tech, science, history, geography, and more. Choose your game mode below!
                </p>
            </div>

            {/* Config Card */}
            <div className="config-card">
                {/* 1. Category Selection */}
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
                                    onClick={() => {
                                        setSelectedCategory(cat.category);
                                        playSound("tick");
                                    }}
                                >
                                    <span className="cat-icon">{icon}</span>
                                    <span className="cat-name">{cat.category}</span>
                                    <span className="cat-count">{cat.count} Qs</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 2. Difficulty Selection */}
                <div className="config-group">
                    <label className="config-label">
                        <span>2. Difficulty Level</span>
                    </label>
                    <div className="button-group">
                        {["All", "Easy", "Medium", "Hard"].map((d) => (
                            <button
                                key={d}
                                type="button"
                                className={`pill-btn ${difficulty === d ? "active" : ""}`}
                                onClick={() => {
                                    setDifficulty(d);
                                    playSound("tick");
                                }}
                            >
                                {d === "Easy" ? "🟢 Easy" : d === "Medium" ? "🟡 Medium" : d === "Hard" ? "🔴 Hard" : "🌈 All Levels"}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 3. Game Mode & Question Count */}
                <div className="config-row">
                    <div className="config-group flex-1">
                        <label className="config-label">3. Questions</label>
                        <div className="button-group">
                            {[5, 10, 15].map((cnt) => (
                                <button
                                    key={cnt}
                                    type="button"
                                    className={`pill-btn ${questionCount === cnt ? "active" : ""}`}
                                    onClick={() => {
                                        setQuestionCount(cnt);
                                        playSound("tick");
                                    }}
                                >
                                    {cnt} Questions
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="config-group flex-1">
                        <label className="config-label">4. Timer Mode</label>
                        <div className="button-group">
                            <button
                                type="button"
                                className={`pill-btn ${isTimed ? "active" : ""}`}
                                onClick={() => {
                                    setIsTimed(true);
                                    playSound("tick");
                                }}
                            >
                                ⏱️ 15s Timer
                            </button>
                            <button
                                type="button"
                                className={`pill-btn ${!isTimed ? "active" : ""}`}
                                onClick={() => {
                                    setIsTimed(false);
                                    playSound("tick");
                                }}
                            >
                                ☕ Casual
                            </button>
                        </div>
                    </div>
                </div>

                {/* Start Action */}
                <div className="start-action-container">
                    <button className="start-btn-huge" onClick={handleStartQuiz}>
                        <span>Start Quiz Now</span>
                        <span className="btn-arrow">→</span>
                    </button>
                </div>
            </div>

            {/* Word Puzzle Feature Card */}
            <div className="word-puzzle-feature-card">
                <div className="puzzle-card-left">
                    <span className="puzzle-card-badge">🔤 NEW GAME MODE</span>
                    <h3 className="puzzle-card-title">Word Unscramble Puzzles</h3>
                    <p className="puzzle-card-desc">
                        Test your vocabulary & anagram skills! Unscramble tech, science, and history terms with clue hints and instant letter placement.
                    </p>
                </div>
                <button
                    className="start-puzzle-btn"
                    onClick={() => {
                        playSound("streak");
                        navigate("/word-puzzle");
                    }}
                >
                    Play Word Puzzles 🔤 →
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