export default function Option({
    index,
    text,
    isSelected,
    isCorrect,
    showAnswer,
    isDisabled,
    onSelect
}) {
    const letters = ["A", "B", "C", "D"];
    const letter = letters[index] || (index + 1);

    const getClassName = () => {
        const classes = ["option-btn"];
        if (isDisabled) classes.push("eliminated");
        if (!showAnswer) {
            if (isSelected) classes.push("selected");
        } else {
            if (isCorrect) classes.push("correct");
            else if (isSelected && !isCorrect) classes.push("incorrect");
            else classes.push("dimmed");
        }
        return classes.join(" ");
    };

    return (
        <button
            type="button"
            className={getClassName()}
            onClick={onSelect}
            disabled={showAnswer || isDisabled}
        >
            <span className="option-letter">{letter}</span>
            <span className="option-text">{text}</span>
            {showAnswer && isCorrect && <span className="option-status-icon">✓</span>}
            {showAnswer && isSelected && !isCorrect && <span className="option-status-icon">✕</span>}
        </button>
    );
}