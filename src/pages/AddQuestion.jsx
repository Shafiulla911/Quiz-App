import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { submitQuestion, fetchCategories, fetchQuestions, deleteQuestion } from "../services/api";
import { playSound } from "../services/sound";

export default function AddQuestion() {
    const navigate = useNavigate();

    // Mode tab: 'create' or 'manage'
    const [activeTab, setActiveTab] = useState("create");

    const [existingCategories, setExistingCategories] = useState([
        "Programming & Tech",
        "Science & Space",
        "World Geography",
        "History & Arts",
        "General Knowledge"
    ]);

    // Create Question state
    const [category, setCategory] = useState("Programming & Tech");
    const [customCategory, setCustomCategory] = useState("");
    const [difficulty, setDifficulty] = useState("Medium");
    const [question, setQuestion] = useState("");
    const [optionA, setOptionA] = useState("");
    const [optionB, setOptionB] = useState("");
    const [optionC, setOptionC] = useState("");
    const [optionD, setOptionD] = useState("");
    const [correctIndex, setCorrectIndex] = useState(0);
    const [explanation, setExplanation] = useState("");

    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    // Manage / Delete Questions state
    const [allQuestions, setAllQuestions] = useState([]);
    const [manageCategoryFilter, setManageCategoryFilter] = useState("All");
    const [manageSearch, setManageSearch] = useState("");
    const [manageLoading, setManageLoading] = useState(false);
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);
    const [deleteStatus, setDeleteStatus] = useState(null);

    const loadCategories = useCallback(async () => {
        try {
            const cats = await fetchCategories();
            if (cats && cats.length > 0) {
                setExistingCategories(cats.map((c) => c.category));
            }
        } catch (err) {
            console.warn("Could not load category list:", err);
        }
    }, []);

    const loadAllQuestions = useCallback(async () => {
        setManageLoading(true);
        try {
            const list = await fetchQuestions({ category: "All", difficulty: "All", limit: 100 });
            setAllQuestions(list);
        } catch (err) {
            console.error("Failed to load questions list:", err);
        } finally {
            setManageLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

    useEffect(() => {
        if (activeTab === "manage") {
            loadAllQuestions();
        }
    }, [activeTab, loadAllQuestions]);

    const options = [optionA, optionB, optionC, optionD];
    const finalCategory = category === "CUSTOM" ? (customCategory.trim() || "General Knowledge") : category;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage("");
        setSuccessMessage("");

        if (!question.trim()) {
            setErrorMessage("Please enter a question prompt.");
            return;
        }

        if (options.some((opt) => !opt.trim())) {
            setErrorMessage("All 4 option fields must be filled.");
            return;
        }

        const correctAnswer = options[correctIndex];

        setLoading(true);
        try {
            await submitQuestion({
                category: finalCategory,
                difficulty,
                question: question.trim(),
                options: options.map((o) => o.trim()),
                correctAnswer: correctAnswer.trim(),
                explanation: explanation.trim()
            });

            playSound("correct");
            setSuccessMessage("🎉 Question created successfully! It is now live in the quiz pool.");

            // Reset form
            setQuestion("");
            setOptionA("");
            setOptionB("");
            setOptionC("");
            setOptionD("");
            setExplanation("");
            loadCategories();
        } catch (err) {
            console.error("Failed to add question:", err);
            setErrorMessage(err.message || "Failed to submit question.");
            playSound("incorrect");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (questionId) => {
        try {
            await deleteQuestion(questionId);
            playSound("tick");
            setDeleteStatus("✅ Question deleted successfully.");
            setDeleteConfirmId(null);
            setAllQuestions((prev) => prev.filter((q) => q.id !== questionId));
            loadCategories();
            setTimeout(() => setDeleteStatus(null), 3000);
        } catch (err) {
            console.error("Failed to delete question:", err);
            setDeleteStatus(`⚠️ Failed to delete: ${err.message}`);
        }
    };

    const filteredQuestions = allQuestions.filter((q) => {
        const matchesCat = manageCategoryFilter === "All" || q.category === manageCategoryFilter;
        const matchesSearch = !manageSearch || q.question.toLowerCase().includes(manageSearch.toLowerCase());
        return matchesCat && matchesSearch;
    });

    return (
        <div className="add-question-container">
            {/* Header */}
            <div className="add-q-header">
                <div className="add-q-badge">🛠️ Question Studio</div>
                <h1 className="add-q-title">Quiz Content Manager</h1>
                <p className="add-q-subtitle">
                    Add new trivia challenges to the question bank or manage and delete existing questions.
                </p>
            </div>

            {/* Studio Navigation Tabs */}
            <div className="studio-tabs-row">
                <button
                    type="button"
                    className={`studio-tab ${activeTab === "create" ? "active" : ""}`}
                    onClick={() => {
                        setActiveTab("create");
                        playSound("tick");
                    }}
                >
                    ➕ Add New Question
                </button>
                <button
                    type="button"
                    className={`studio-tab ${activeTab === "manage" ? "active" : ""}`}
                    onClick={() => {
                        setActiveTab("manage");
                        playSound("tick");
                    }}
                >
                    📋 Manage & Delete Questions ({allQuestions.length || "Browse"})
                </button>
            </div>

            {/* =============================================================
               TAB 1: CREATE QUESTION
               ============================================================= */}
            {activeTab === "create" && (
                <div className="add-q-grid">
                    {/* Form Column */}
                    <form className="add-q-form-card" onSubmit={handleSubmit}>
                        {successMessage && (
                            <div className="alert success-alert">
                                <p>{successMessage}</p>
                                <button
                                    type="button"
                                    className="primary-btn"
                                    style={{ marginTop: "0.5rem", padding: "0.4rem 0.85rem", fontSize: "0.85rem" }}
                                    onClick={() => navigate("/")}
                                >
                                    Play Quiz with New Question →
                                </button>
                            </div>
                        )}

                        {errorMessage && (
                            <div className="alert error-alert">
                                <span>⚠️ {errorMessage}</span>
                            </div>
                        )}

                        {/* Category & Difficulty Row */}
                        <div className="form-row">
                            <div className="form-group flex-1">
                                <label>Category</label>
                                <select
                                    className="form-select"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                >
                                    {existingCategories.map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                    <option value="CUSTOM">+ New Category...</option>
                                </select>
                            </div>

                            <div className="form-group flex-1">
                                <label>Difficulty</label>
                                <select
                                    className="form-select"
                                    value={difficulty}
                                    onChange={(e) => setDifficulty(e.target.value)}
                                >
                                    <option value="Easy">Easy</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Hard">Hard</option>
                                </select>
                            </div>
                        </div>

                        {category === "CUSTOM" && (
                            <div className="form-group">
                                <label>New Category Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g. Movies & Cinema, Literature..."
                                    value={customCategory}
                                    onChange={(e) => setCustomCategory(e.target.value)}
                                    required
                                />
                            </div>
                        )}

                        {/* Question Prompt */}
                        <div className="form-group">
                            <label>Question Prompt</label>
                            <textarea
                                className="form-textarea"
                                rows={3}
                                placeholder="What is the question you want to ask?"
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                required
                            />
                        </div>

                        {/* Options */}
                        <div className="form-group">
                            <label className="options-label">
                                <span>Answer Choices</span>
                                <span className="sub-hint">(Click radio button to mark correct answer)</span>
                            </label>

                            <div className="options-input-list">
                                {[
                                    { label: "A", val: optionA, setVal: setOptionA },
                                    { label: "B", val: optionB, setVal: setOptionB },
                                    { label: "C", val: optionC, setVal: setOptionC },
                                    { label: "D", val: optionD, setVal: setOptionD },
                                ].map((opt, idx) => (
                                    <div key={opt.label} className={`option-input-row ${correctIndex === idx ? "is-correct-choice" : ""}`}>
                                        <label className="radio-label" title="Mark as correct answer">
                                            <input
                                                type="radio"
                                                name="correctOption"
                                                checked={correctIndex === idx}
                                                onChange={() => setCorrectIndex(idx)}
                                            />
                                            <span className="opt-letter-tag">{opt.label}</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="form-input option-text-field"
                                            placeholder={`Option ${opt.label} text...`}
                                            value={opt.val}
                                            onChange={(e) => opt.setVal(e.target.value)}
                                            required
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Explanation */}
                        <div className="form-group">
                            <label>
                                <span>Explanation / Fun Fact</span>
                                <span className="sub-hint">(Shown to players after answering)</span>
                            </label>
                            <textarea
                                className="form-textarea"
                                rows={2}
                                placeholder="Why is this answer correct? Provide context..."
                                value={explanation}
                                onChange={(e) => setExplanation(e.target.value)}
                            />
                        </div>

                        <div className="form-actions">
                            <button
                                type="submit"
                                className="primary-btn submit-btn"
                                disabled={loading}
                            >
                                {loading ? "Adding Question..." : "🚀 Publish Question"}
                            </button>
                        </div>
                    </form>

                    {/* Live Preview Column */}
                    <div className="preview-card-column">
                        <div className="preview-header">
                            <span>👁️ Live In-Game Preview</span>
                        </div>

                        <div className="preview-box">
                            <div className="question-card">
                                <div className="question-meta">
                                    <div className="meta-badges">
                                        <span className="badge category-badge">
                                            📁 {finalCategory}
                                        </span>
                                        <span className="badge difficulty-badge diff-medium">
                                            ★ {difficulty}
                                        </span>
                                    </div>
                                </div>

                                <h2 className="question-text">
                                    {question.trim() || "Your question preview will appear here..."}
                                </h2>

                                <div className="options-grid">
                                    {options.map((opt, i) => (
                                        <div
                                            key={i}
                                            className={`option-btn ${correctIndex === i ? "selected" : ""}`}
                                        >
                                            <span className="option-letter">{["A", "B", "C", "D"][i]}</span>
                                            <span className="option-text">{opt || `Choice ${["A", "B", "C", "D"][i]}`}</span>
                                            {correctIndex === i && <span className="correct-tag-badge">✓ Target</span>}
                                        </div>
                                    ))}
                                </div>

                                {explanation && (
                                    <div className="explanation-box">
                                        <div className="explanation-header">
                                            <span>💡 Explanation Preview</span>
                                        </div>
                                        <p className="explanation-text">{explanation}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* =============================================================
               TAB 2: MANAGE & DELETE QUESTIONS
               ============================================================= */}
            {activeTab === "manage" && (
                <div className="manage-questions-section">
                    {deleteStatus && (
                        <div className="alert success-alert">
                            <span>{deleteStatus}</span>
                        </div>
                    )}

                    {/* Filters & Search Bar */}
                    <div className="manage-controls-card">
                        <div className="search-box">
                            <span className="search-icon">🔍</span>
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search questions by keyword..."
                                value={manageSearch}
                                onChange={(e) => setManageSearch(e.target.value)}
                            />
                        </div>

                        <div className="category-select-wrapper">
                            <select
                                className="form-select"
                                value={manageCategoryFilter}
                                onChange={(e) => setManageCategoryFilter(e.target.value)}
                            >
                                <option value="All">All Categories ({allQuestions.length})</option>
                                {existingCategories.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Questions List */}
                    {manageLoading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Loading question bank...</p>
                        </div>
                    ) : filteredQuestions.length === 0 ? (
                        <div className="empty-state-card">
                            <span className="empty-icon">📂</span>
                            <h3>No Questions Found</h3>
                            <p>Try clearing your search or filter criteria.</p>
                        </div>
                    ) : (
                        <div className="questions-manage-list">
                            {filteredQuestions.map((q, idx) => (
                                <div key={q.id || idx} className="question-manage-card">
                                    <div className="manage-card-top">
                                        <div className="meta-badges">
                                            <span className="badge category-badge">📁 {q.category}</span>
                                            <span className="badge difficulty-badge diff-medium">★ {q.difficulty}</span>
                                            <span className="badge q-id-badge">ID: #{q.id}</span>
                                        </div>

                                        <div className="manage-card-actions">
                                            {deleteConfirmId === q.id ? (
                                                <div className="delete-confirm-box">
                                                    <span className="confirm-prompt">Confirm Delete?</span>
                                                    <button
                                                        type="button"
                                                        className="confirm-yes-btn"
                                                        onClick={() => handleDelete(q.id)}
                                                    >
                                                        Yes, Delete
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="confirm-no-btn"
                                                        onClick={() => setDeleteConfirmId(null)}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="delete-btn"
                                                    onClick={() => setDeleteConfirmId(q.id)}
                                                    title="Delete this question"
                                                >
                                                    🗑️ Delete Question
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <h3 className="manage-q-text">{q.question}</h3>

                                    <div className="manage-options-grid">
                                        {q.options && q.options.map((opt, i) => (
                                            <div
                                                key={i}
                                                className={`manage-opt-pill ${opt === q.correctAnswer ? "is-correct" : ""}`}
                                            >
                                                <span className="opt-letter">{["A", "B", "C", "D"][i]}:</span>
                                                <span className="opt-val">{opt}</span>
                                                {opt === q.correctAnswer && <span className="correct-check">✓ Correct</span>}
                                            </div>
                                        ))}
                                    </div>

                                    {q.explanation && (
                                        <div className="manage-explanation">
                                            💡 <strong>Explanation:</strong> {q.explanation}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
