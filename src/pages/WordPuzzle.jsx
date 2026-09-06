import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWordPuzzles, submitScore } from "../services/api";
import { playSound } from "../services/sound";
import { useAuth } from "../context/AuthContext";

export default function WordPuzzle() {
    const navigate = useNavigate();
    const { user } = useAuth();

    // Game setup state
    const [gameState, setGameState] = useState("config"); // 'config', 'playing', 'finished'
    const [category, setCategory] = useState("All");
    const [difficulty, setDifficulty] = useState("All");
    const [puzzleCount, setPuzzleCount] = useState(5);

    // Puzzles & Gameplay state
    const [puzzles, setPuzzles] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Current Word Puzzle State
    const [inputMode, setInputMode] = useState("tiles"); // 'tiles' | 'typing'
    const [scrambledTiles, setScrambledTiles] = useState([]); // [{ id, char, used }]
    const [placedSlots, setPlacedSlots] = useState([]); // [{ tileId, char }]
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [hintsLeft, setHintsLeft] = useState(3);
    const [feedback, setFeedback] = useState(null); // { type: 'correct'|'wrong', msg }
    const [submittingScore, setSubmittingScore] = useState(false);
    const [scoreSubmitted, setScoreSubmitted] = useState(false);

    // Load Puzzles
    const startWordGame = async () => {
        setLoading(true);
        setError(null);
        setFeedback(null);
        try {
            const list = await fetchWordPuzzles({ category, difficulty, limit: puzzleCount });
            if (!list || list.length === 0) {
                throw new Error("No word puzzles available for the selected category. Try selecting 'All'.");
            }
            setPuzzles(list);
            setCurrentIndex(0);
            setScore(0);
            setStreak(0);
            setHintsLeft(3);
            setGameState("playing");
            playSound("streak");
        } catch (err) {
            console.error("Failed to start word game:", err);
            setError(err.message || "Failed to load word puzzles.");
        } finally {
            setLoading(false);
        }
    };

    // Setup current puzzle letters
    const currentPuzzle = puzzles[currentIndex];

    const initPuzzleTiles = useCallback((puzzle) => {
        if (!puzzle) return;
        const tiles = puzzle.scrambled.map((ch, i) => ({
            id: `${ch}-${i}-${Math.random()}`,
            char: ch,
            used: false
        }));
        setScrambledTiles(tiles);
        setPlacedSlots(Array(puzzle.word.length).fill(null));
        setFeedback(null);
    }, []);

    useEffect(() => {
        if (gameState === "playing" && currentPuzzle) {
            initPuzzleTiles(currentPuzzle);
        }
    }, [gameState, currentIndex, currentPuzzle, initPuzzleTiles]);

    // Handle clicking a scrambled tile
    const handleTileClick = (tile) => {
        if (tile.used || feedback) return;
        playSound("tick");

        // Find first empty slot
        const emptyIdx = placedSlots.findIndex((slot) => slot === null);
        if (emptyIdx === -1) return;

        // Place tile in slot
        const newSlots = [...placedSlots];
        newSlots[emptyIdx] = { tileId: tile.id, char: tile.char };
        setPlacedSlots(newSlots);

        // Mark tile as used
        setScrambledTiles((prev) =>
            prev.map((t) => (t.id === tile.id ? { ...t, used: true } : t))
        );
    };

    // Handle clicking a placed slot to remove it
    const handleSlotClick = (slot, index) => {
        if (!slot || feedback) return;
        playSound("tick");

        // Remove from slot
        const newSlots = [...placedSlots];
        newSlots[index] = null;
        setPlacedSlots(newSlots);

        // Un-use tile
        setScrambledTiles((prev) =>
            prev.map((t) => (t.id === slot.tileId ? { ...t, used: false } : t))
        );
    };

    // Clear all placed slots
    const handleClearSlots = () => {
        if (feedback) return;
        playSound("tick");
        setPlacedSlots(Array(currentPuzzle.word.length).fill(null));
        setScrambledTiles((prev) => prev.map((t) => ({ ...t, used: false })));
    };

    // Shuffle remaining scrambled tiles
    const handleShuffleTiles = () => {
        if (feedback) return;
        playSound("tick");
        setScrambledTiles((prev) => {
            const shuffled = [...prev];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            return shuffled;
        });
    };

    // Use Hint (Reveals next correct letter)
    const handleUseHint = () => {
        if (hintsLeft <= 0 || feedback) return;

        const targetWord = currentPuzzle.word;
        // Find first slot where character doesn't match target
        let targetIdx = -1;
        for (let i = 0; i < targetWord.length; i++) {
            if (!placedSlots[i] || placedSlots[i].char !== targetWord[i]) {
                targetIdx = i;
                break;
            }
        }

        if (targetIdx === -1) return;

        const targetChar = targetWord[targetIdx];
        // Find unused tile with targetChar
        const unusedTile = scrambledTiles.find((t) => !t.used && t.char === targetChar);
        if (!unusedTile) return;

        playSound("streak");
        setHintsLeft((prev) => prev - 1);

        // If a slot was occupied by wrong letter, remove it first
        if (placedSlots[targetIdx]) {
            const oldSlot = placedSlots[targetIdx];
            setScrambledTiles((prev) =>
                prev.map((t) => (t.id === oldSlot.tileId ? { ...t, used: false } : t))
            );
        }

        // Place correct tile
        const newSlots = [...placedSlots];
        newSlots[targetIdx] = { tileId: unusedTile.id, char: unusedTile.char };
        setPlacedSlots(newSlots);

        setScrambledTiles((prev) =>
            prev.map((t) => (t.id === unusedTile.id ? { ...t, used: true } : t))
        );
    };

    // Check Answer
    const handleSubmitWord = () => {
        if (feedback) return;

        const spelledWord = placedSlots.map((s) => (s ? s.char : "")).join("");
        const targetWord = currentPuzzle.word;

        if (spelledWord.length < targetWord.length) {
            setFeedback({ type: "wrong", msg: "⚠️ Please fill all letter slots before submitting!" });
            setTimeout(() => setFeedback(null), 1500);
            return;
        }

        if (spelledWord === targetWord) {
            playSound("correct");
            setScore((prev) => prev + 1);
            setStreak((prev) => prev + 1);
            setFeedback({ type: "correct", msg: `🎉 Correct! Word: "${targetWord}"` });

            setTimeout(() => {
                if (currentIndex + 1 < puzzles.length) {
                    setCurrentIndex((prev) => prev + 1);
                } else {
                    setGameState("finished");
                }
            }, 1400);
        } else {
            playSound("incorrect");
            setStreak(0);
            setFeedback({ type: "wrong", msg: `❌ Incorrect! Keep trying or clear slots.` });
            setTimeout(() => setFeedback(null), 1600);
        }
    };

    // Handle Direct Type Input box change
    const handleDirectInputChange = (newString) => {
        if (feedback || !currentPuzzle) return;
        const cleanStr = newString.toUpperCase().replace(/[^A-Z]/g, "").slice(0, currentPuzzle.word.length);

        let pool = scrambledTiles.map((t) => ({ ...t, used: false }));
        const newSlots = Array(currentPuzzle.word.length).fill(null);

        for (let i = 0; i < cleanStr.length; i++) {
            const char = cleanStr[i];
            const availableIdx = pool.findIndex((t) => !t.used && t.char === char);
            if (availableIdx !== -1) {
                pool[availableIdx].used = true;
                newSlots[i] = { tileId: pool[availableIdx].id, char };
            }
        }

        setScrambledTiles(pool);
        setPlacedSlots(newSlots);
    };

    // Physical Keyboard keydown listener for seamless typing anywhere
    useEffect(() => {
        if (gameState !== "playing" || !currentPuzzle || feedback) return;

        const handleKeyDown = (e) => {
            const activeEl = document.activeElement;
            const isInsideDirectInput = activeEl?.classList?.contains("puzzle-direct-type-input");

            if (activeEl && ["INPUT", "TEXTAREA"].includes(activeEl.tagName) && !isInsideDirectInput) {
                return;
            }

            if (e.key === "Backspace") {
                if (isInsideDirectInput) return; // Managed by input onChange
                e.preventDefault();
                for (let i = placedSlots.length - 1; i >= 0; i--) {
                    if (placedSlots[i] !== null) {
                        const slot = placedSlots[i];
                        const newSlots = [...placedSlots];
                        newSlots[i] = null;
                        setPlacedSlots(newSlots);
                        setScrambledTiles((prev) =>
                            prev.map((t) => (t.id === slot.tileId ? { ...t, used: false } : t))
                        );
                        playSound("tick");
                        break;
                    }
                }
            } else if (e.key === "Enter") {
                const isFull = placedSlots.every((s) => s !== null);
                if (isFull) {
                    e.preventDefault();
                    handleSubmitWord();
                }
            } else if (/^[a-zA-Z]$/.test(e.key)) {
                if (isInsideDirectInput) return; // Managed by input onChange
                const upperChar = e.key.toUpperCase();
                const availableTile = scrambledTiles.find((t) => !t.used && t.char === upperChar);
                if (availableTile) {
                    const emptyIdx = placedSlots.findIndex((s) => s === null);
                    if (emptyIdx !== -1) {
                        e.preventDefault();
                        playSound("tick");
                        const newSlots = [...placedSlots];
                        newSlots[emptyIdx] = { tileId: availableTile.id, char: availableTile.char };
                        setPlacedSlots(newSlots);
                        setScrambledTiles((prev) =>
                            prev.map((t) => (t.id === availableTile.id ? { ...t, used: true } : t))
                        );
                    }
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameState, currentPuzzle, feedback, placedSlots, scrambledTiles]);

    // Submit final score to Leaderboard
    const handleLeaderboardSubmit = async () => {
        setSubmittingScore(true);
        try {
            await submitScore({
                playerName: user?.username || "Anonymous Player",
                score,
                totalQuestions: puzzles.length,
                percentage: Math.round((score / puzzles.length) * 100),
                category: `Word Puzzle - ${category}`,
                userId: user ? user.id : null
            });
            setScoreSubmitted(true);
            playSound("correct");
        } catch (err) {
            console.error("Leaderboard submit error:", err);
        } finally {
            setSubmittingScore(false);
        }
    };

    // =========================================================================
    // CONFIG SCREEN
    // =========================================================================
    if (gameState === "config") {
        return (
            <div className="home-container">
                <div className="hero-section">
                    <div className="hero-badge">🔤 Word Anagram & Puzzle Challenge</div>
                    <h1 className="hero-title">
                        Unscramble Words with <span className="hero-gradient">WordSpark</span>
                    </h1>
                    <p className="hero-subtitle">
                        Test your vocabulary! Rearrange scrambled letter tiles to match the clues and solve puzzles.
                    </p>
                </div>

                <div className="config-card">
                    {error && (
                        <div className="alert error-alert">
                            <span>⚠️ {error}</span>
                        </div>
                    )}

                    {/* Category */}
                    <div className="config-group">
                        <label className="config-label">1. Choose Category</label>
                        <div className="button-group">
                            {["All", "Programming & Tech", "Science & Space", "History & Arts", "World Geography"].map((cat) => (
                                <button
                                    key={cat}
                                    type="button"
                                    className={`pill-btn ${category === cat ? "active" : ""}`}
                                    onClick={() => setCategory(cat)}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Difficulty */}
                    <div className="config-group">
                        <label className="config-label">2. Difficulty</label>
                        <div className="button-group">
                            {["All", "Easy", "Medium", "Hard"].map((d) => (
                                <button
                                    key={d}
                                    type="button"
                                    className={`pill-btn ${difficulty === d ? "active" : ""}`}
                                    onClick={() => setDifficulty(d)}
                                >
                                    {d}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Count */}
                    <div className="config-group">
                        <label className="config-label">3. Number of Puzzles</label>
                        <div className="button-group">
                            {[3, 5, 8].map((cnt) => (
                                <button
                                    key={cnt}
                                    type="button"
                                    className={`pill-btn ${puzzleCount === cnt ? "active" : ""}`}
                                    onClick={() => setPuzzleCount(cnt)}
                                >
                                    {cnt} Puzzles
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="start-action-container">
                        <button
                            className="start-btn-huge"
                            disabled={loading}
                            onClick={startWordGame}
                        >
                            <span>{loading ? "Loading Word Puzzles..." : "Start Word Puzzle Game 🔤"}</span>
                            <span className="btn-arrow">→</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // =========================================================================
    // GAMEPLAY SCREEN
    // =========================================================================
    if (gameState === "playing" && currentPuzzle) {
        const isComplete = placedSlots.every((s) => s !== null);

        return (
            <div className="word-puzzle-container">
                {/* Header */}
                <div className="word-header-card">
                    <div className="word-meta">
                        <span className="badge category-badge">📁 {currentPuzzle.category}</span>
                        <span className="badge difficulty-badge diff-medium">★ {currentPuzzle.difficulty}</span>
                        <span className="badge" style={{ background: "rgba(99, 102, 241, 0.15)", color: "var(--primary)" }}>
                            Puzzle {currentIndex + 1} of {puzzles.length}
                        </span>
                    </div>

                    <div className="word-scores">
                        <div className="score-pill">
                            🏆 Score: <strong>{score}</strong>
                        </div>
                        <div className="score-pill">
                            🔥 Streak: <strong>{streak}x</strong>
                        </div>
                        <div className="score-pill">
                            💡 Hints Left: <strong>{hintsLeft}</strong>
                        </div>
                    </div>
                </div>

                {/* Clue Box */}
                <div className="clue-box-card">
                    <div className="clue-label">💡 CLUE / DEFINITION</div>
                    <h2 className="clue-text">{currentPuzzle.clue}</h2>
                </div>

                {/* Mode Switcher: Tile Tap vs Direct Keyboard Typing */}
                <div className="input-mode-switcher-container">
                    <div className="mode-switcher-track">
                        <button
                            type="button"
                            className={`mode-tab-btn ${inputMode === "tiles" ? "active" : ""}`}
                            onClick={() => {
                                setInputMode("tiles");
                                playSound("tick");
                            }}
                        >
                            <span className="tab-icon">🧩</span>
                            <span>Tile Tap Mode</span>
                        </button>
                        <button
                            type="button"
                            className={`mode-tab-btn ${inputMode === "typing" ? "active" : ""}`}
                            onClick={() => {
                                setInputMode("typing");
                                playSound("tick");
                            }}
                        >
                            <span className="tab-icon">⌨️</span>
                            <span>Keyboard Typing Mode</span>
                        </button>
                    </div>
                </div>

                {/* Direct Typing Input Field */}
                {inputMode === "typing" && (
                    <div className="animated-type-input-card">
                        <div className="type-input-field-wrapper">
                            <span className="keyboard-prefix-icon">⌨️</span>
                            <input
                                type="text"
                                className="puzzle-direct-type-input"
                                placeholder="Type answer using your keyboard..."
                                value={placedSlots.map((s) => (s ? s.char : "")).join("")}
                                onChange={(e) => handleDirectInputChange(e.target.value)}
                                maxLength={currentPuzzle.word.length}
                                autoFocus
                            />
                            <span className="typing-count-badge">
                                {placedSlots.filter(Boolean).length} / {currentPuzzle.word.length}
                            </span>
                        </div>
                        <div className="typing-helper-hint">
                            <span>✨ Type on your keyboard or tap scrambled letters below! Press <strong>Backspace</strong> to erase.</span>
                        </div>
                    </div>
                )}

                {/* Feedback Banner */}
                {feedback && (
                    <div className={`alert ${feedback.type === "correct" ? "success-alert" : "error-alert"}`}>
                        <span>{feedback.msg}</span>
                    </div>
                )}

                {/* Placed Answer Slots */}
                <div className="placed-slots-bar">
                    {placedSlots.map((slot, idx) => (
                        <button
                            key={idx}
                            type="button"
                            className={`answer-slot ${slot ? "filled" : "empty"}`}
                            onClick={() => handleSlotClick(slot, idx)}
                            title={slot ? "Click to remove letter" : "Empty letter slot"}
                        >
                            {slot ? slot.char : ""}
                        </button>
                    ))}
                </div>

                {/* Scrambled Letter Tiles */}
                <div className="scrambled-tiles-grid">
                    {scrambledTiles.map((tile) => (
                        <button
                            key={tile.id}
                            type="button"
                            className={`scrambled-tile ${tile.used ? "used" : ""}`}
                            disabled={tile.used}
                            onClick={() => handleTileClick(tile)}
                        >
                            {tile.char}
                        </button>
                    ))}
                </div>

                {/* Action Buttons */}
                <div className="word-actions-row">
                    <button
                        type="button"
                        className="word-action-btn secondary"
                        onClick={handleShuffleTiles}
                    >
                        🔀 Shuffle
                    </button>

                    <button
                        type="button"
                        className="word-action-btn hint"
                        disabled={hintsLeft <= 0}
                        onClick={handleUseHint}
                    >
                        💡 Use Hint ({hintsLeft})
                    </button>

                    <button
                        type="button"
                        className="word-action-btn danger"
                        onClick={handleClearSlots}
                    >
                        ❌ Clear All
                    </button>

                    <button
                        type="button"
                        className={`puzzle-submit-btn ${isComplete && !feedback ? "ready-to-submit" : ""}`}
                        disabled={!isComplete || feedback !== null}
                        onClick={handleSubmitWord}
                    >
                        <span className="btn-sparkle-icon">🚀</span>
                        <span>Submit Word</span>
                    </button>
                </div>
            </div>
        );
    }

    // =========================================================================
    // RESULTS SCREEN
    // =========================================================================
    const finalPct = Math.round((score / puzzles.length) * 100);

    return (
        <div className="result-container">
            <div className="result-header">
                <div className="celebration-icon">{finalPct >= 80 ? "🏆" : "🔤"}</div>
                <h1 className="celebration-title">
                    {finalPct >= 80 ? "Master Word Smith!" : "Word Challenge Complete!"}
                </h1>
                <p className="celebration-subtitle">
                    You solved {score} out of {puzzles.length} word puzzles.
                </p>
            </div>

            <div className="score-summary-card">
                <div className="score-ring-wrapper">
                    <div className="circular-score">
                        <span className="score-percentage-num">{finalPct}%</span>
                        <span className="score-fraction">{score} of {puzzles.length} Solved</span>
                    </div>
                </div>
            </div>

            <div className="leaderboard-submit-box">
                {!scoreSubmitted ? (
                    <button
                        type="button"
                        className="puzzle-submit-btn ready-to-submit"
                        disabled={submittingScore}
                        onClick={handleLeaderboardSubmit}
                    >
                        <span className="btn-sparkle-icon">🚀</span>
                        <span>{submittingScore ? "Posting..." : "Post Score to Leaderboard"}</span>
                    </button>
                ) : (
                    <div className="submit-success-banner">
                        <span>🎉 Score recorded on the Hall of Fame Leaderboard!</span>
                    </div>
                )}
            </div>

            <div className="result-actions-row">
                <button
                    type="button"
                    className="action-btn primary"
                    onClick={startWordGame}
                >
                    🔄 Play Again
                </button>
                <button
                    type="button"
                    className="action-btn secondary"
                    onClick={() => setGameState("config")}
                >
                    ⚙️ Change Setup
                </button>
                <button
                    type="button"
                    className="action-btn secondary"
                    onClick={() => navigate("/")}
                >
                    🏠 Home
                </button>
            </div>
        </div>
    );
}
