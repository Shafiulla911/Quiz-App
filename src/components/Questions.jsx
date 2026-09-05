import Option from "./Option";

export default function Question({
    question = "",
    options = [],
    selectedOption = null,
    correctAnswer = "",
    category = "General Knowledge",
    difficulty = "Medium",
    explanation = "",
    showAnswer = false,
    eliminatedOptions = [],
    onSelectOption = () => {},
    onUseLifeline = null,
    lifelinesLeft = 0
}) {
    const getDifficultyColor = (diff) => {
        switch ((diff || "").toLowerCase()) {
            case "easy": return "diff-easy";
            case "hard": return "diff-hard";
            default: return "diff-medium";
        }
    };

    return (
        <div className="question-card">
            <div className="question-meta">
                <div className="meta-badges">
                    <span className="badge category-badge">
                        📁 {category}
                    </span>
                    <span className={`badge difficulty-badge ${getDifficultyColor(difficulty)}`}>
                        ★ {difficulty}
                    </span>
                </div>

                {!showAnswer && onUseLifeline && (
                    <button
                        type="button"
                        className={`lifeline-btn ${lifelinesLeft > 0 ? "active" : "used"}`}
                        onClick={onUseLifeline}
                        disabled={lifelinesLeft <= 0}
                        title="50:50 Lifeline: Eliminate 2 wrong options"
                    >
                        🪄 50:50 {lifelinesLeft > 0 ? `(${lifelinesLeft})` : "Used"}
                    </button>
                )}
            </div>

            <h2 className="question-text">{question}</h2>

            <div className="options-grid">
                {options.map((opt, index) => (
                    <Option
                        key={index}
                        index={index}
                        text={opt}
                        isSelected={selectedOption === opt}
                        isCorrect={opt === correctAnswer}
                        showAnswer={showAnswer}
                        isDisabled={eliminatedOptions.includes(opt)}
                        onSelect={() => onSelectOption(opt)}
                    />
                ))}
            </div>

            {showAnswer && explanation && (
                <div className="explanation-box">
                    <div className="explanation-header">
                        <span>💡 Explanation & Context</span>
                    </div>
                    <p className="explanation-text">{explanation}</p>
                </div>
            )}
        </div>
    );
}