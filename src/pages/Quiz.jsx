import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Question from "../components/Questions";
import { fetchQuestions } from "../services/api";
import { playSound } from "../services/sound";

const QUESTION_TIME_LIMIT = 15;

export default function Quiz() {
    const location = useLocation();
    const navigate = useNavigate();

    const config = location.state || {
        category: "All",
        difficulty: "All",
        limit: 10,
        isTimed: true
    };

    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [showAnswer, setShowAnswer] = useState(false);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [maxStreak, setMaxStreak] = useState(0);
    const [lifelinesLeft, setLifelinesLeft] = useState(1);
    const [eliminatedOptions, setEliminatedOptions] = useState([]);
    const [answersHistory, setAnswersHistory] = useState([]);
    const [timeLeft, setTimeLeft] = useState(QUESTION_TIME_LIMIT);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const timerRef = useRef(null);
    const startTimeRef = useRef(Date.now());

    // Fetch questions instantly based on user config
    useEffect(() => {
        async function load() {
            try {
                const data = await fetchQuestions({
                    category: config.category,
                    difficulty: config.difficulty,
                    limit: config.limit
                });

                if (!data || data.length === 0) {
                    setError("No questions found for the selected filter. Try another category or difficulty.");
                } else {
                    setQuestions(data);
                }
            } catch (err) {
                console.error("Failed to load questions:", err);
                setError(err.message || "Failed to connect to backend server.");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [config.category, config.difficulty, config.limit]);

    // Handle answer submission
    const handleAnswerSubmit = useCallback((chosenOption, wasTimeout = false) => {
        if (showAnswer) return;

        clearInterval(timerRef.current);
        const current = questions[currentIndex];
        const isCorrect = !wasTimeout && chosenOption === current.correctAnswer;

        setShowAnswer(true);

        // Update score & streaks
        if (isCorrect) {
            setScore((prev) => prev + 1);
            setStreak((prev) => {
                const newStreak = prev + 1;
                if (newStreak > maxStreak) setMaxStreak(newStreak);
                if (newStreak >= 3) {
                    playSound("streak");
                } else {
                    playSound("correct");
                }
                return newStreak;
            });
        } else {
            setStreak(0);
            playSound("incorrect");
        }

        // Record history for result review
        setAnswersHistory((prev) => [
            ...prev,
            {
                id: current.id,
                question: current.question,
                options: current.options,
                selectedOption: chosenOption || (wasTimeout ? "Time Expired" : "None"),
                correctAnswer: current.correctAnswer,
                explanation: current.explanation,
                isCorrect,
                wasTimeout
            }
        ]);
    }, [showAnswer, questions, currentIndex, maxStreak]);

    // Question Timer Effect
    useEffect(() => {
        if (!config.isTimed || showAnswer || loading || !questions.length) return;

        setTimeLeft(QUESTION_TIME_LIMIT);

        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 4 && prev > 1) {
                    playSound("tick");
                }
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    handleAnswerSubmit(null, true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timerRef.current);
    }, [currentIndex, showAnswer, config.isTimed, loading, questions.length, handleAnswerSubmit]);

    const handleSelectOption = (option) => {
        if (showAnswer) return;
        setSelectedOption(option);
        playSound("tick");
    };

    const handleUseLifeline = () => {
        if (lifelinesLeft <= 0 || showAnswer) return;
        const current = questions[currentIndex];
        const wrongOptions = current.options.filter((opt) => opt !== current.correctAnswer);
        const shuffledWrong = [...wrongOptions].sort(() => 0.5 - Math.random());
        const toEliminate = shuffledWrong.slice(0, 2);

        setEliminatedOptions(toEliminate);
        setLifelinesLeft((prev) => prev - 1);
        playSound("lifeline");
    };

    const handleNextQuestion = () => {
        if (!showAnswer) {
            handleAnswerSubmit(selectedOption);
            return;
        }

        const isLast = currentIndex === questions.length - 1;
        if (isLast) {
            const finalScore = score;
            const total = questions.length;
            const percentage = Math.round((finalScore / total) * 100);
            const totalDurationSecs = Math.round((Date.now() - startTimeRef.current) / 1000);

            playSound("victory");

            // Save to localStorage personal best
            const currentBest = parseInt(localStorage.getItem("quiz_personal_best") || "0", 10);
            if (percentage > currentBest) {
                localStorage.setItem("quiz_personal_best", percentage.toString());
            }

            navigate("/result", {
                state: {
                    score: finalScore,
                    total,
                    percentage,
                    maxStreak,
                    category: config.category,
                    difficulty: config.difficulty,
                    totalDurationSecs,
                    history: answersHistory
                }
            });
        } else {
            setCurrentIndex((prev) => prev + 1);
            setSelectedOption(null);
            setShowAnswer(false);
            setEliminatedOptions([]);
        }
    };

    if (loading) {
        return null;
    }

    if (error || !questions.length) {
        return (
            <div className="quiz-card-wrapper">
                <div className="error-card">
                    <span className="error-icon">⚠️</span>
                    <h3>Unable to Load Questions</h3>
                    <p>{error || "No questions found for your selection."}</p>
                    <button className="primary-btn" onClick={() => navigate("/")}>
                        Back to Categories
                    </button>
                </div>
            </div>
        );
    }

    const current = questions[currentIndex];
    const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

    return (
        <div className="quiz-arena">
            {/* Top Stats Bar */}
            <div className="quiz-top-bar">
                <div className="progress-info">
                    <span className="q-index-label">
                        Question {currentIndex + 1} of {questions.length}
                    </span>
                    <div className="progress-bar-bg">
                        <div
                            className="progress-bar-fill"
                            style={{ width: `${progressPercent}%` }}
                        ></div>
                    </div>
                </div>

                <div className="quiz-quick-stats">
                    {streak >= 2 && (
                        <div className="streak-badge animate-pulse">
                            🔥 {streak}x Streak!
                        </div>
                    )}
                    <div className="score-badge">
                        Score: <strong>{score}</strong>
                    </div>
                </div>
            </div>

            {/* Timer Strip (if timed mode) */}
            {config.isTimed && (
                <div className={`timer-strip ${timeLeft <= 4 ? "urgent" : timeLeft <= 7 ? "warning" : ""}`}>
                    <div className="timer-icon">⏱️</div>
                    <div className="timer-text">
                        {showAnswer ? "Answer revealed" : `${timeLeft}s left`}
                    </div>
                    <div className="timer-bar-track">
                        <div
                            className="timer-bar-fill"
                            style={{ width: `${(timeLeft / QUESTION_TIME_LIMIT) * 100}%` }}
                        ></div>
                    </div>
                </div>
            )}

            {/* Question Card */}
            <Question
                question={current.question}
                options={current.options}
                selectedOption={selectedOption}
                correctAnswer={current.correctAnswer}
                category={current.category}
                difficulty={current.difficulty}
                explanation={current.explanation}
                showAnswer={showAnswer}
                eliminatedOptions={eliminatedOptions}
                onSelectOption={handleSelectOption}
                onUseLifeline={handleUseLifeline}
                lifelinesLeft={lifelinesLeft}
            />

            {/* Action Bar */}
            <div className="quiz-action-bar">
                <button
                    type="button"
                    className="submit-next-btn"
                    onClick={handleNextQuestion}
                    disabled={!showAnswer && selectedOption === null}
                >
                    {!showAnswer
                        ? "Submit Answer"
                        : currentIndex === questions.length - 1
                            ? "View Results 🎉"
                            : "Next Question →"}
                </button>
            </div>
        </div>
    );
}