import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    fetchAdminAnalytics,
    fetchAdminUsers,
    updateUserRole,
    deleteAdminUser,
    fetchCategories,
    fetchQuestions,
    submitQuestion,
    deleteQuestion,
    fetchLeaderboard,
    deleteLeaderboardEntry,
    generateAiQuestions,
    fetchWordPuzzles,
    submitWordPuzzle,
    deleteWordPuzzle,
    generateAiWordPuzzles
} from "../services/api";
import { playSound } from "../services/sound";
import { useAuth } from "../context/AuthContext";

export default function AdminDashboard() {
    const navigate = useNavigate();
    const { user, isAdmin } = useAuth();

    // Active Admin Tab: 'analytics', 'questions', 'users', 'leaderboard'
    const [activeTab, setActiveTab] = useState("analytics");

    // =========================================================================
    // TAB 1: ANALYTICS STATE
    // =========================================================================
    const [analytics, setAnalytics] = useState(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(true);

    const loadAnalytics = useCallback(async () => {
        setAnalyticsLoading(true);
        try {
            const data = await fetchAdminAnalytics();
            setAnalytics(data);
        } catch (err) {
            console.error("Failed to load admin analytics:", err);
        } finally {
            setAnalyticsLoading(false);
        }
    }, []);

    // =========================================================================
    // TAB 2: QUESTIONS MANAGEMENT STATE
    // =========================================================================
    const [qSubTab, setQSubTab] = useState("manage"); // 'manage' or 'add'
    const [existingCategories, setExistingCategories] = useState([
        "Programming & Tech",
        "Science & Space",
        "World Geography",
        "History & Arts",
        "General Knowledge"
    ]);
    const [allQuestions, setAllQuestions] = useState([]);
    const [qCategoryFilter, setQCategoryFilter] = useState("All");
    const [qSearch, setQSearch] = useState("");
    const [qLoading, setQLoading] = useState(false);
    const [deleteConfirmQId, setDeleteConfirmQId] = useState(null);
    const [qNotice, setQNotice] = useState(null);

    // New Question form state
    const [newCat, setNewCat] = useState("Programming & Tech");
    const [customCat, setCustomCat] = useState("");
    const [newDiff, setNewDiff] = useState("Medium");
    const [newQuestionText, setNewQuestionText] = useState("");
    const [optA, setOptA] = useState("");
    const [optB, setOptB] = useState("");
    const [optC, setOptC] = useState("");
    const [optD, setOptD] = useState("");
    const [correctIdx, setCorrectIdx] = useState(0);
    const [newExplanation, setNewExplanation] = useState("");
    const [submittingQ, setSubmittingQ] = useState(false);

    // AI Question Generator state
    const [aiTopic, setAiTopic] = useState("General Knowledge");
    const [aiDifficulty, setAiDifficulty] = useState("Medium");
    const [aiCount, setAiCount] = useState(3);
    const [aiGenerating, setAiGenerating] = useState(false);
    const [aiGeneratedList, setAiGeneratedList] = useState([]);
    const [aiPublishing, setAiPublishing] = useState(false);

    const handleGenerateAi = async (e) => {
        e.preventDefault();
        setQNotice(null);
        if (!aiTopic.trim()) {
            setQNotice({ type: "error", msg: "Please enter a topic for AI question generation." });
            return;
        }
        setAiGenerating(true);
        try {
            const list = await generateAiQuestions({
                topic: aiTopic.trim(),
                difficulty: aiDifficulty,
                count: aiCount
            });
            playSound("streak");
            setAiGeneratedList(list);
            setQNotice({ type: "success", msg: `✨ Successfully generated ${list.length} AI trivia questions! Review them below.` });
        } catch (err) {
            playSound("incorrect");
            setQNotice({ type: "error", msg: err.message || "Failed to generate AI questions." });
        } finally {
            setAiGenerating(false);
        }
    };

    const handlePublishAllAi = async () => {
        if (aiGeneratedList.length === 0) return;
        setAiPublishing(true);
        setQNotice(null);
        try {
            for (const qObj of aiGeneratedList) {
                await submitQuestion(qObj);
            }
            playSound("correct");
            setQNotice({ type: "success", msg: `🎉 All ${aiGeneratedList.length} AI questions published to database!` });
            setAiGeneratedList([]);
            loadCategories();
            loadQuestions();
        } catch (err) {
            setQNotice({ type: "error", msg: `Failed to publish AI questions: ${err.message}` });
        } finally {
            setAiPublishing(false);
        }
    };

    const loadCategories = useCallback(async () => {
        try {
            const cats = await fetchCategories();
            if (cats && cats.length > 0) {
                setExistingCategories(cats.map((c) => c.category));
            }
        } catch (err) {
            console.warn("Could not load categories:", err);
        }
    }, []);

    const loadQuestions = useCallback(async () => {
        setQLoading(true);
        try {
            const list = await fetchQuestions({ category: "All", difficulty: "All", limit: 200 });
            setAllQuestions(list);
        } catch (err) {
            console.error("Failed to load questions:", err);
        } finally {
            setQLoading(false);
        }
    }, []);

    // =========================================================================
    // TAB 3: USERS MANAGEMENT STATE
    // =========================================================================
    const [usersList, setUsersList] = useState([]);
    const [userSearch, setUserSearch] = useState("");
    const [usersLoading, setUsersLoading] = useState(false);
    const [userActionNotice, setUserActionNotice] = useState(null);
    const [deleteConfirmUserId, setDeleteConfirmUserId] = useState(null);

    const loadUsers = useCallback(async () => {
        setUsersLoading(true);
        try {
            const data = await fetchAdminUsers();
            setUsersList(data);
        } catch (err) {
            console.error("Failed to load users:", err);
        } finally {
            setUsersLoading(false);
        }
    }, []);

    // =========================================================================
    // TAB 4: LEADERBOARD MODERATION STATE
    // =========================================================================
    const [lbEntries, setLbEntries] = useState([]);
    const [lbSearch, setLbSearch] = useState("");
    const [lbCategoryFilter, setLbCategoryFilter] = useState("All");
    const [lbLoading, setLbLoading] = useState(false);
    const [deleteConfirmLbId, setDeleteConfirmLbId] = useState(null);
    const [lbNotice, setLbNotice] = useState(null);

    const loadLeaderboardData = useCallback(async () => {
        setLbLoading(true);
        try {
            const data = await fetchLeaderboard(100);
            setLbEntries(data);
        } catch (err) {
            console.error("Failed to load leaderboard entries:", err);
        } finally {
            setLbLoading(false);
        }
    }, []);

    // =========================================================================
    // TAB 5: WORD PUZZLE STUDIO STATE
    // =========================================================================
    const [wpSubTab, setWpSubTab] = useState("manage"); // 'manage', 'add', 'ai'
    const [allWordPuzzles, setAllWordPuzzles] = useState([]);
    const [wpSearch, setWpSearch] = useState("");
    const [wpCategoryFilter, setWpCategoryFilter] = useState("All");
    const [wpLoading, setWpLoading] = useState(false);
    const [wpNotice, setWpNotice] = useState(null);
    const [deleteConfirmWpId, setDeleteConfirmWpId] = useState(null);

    // Manual Word Puzzle form
    const [newWpWord, setNewWpWord] = useState("");
    const [newWpClue, setNewWpClue] = useState("");
    const [newWpCategory, setNewWpCategory] = useState("General Knowledge");
    const [newWpDifficulty, setNewWpDifficulty] = useState("Medium");
    const [submittingWp, setSubmittingWp] = useState(false);

    // AI Word Puzzle Generator
    const [aiWpTopic, setAiWpTopic] = useState("General Knowledge");
    const [aiWpDifficulty, setAiWpDifficulty] = useState("Medium");
    const [aiWpCount, setAiWpCount] = useState(3);
    const [aiWpGenerating, setAiWpGenerating] = useState(false);
    const [aiWpGeneratedList, setAiWpGeneratedList] = useState([]);
    const [aiWpPublishing, setAiWpPublishing] = useState(false);

    const loadWordPuzzles = useCallback(async () => {
        setWpLoading(true);
        try {
            const list = await fetchWordPuzzles({ category: "All", difficulty: "All", limit: 200 });
            setAllWordPuzzles(list);
        } catch (err) {
            console.error("Failed to load word puzzles:", err);
        } finally {
            setWpLoading(false);
        }
    }, []);

    // Load data on active tab change
    useEffect(() => {
        if (activeTab === "analytics") {
            loadAnalytics();
        } else if (activeTab === "questions") {
            loadCategories();
            loadQuestions();
        } else if (activeTab === "users") {
            loadUsers();
        } else if (activeTab === "leaderboard") {
            loadLeaderboardData();
        } else if (activeTab === "wordPuzzles") {
            loadWordPuzzles();
        }
    }, [activeTab, loadAnalytics, loadCategories, loadQuestions, loadUsers, loadLeaderboardData, loadWordPuzzles]);

    const handleAddWpSubmit = async (e) => {
        e.preventDefault();
        setWpNotice(null);
        if (!newWpWord.trim() || newWpWord.trim().length < 2) {
            setWpNotice({ type: "error", msg: "Target word must be at least 2 letters." });
            return;
        }
        if (!newWpClue.trim()) {
            setWpNotice({ type: "error", msg: "Clue/definition is required." });
            return;
        }
        setSubmittingWp(true);
        try {
            await submitWordPuzzle({
                word: newWpWord.trim(),
                clue: newWpClue.trim(),
                category: newWpCategory,
                difficulty: newWpDifficulty
            });
            playSound("correct");
            setWpNotice({ type: "success", msg: "🎉 Word Puzzle added successfully!" });
            setNewWpWord("");
            setNewWpClue("");
            loadWordPuzzles();
        } catch (err) {
            playSound("incorrect");
            setWpNotice({ type: "error", msg: err.message || "Failed to add word puzzle." });
        } finally {
            setSubmittingWp(false);
        }
    };

    const handleDeleteWp = async (id) => {
        try {
            await deleteWordPuzzle(id);
            playSound("tick");
            setAllWordPuzzles((prev) => prev.filter((p) => p.id !== id));
            setDeleteConfirmWpId(null);
            setWpNotice({ type: "success", msg: "✅ Word Puzzle deleted." });
            setTimeout(() => setWpNotice(null), 3000);
        } catch (err) {
            setWpNotice({ type: "error", msg: err.message });
        }
    };

    const handleGenerateAiWp = async (e) => {
        e.preventDefault();
        setWpNotice(null);
        if (!aiWpTopic.trim()) {
            setWpNotice({ type: "error", msg: "Please enter a topic for AI word puzzle generation." });
            return;
        }
        setAiWpGenerating(true);
        try {
            const list = await generateAiWordPuzzles({
                topic: aiWpTopic.trim(),
                difficulty: aiWpDifficulty,
                count: aiWpCount
            });
            playSound("streak");
            setAiWpGeneratedList(list);
            setWpNotice({ type: "success", msg: `✨ Generated ${list.length} AI Word Puzzles! Review below.` });
        } catch (err) {
            playSound("incorrect");
            setWpNotice({ type: "error", msg: err.message });
        } finally {
            setAiWpGenerating(false);
        }
    };

    const handlePublishAllAiWp = async () => {
        if (aiWpGeneratedList.length === 0) return;
        setAiWpPublishing(true);
        setWpNotice(null);
        try {
            for (const item of aiWpGeneratedList) {
                await submitWordPuzzle(item);
            }
            playSound("correct");
            setWpNotice({ type: "success", msg: `🎉 All ${aiWpGeneratedList.length} AI Word Puzzles published to database!` });
            setAiWpGeneratedList([]);
            loadWordPuzzles();
        } catch (err) {
            setWpNotice({ type: "error", msg: err.message });
        } finally {
            setAiWpPublishing(false);
        }
    };

    // Question Submit Handler
    const handleAddQuestionSubmit = async (e) => {
        e.preventDefault();
        setQNotice(null);
        const optionsList = [optA.trim(), optB.trim(), optC.trim(), optD.trim()];
        const finalCategory = newCat === "CUSTOM" ? (customCat.trim() || "General Knowledge") : newCat;

        if (!newQuestionText.trim()) {
            setQNotice({ type: "error", msg: "Please enter a question prompt." });
            return;
        }
        if (optionsList.some((o) => !o)) {
            setQNotice({ type: "error", msg: "All 4 options must be provided." });
            return;
        }

        setSubmittingQ(true);
        try {
            await submitQuestion({
                category: finalCategory,
                difficulty: newDiff,
                question: newQuestionText.trim(),
                options: optionsList,
                correctAnswer: optionsList[correctIdx],
                explanation: newExplanation.trim()
            });

            playSound("correct");
            setQNotice({ type: "success", msg: "🎉 Question published successfully!" });

            // Reset form
            setNewQuestionText("");
            setOptA("");
            setOptB("");
            setOptC("");
            setOptD("");
            setNewExplanation("");
            loadCategories();
            loadQuestions();
        } catch (err) {
            playSound("incorrect");
            setQNotice({ type: "error", msg: err.message || "Failed to publish question." });
        } finally {
            setSubmittingQ(false);
        }
    };

    // Question Delete Handler
    const handleDeleteQuestion = async (qId) => {
        try {
            await deleteQuestion(qId);
            playSound("tick");
            setAllQuestions((prev) => prev.filter((q) => q.id !== qId));
            setDeleteConfirmQId(null);
            setQNotice({ type: "success", msg: "✅ Question deleted from bank." });
            setTimeout(() => setQNotice(null), 3000);
        } catch (err) {
            setQNotice({ type: "error", msg: `Failed to delete question: ${err.message}` });
        }
    };

    // User Role Toggle Handler
    const handleToggleRole = async (targetUserId, currentRole) => {
        const newRole = currentRole === "admin" ? "user" : "admin";
        setUserActionNotice(null);
        try {
            await updateUserRole(targetUserId, newRole);
            playSound("streak");
            setUsersList((prev) =>
                prev.map((u) => (u.id === targetUserId ? { ...u, role: newRole } : u))
            );
            setUserActionNotice({ type: "success", msg: `Updated user role to '${newRole.toUpperCase()}'.` });
            setTimeout(() => setUserActionNotice(null), 3000);
        } catch (err) {
            setUserActionNotice({ type: "error", msg: err.message || "Failed to update user role." });
        }
    };

    // User Delete Handler
    const handleDeleteUser = async (targetUserId) => {
        setUserActionNotice(null);
        try {
            await deleteAdminUser(targetUserId);
            playSound("tick");
            setUsersList((prev) => prev.filter((u) => u.id !== targetUserId));
            setDeleteConfirmUserId(null);
            setUserActionNotice({ type: "success", msg: "✅ User account and scores deleted." });
            setTimeout(() => setUserActionNotice(null), 3000);
        } catch (err) {
            setUserActionNotice({ type: "error", msg: err.message || "Failed to delete user." });
        }
    };

    // Leaderboard Entry Delete Handler
    const handleDeleteLeaderboardEntry = async (entryId) => {
        setLbNotice(null);
        try {
            await deleteLeaderboardEntry(entryId);
            playSound("tick");
            setLbEntries((prev) => prev.filter((e) => e.id !== entryId));
            setDeleteConfirmLbId(null);
            setLbNotice({ type: "success", msg: "✅ Leaderboard entry removed." });
            setTimeout(() => setLbNotice(null), 3000);
        } catch (err) {
            setLbNotice({ type: "error", msg: err.message || "Failed to delete entry." });
        }
    };

    // Filters
    const filteredQuestions = allQuestions.filter((q) => {
        const matchesCat = qCategoryFilter === "All" || q.category === qCategoryFilter;
        const matchesSearch = !qSearch || q.question.toLowerCase().includes(qSearch.toLowerCase());
        return matchesCat && matchesSearch;
    });

    const filteredUsers = usersList.filter((u) => {
        const s = userSearch.toLowerCase();
        return u.username.toLowerCase().includes(s) || u.email.toLowerCase().includes(s) || u.role.toLowerCase().includes(s);
    });

    const lbCategories = ["All", ...new Set(lbEntries.map((e) => e.category).filter(Boolean))];
    const filteredLeaderboard = lbEntries.filter((e) => {
        const matchesCat = lbCategoryFilter === "All" || e.category === lbCategoryFilter;
        const matchesSearch = !lbSearch || e.playerName.toLowerCase().includes(lbSearch.toLowerCase());
        return matchesCat && matchesSearch;
    });

    if (!isAdmin) {
        return (
            <div className="home-container">
                <div className="error-card" style={{ marginTop: "2rem" }}>
                    <h2>⛔ Access Denied</h2>
                    <p>You need Administrator privileges to access the Admin Panel.</p>
                    <button className="primary-btn" onClick={() => navigate("/")} style={{ marginTop: "1rem" }}>
                        Return to Home Page
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-dashboard-container">
            {/* Header */}
            <div className="admin-header">
                <div className="admin-badge">👑 Master Control Panel</div>
                <h1 className="admin-title">QuizSpark Administrator Studio</h1>
                <p className="admin-subtitle">
                    Manage system analytics, user accounts, roles, question pool, and leaderboard scores.
                </p>
            </div>

            {/* Navigation Tabs */}
            <div className="admin-tabs">
                <button
                    type="button"
                    className={`admin-tab ${activeTab === "analytics" ? "active" : ""}`}
                    onClick={() => {
                        setActiveTab("analytics");
                        playSound("tick");
                    }}
                >
                    📊 System Analytics
                </button>
                <button
                    type="button"
                    className={`admin-tab ${activeTab === "questions" ? "active" : ""}`}
                    onClick={() => {
                        setActiveTab("questions");
                        playSound("tick");
                    }}
                >
                    ❓ Question Studio ({allQuestions.length})
                </button>
                <button
                    type="button"
                    className={`admin-tab ${activeTab === "users" ? "active" : ""}`}
                    onClick={() => {
                        setActiveTab("users");
                        playSound("tick");
                    }}
                >
                    👥 User Management ({usersList.length})
                </button>
                <button
                    type="button"
                    className={`admin-tab ${activeTab === "leaderboard" ? "active" : ""}`}
                    onClick={() => {
                        setActiveTab("leaderboard");
                        playSound("tick");
                    }}
                >
                    🏆 Leaderboard Moderation ({lbEntries.length})
                </button>
                <button
                    type="button"
                    className={`admin-tab ${activeTab === "wordPuzzles" ? "active" : ""}`}
                    onClick={() => {
                        setActiveTab("wordPuzzles");
                        playSound("tick");
                    }}
                >
                    🔤 Word Puzzle Studio ({allWordPuzzles.length})
                </button>
            </div>

            {/* =========================================================================
               TAB 1: SYSTEM ANALYTICS
               ========================================================================= */}
            {activeTab === "analytics" && (
                <div className="admin-tab-content">
                    {analyticsLoading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Gathering system metrics...</p>
                        </div>
                    ) : analytics ? (
                        <div className="analytics-grid">
                            {/* Key Metric Cards */}
                            <div className="admin-stat-card card-purple">
                                <div className="stat-card-icon">👥</div>
                                <div className="stat-card-data">
                                    <span className="stat-card-val">{analytics.totalUsers}</span>
                                    <span className="stat-card-lbl">Registered Users</span>
                                </div>
                            </div>

                            <div className="admin-stat-card card-gold">
                                <div className="stat-card-icon">👑</div>
                                <div className="stat-card-data">
                                    <span className="stat-card-val">{analytics.totalAdmins}</span>
                                    <span className="stat-card-lbl">Active Administrators</span>
                                </div>
                            </div>

                            <div className="admin-stat-card card-blue">
                                <div className="stat-card-icon">📚</div>
                                <div className="stat-card-data">
                                    <span className="stat-card-val">{analytics.totalQuestions}</span>
                                    <span className="stat-card-lbl">Total Questions</span>
                                </div>
                            </div>

                            <div className="admin-stat-card card-green">
                                <div className="stat-card-icon">🎮</div>
                                <div className="stat-card-data">
                                    <span className="stat-card-val">{analytics.totalGamesPlayed}</span>
                                    <span className="stat-card-lbl">Games Completed</span>
                                </div>
                            </div>

                            <div className="admin-stat-card card-pink">
                                <div className="stat-card-icon">🎯</div>
                                <div className="stat-card-data">
                                    <span className="stat-card-val">{analytics.averageAccuracy}%</span>
                                    <span className="stat-card-lbl">Average Accuracy</span>
                                </div>
                            </div>

                            {/* Category Distribution Card */}
                            <div className="admin-section-card full-width">
                                <h3>📂 Questions by Category</h3>
                                <div className="category-progress-list">
                                    {analytics.categories.map((c) => {
                                        const pct = analytics.totalQuestions > 0
                                            ? Math.round((c.count / analytics.totalQuestions) * 100)
                                            : 0;
                                        return (
                                            <div key={c.category} className="cat-progress-row">
                                                <div className="cat-progress-meta">
                                                    <strong>{c.category}</strong>
                                                    <span>{c.count} Qs ({pct}%)</span>
                                                </div>
                                                <div className="progress-bar-bg">
                                                    <div
                                                        className="progress-bar-fill"
                                                        style={{ width: `${pct}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Credentials & System Summary Box */}
                            <div className="admin-section-card full-width info-card">
                                <h3>ℹ️ Default Admin Credentials</h3>
                                <p style={{ opacity: 0.9, marginTop: "0.5rem" }}>
                                    Default system admin account seeded on backend initialization:
                                </p>
                                <div className="credentials-pill-box">
                                    <span>Username: <code>admin</code></span>
                                    <span>Password: <code>admin123</code></span>
                                    <span>Role: <code>admin</code></span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="error-card"><p>Failed to load analytics data.</p></div>
                    )}
                </div>
            )}

            {/* =========================================================================
               TAB 2: QUESTION STUDIO
               ========================================================================= */}
            {activeTab === "questions" && (
                <div className="admin-tab-content">
                    {/* Sub Navigation */}
                    <div className="studio-tabs-row" style={{ marginBottom: "1.5rem" }}>
                        <button
                            type="button"
                            className={`studio-tab ${qSubTab === "manage" ? "active" : ""}`}
                            onClick={() => { setQSubTab("manage"); playSound("tick"); }}
                        >
                            📋 Manage Question Bank ({allQuestions.length})
                        </button>
                        <button
                            type="button"
                            className={`studio-tab ${qSubTab === "add" ? "active" : ""}`}
                            onClick={() => { setQSubTab("add"); playSound("tick"); }}
                        >
                            ➕ Add Manual Question
                        </button>
                        <button
                            type="button"
                            className={`studio-tab ${qSubTab === "ai" ? "active" : ""}`}
                            onClick={() => { setQSubTab("ai"); playSound("tick"); }}
                        >
                            ✨ AI Question Studio
                        </button>
                    </div>

                    {qNotice && (
                        <div className={`alert ${qNotice.type === "success" ? "success-alert" : "error-alert"}`}>
                            <span>{qNotice.msg}</span>
                        </div>
                    )}

                    {qSubTab === "manage" && (
                        <div className="manage-questions-section">
                            {/* Controls */}
                            <div className="manage-controls-card">
                                <div className="search-box">
                                    <span className="search-icon">🔍</span>
                                    <input
                                        type="text"
                                        className="search-input"
                                        placeholder="Search questions by keyword..."
                                        value={qSearch}
                                        onChange={(e) => setQSearch(e.target.value)}
                                    />
                                </div>
                                <div className="category-select-wrapper">
                                    <select
                                        className="form-select"
                                        value={qCategoryFilter}
                                        onChange={(e) => setQCategoryFilter(e.target.value)}
                                    >
                                        <option value="All">All Categories ({allQuestions.length})</option>
                                        {existingCategories.map((c) => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {qLoading ? (
                                <div className="loading-state">
                                    <div className="spinner"></div>
                                    <p>Loading questions...</p>
                                </div>
                            ) : filteredQuestions.length === 0 ? (
                                <div className="empty-state-card">
                                    <span className="empty-icon">📂</span>
                                    <h3>No Questions Found</h3>
                                    <p>Try adjusting your search query or category filter.</p>
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
                                                    {deleteConfirmQId === q.id ? (
                                                        <div className="delete-confirm-box">
                                                            <span className="confirm-prompt">Confirm Delete?</span>
                                                            <button
                                                                type="button"
                                                                className="confirm-yes-btn"
                                                                onClick={() => handleDeleteQuestion(q.id)}
                                                            >
                                                                Yes, Delete
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="confirm-no-btn"
                                                                onClick={() => setDeleteConfirmQId(null)}
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            className="delete-btn"
                                                            onClick={() => setDeleteConfirmQId(q.id)}
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

                    {qSubTab === "add" && (
                        <div className="add-q-grid">
                            <form className="add-q-form-card" onSubmit={handleAddQuestionSubmit}>
                                <div className="form-row">
                                    <div className="form-group flex-1">
                                        <label>Category</label>
                                        <select
                                            className="form-select"
                                            value={newCat}
                                            onChange={(e) => setNewCat(e.target.value)}
                                        >
                                            {existingCategories.map((c) => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                            <option value="CUSTOM">+ Custom Category...</option>
                                        </select>
                                    </div>
                                    <div className="form-group flex-1">
                                        <label>Difficulty</label>
                                        <select
                                            className="form-select"
                                            value={newDiff}
                                            onChange={(e) => setNewDiff(e.target.value)}
                                        >
                                            <option value="Easy">Easy</option>
                                            <option value="Medium">Medium</option>
                                            <option value="Hard">Hard</option>
                                        </select>
                                    </div>
                                </div>

                                {newCat === "CUSTOM" && (
                                    <div className="form-group">
                                        <label>Custom Category Name</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Enter new category name..."
                                            value={customCat}
                                            onChange={(e) => setCustomCat(e.target.value)}
                                            required
                                        />
                                    </div>
                                )}

                                <div className="form-group">
                                    <label>Question Prompt</label>
                                    <textarea
                                        className="form-textarea"
                                        rows={3}
                                        placeholder="Enter the question..."
                                        value={newQuestionText}
                                        onChange={(e) => setNewQuestionText(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="options-label">
                                        <span>Answer Choices</span>
                                        <span className="sub-hint">(Radio selects correct answer)</span>
                                    </label>

                                    <div className="options-input-list">
                                        {[
                                            { label: "A", val: optA, setVal: setOptA },
                                            { label: "B", val: optB, setVal: setOptB },
                                            { label: "C", val: optC, setVal: setOptC },
                                            { label: "D", val: optD, setVal: setOptD }
                                        ].map((opt, idx) => (
                                            <div
                                                key={opt.label}
                                                className={`option-input-row ${correctIdx === idx ? "is-correct-choice" : ""}`}
                                            >
                                                <label className="radio-label">
                                                    <input
                                                        type="radio"
                                                        name="correctOptionAdmin"
                                                        checked={correctIdx === idx}
                                                        onChange={() => setCorrectIdx(idx)}
                                                    />
                                                    <span className="opt-letter-tag">{opt.label}</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-input option-text-field"
                                                    placeholder={`Choice ${opt.label}...`}
                                                    value={opt.val}
                                                    onChange={(e) => opt.setVal(e.target.value)}
                                                    required
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Explanation / Context</label>
                                    <textarea
                                        className="form-textarea"
                                        rows={2}
                                        placeholder="Explanation shown after user answers..."
                                        value={newExplanation}
                                        onChange={(e) => setNewExplanation(e.target.value)}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="primary-btn submit-btn"
                                    disabled={submittingQ}
                                >
                                    {submittingQ ? "Publishing..." : "🚀 Add Question to Database"}
                                </button>
                            </form>
                        </div>
                    )}

                    {qSubTab === "ai" && (
                        <div className="ai-generator-section">
                            <div className="add-q-form-card" style={{ marginBottom: "1.5rem" }}>
                                <h3>✨ AI Trivia & Question Generator</h3>
                                <p style={{ opacity: 0.85, fontSize: "0.9rem", marginBottom: "1rem" }}>
                                    Specify any topic, subject, or domain. The AI engine will generate multiple-choice questions with 4 distractor options, correct answers, and explanations.
                                </p>

                                <form onSubmit={handleGenerateAi}>
                                    <div className="form-group">
                                        <label>Topic / Prompt</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="e.g., Python Programming, Space Exploration, World War II..."
                                            value={aiTopic}
                                            onChange={(e) => setAiTopic(e.target.value)}
                                            required
                                        />
                                        <div className="quick-tags-row" style={{ marginTop: "0.5rem", display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                                            {["Programming & Tech", "Science & Space", "World History", "World Geography", "General Knowledge"].map((tag) => (
                                                <button
                                                    key={tag}
                                                    type="button"
                                                    className="category-chip"
                                                    style={{ padding: "0.2rem 0.6rem", fontSize: "0.78rem" }}
                                                    onClick={() => setAiTopic(tag)}
                                                >
                                                    {tag}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group flex-1">
                                            <label>Difficulty</label>
                                            <select
                                                className="form-select"
                                                value={aiDifficulty}
                                                onChange={(e) => setAiDifficulty(e.target.value)}
                                            >
                                                <option value="Easy">Easy</option>
                                                <option value="Medium">Medium</option>
                                                <option value="Hard">Hard</option>
                                            </select>
                                        </div>

                                        <div className="form-group flex-1">
                                            <label>Number of Questions ({aiCount})</label>
                                            <div className="button-group">
                                                {[1, 3, 5].map((cnt) => (
                                                    <button
                                                        key={cnt}
                                                        type="button"
                                                        className={`pill-btn ${aiCount === cnt ? "active" : ""}`}
                                                        onClick={() => setAiCount(cnt)}
                                                    >
                                                        {cnt} Questions
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="primary-btn submit-btn"
                                        disabled={aiGenerating}
                                        style={{ background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)" }}
                                    >
                                        {aiGenerating ? "⚡ Generating with AI..." : "✨ Generate AI Questions"}
                                    </button>
                                </form>
                            </div>

                            {/* Generated AI Preview & Publish Cards */}
                            {aiGeneratedList.length > 0 && (
                                <div className="ai-preview-batch">
                                    <div className="section-header-row" style={{ marginBottom: "1rem" }}>
                                        <h3>👁️ Generated AI Questions Preview ({aiGeneratedList.length})</h3>
                                        <button
                                            type="button"
                                            className="primary-btn"
                                            disabled={aiPublishing}
                                            onClick={handlePublishAllAi}
                                        >
                                            {aiPublishing ? "Publishing..." : "🚀 Publish All to Question Bank"}
                                        </button>
                                    </div>

                                    <div className="questions-manage-list">
                                        {aiGeneratedList.map((q, idx) => (
                                            <div key={idx} className="question-manage-card" style={{ borderColor: "rgba(139, 92, 246, 0.4)" }}>
                                                <div className="manage-card-top">
                                                    <div className="meta-badges">
                                                        <span className="badge category-badge">📁 {q.category}</span>
                                                        <span className="badge difficulty-badge diff-medium">★ {q.difficulty}</span>
                                                        <span className="badge" style={{ background: "rgba(139, 92, 246, 0.2)", color: "#a78bfa" }}>
                                                            ✨ AI Generated
                                                        </span>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        className="primary-btn"
                                                        style={{ padding: "0.3rem 0.75rem", fontSize: "0.82rem" }}
                                                        onClick={async () => {
                                                            try {
                                                                await submitQuestion(q);
                                                                playSound("correct");
                                                                setAiGeneratedList((prev) => prev.filter((_, i) => i !== idx));
                                                                setQNotice({ type: "success", msg: "Question published to database!" });
                                                                loadCategories();
                                                                loadQuestions();
                                                            } catch (err) {
                                                                setQNotice({ type: "error", msg: err.message });
                                                            }
                                                        }}
                                                    >
                                                        Publish Question
                                                    </button>
                                                </div>

                                                <h3 className="manage-q-text">{q.question}</h3>

                                                <div className="manage-options-grid">
                                                    {q.options.map((opt, i) => (
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
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* =========================================================================
               TAB 3: USER MANAGEMENT
               ========================================================================= */}
            {activeTab === "users" && (
                <div className="admin-tab-content">
                    {userActionNotice && (
                        <div className={`alert ${userActionNotice.type === "success" ? "success-alert" : "error-alert"}`}>
                            <span>{userActionNotice.msg}</span>
                        </div>
                    )}

                    {/* Search & Filter */}
                    <div className="manage-controls-card">
                        <div className="search-box">
                            <span className="search-icon">🔍</span>
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search users by username, email, or role..."
                                value={userSearch}
                                onChange={(e) => setUserSearch(e.target.value)}
                            />
                        </div>
                        <div className="users-count-badge">
                            Total: <strong>{filteredUsers.length} Users</strong>
                        </div>
                    </div>

                    {usersLoading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Loading user list...</p>
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="empty-state-card">
                            <span className="empty-icon">👥</span>
                            <h3>No Users Found</h3>
                            <p>No matching registered user accounts.</p>
                        </div>
                    ) : (
                        <div className="leaderboard-table-card">
                            <table className="leaderboard-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>User Profile</th>
                                        <th>Role</th>
                                        <th>Games Played</th>
                                        <th>Registered Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((u) => (
                                        <tr key={u.id}>
                                            <td>#{u.id}</td>
                                            <td>
                                                <div className="user-profile-cell">
                                                    <span className="user-avatar-mini">
                                                        {u.username.slice(0, 2).toUpperCase()}
                                                    </span>
                                                    <div>
                                                        <strong>{u.username}</strong>
                                                        <div style={{ fontSize: "0.8rem", opacity: 0.7 }}>{u.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`role-badge ${u.role === "admin" ? "role-admin" : "role-user"}`}>
                                                    {u.role === "admin" ? "👑 Admin" : "👤 User"}
                                                </span>
                                            </td>
                                            <td>{u.gamesPlayed} games</td>
                                            <td className="date-col">{u.createdAt || "N/A"}</td>
                                            <td>
                                                <div className="table-action-btns">
                                                    {/* Role Toggle */}
                                                    {u.id !== user?.id && (
                                                        <button
                                                            type="button"
                                                            className="role-toggle-btn"
                                                            onClick={() => handleToggleRole(u.id, u.role)}
                                                        >
                                                            {u.role === "admin" ? "Demote to User" : "Promote to Admin"}
                                                        </button>
                                                    )}

                                                    {/* Delete User */}
                                                    {u.id !== user?.id && (
                                                        deleteConfirmUserId === u.id ? (
                                                            <div className="delete-confirm-box inline">
                                                                <button
                                                                    type="button"
                                                                    className="confirm-yes-btn"
                                                                    onClick={() => handleDeleteUser(u.id)}
                                                                >
                                                                    Confirm
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="confirm-no-btn"
                                                                    onClick={() => setDeleteConfirmUserId(null)}
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                className="delete-icon-btn"
                                                                title="Delete User Account"
                                                                onClick={() => setDeleteConfirmUserId(u.id)}
                                                            >
                                                                🗑️ Delete
                                                            </button>
                                                        )
                                                    )}

                                                    {u.id === user?.id && (
                                                        <span style={{ fontSize: "0.8rem", color: "var(--accent-cyan)" }}>
                                                            (You)
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* =========================================================================
               TAB 4: LEADERBOARD MODERATION
               ========================================================================= */}
            {activeTab === "leaderboard" && (
                <div className="admin-tab-content">
                    {lbNotice && (
                        <div className={`alert ${lbNotice.type === "success" ? "success-alert" : "error-alert"}`}>
                            <span>{lbNotice.msg}</span>
                        </div>
                    )}

                    {/* Controls */}
                    <div className="manage-controls-card">
                        <div className="search-box">
                            <span className="search-icon">🔍</span>
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search by player name..."
                                value={lbSearch}
                                onChange={(e) => setLbSearch(e.target.value)}
                            />
                        </div>
                        <div className="category-select-wrapper">
                            <select
                                className="form-select"
                                value={lbCategoryFilter}
                                onChange={(e) => setLbCategoryFilter(e.target.value)}
                            >
                                {lbCategories.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {lbLoading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Loading leaderboard entries...</p>
                        </div>
                    ) : filteredLeaderboard.length === 0 ? (
                        <div className="empty-state-card">
                            <span className="empty-icon">🏆</span>
                            <h3>No Leaderboard Scores</h3>
                            <p>No score records found matching criteria.</p>
                        </div>
                    ) : (
                        <div className="leaderboard-table-card">
                            <table className="leaderboard-table">
                                <thead>
                                    <tr>
                                        <th>Entry ID</th>
                                        <th>Player Name</th>
                                        <th>Category</th>
                                        <th>Score</th>
                                        <th>Accuracy</th>
                                        <th>Played Date</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLeaderboard.map((item) => (
                                        <tr key={item.id}>
                                            <td>#{item.id}</td>
                                            <td><strong>{item.playerName}</strong></td>
                                            <td><span className="category-tag">{item.category}</span></td>
                                            <td>{item.score} / {item.totalQuestions}</td>
                                            <td><span className="accuracy-pill">{item.percentage}%</span></td>
                                            <td className="date-col">{item.playedAt || "N/A"}</td>
                                            <td>
                                                {deleteConfirmLbId === item.id ? (
                                                    <div className="delete-confirm-box inline">
                                                        <button
                                                            type="button"
                                                            className="confirm-yes-btn"
                                                            onClick={() => handleDeleteLeaderboardEntry(item.id)}
                                                        >
                                                            Remove
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="confirm-no-btn"
                                                            onClick={() => setDeleteConfirmLbId(null)}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        className="delete-icon-btn"
                                                        title="Delete fake/cheated score"
                                                        onClick={() => setDeleteConfirmLbId(item.id)}
                                                    >
                                                        🗑️ Delete Entry
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* =========================================================================
               TAB 5: WORD PUZZLE STUDIO
               ========================================================================= */}
            {activeTab === "wordPuzzles" && (
                <div className="admin-tab-content">
                    {/* Sub Navigation */}
                    <div className="studio-tabs-row" style={{ marginBottom: "1.5rem" }}>
                        <button
                            type="button"
                            className={`studio-tab ${wpSubTab === "manage" ? "active" : ""}`}
                            onClick={() => { setWpSubTab("manage"); playSound("tick"); }}
                        >
                            📋 Manage Word Puzzles ({allWordPuzzles.length})
                        </button>
                        <button
                            type="button"
                            className={`studio-tab ${wpSubTab === "add" ? "active" : ""}`}
                            onClick={() => { setWpSubTab("add"); playSound("tick"); }}
                        >
                            ➕ Add Manual Word Puzzle
                        </button>
                        <button
                            type="button"
                            className={`studio-tab ${wpSubTab === "ai" ? "active" : ""}`}
                            onClick={() => { setWpSubTab("ai"); playSound("tick"); }}
                        >
                            ✨ AI Word Puzzle Generator
                        </button>
                    </div>

                    {wpNotice && (
                        <div className={`alert ${wpNotice.type === "success" ? "success-alert" : "error-alert"}`}>
                            <span>{wpNotice.msg}</span>
                        </div>
                    )}

                    {/* Sub Tab 1: MANAGE WORD PUZZLES */}
                    {wpSubTab === "manage" && (
                        <div className="manage-questions-section">
                            <div className="manage-controls-card">
                                <div className="search-box">
                                    <span className="search-icon">🔍</span>
                                    <input
                                        type="text"
                                        className="search-input"
                                        placeholder="Search word puzzles by word or clue..."
                                        value={wpSearch}
                                        onChange={(e) => setWpSearch(e.target.value)}
                                    />
                                </div>
                                <div className="category-select-wrapper">
                                    <select
                                        className="form-select"
                                        value={wpCategoryFilter}
                                        onChange={(e) => setWpCategoryFilter(e.target.value)}
                                    >
                                        <option value="All">All Categories ({allWordPuzzles.length})</option>
                                        {existingCategories.map((c) => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {wpLoading ? (
                                <div className="loading-state">
                                    <div className="spinner"></div>
                                    <p>Loading word puzzles...</p>
                                </div>
                            ) : allWordPuzzles.length === 0 ? (
                                <div className="empty-state-card">
                                    <span className="empty-icon">🔤</span>
                                    <h3>No Word Puzzles Found</h3>
                                    <p>Try clearing filters or generate new puzzles with AI.</p>
                                </div>
                            ) : (
                                <div className="questions-manage-list">
                                    {allWordPuzzles
                                        .filter((p) => {
                                            const matchesCat = wpCategoryFilter === "All" || p.category === wpCategoryFilter;
                                            const matchesSearch = !wpSearch || p.word.toLowerCase().includes(wpSearch.toLowerCase()) || p.clue.toLowerCase().includes(wpSearch.toLowerCase());
                                            return matchesCat && matchesSearch;
                                        })
                                        .map((p) => (
                                            <div key={p.id} className="question-manage-card">
                                                <div className="manage-card-top">
                                                    <div className="meta-badges">
                                                        <span className="badge category-badge">📁 {p.category}</span>
                                                        <span className="badge difficulty-badge diff-medium">★ {p.difficulty}</span>
                                                        <span className="badge q-id-badge">ID: #{p.id}</span>
                                                    </div>

                                                    {deleteConfirmWpId === p.id ? (
                                                        <div className="delete-confirm-box">
                                                            <button
                                                                type="button"
                                                                className="confirm-yes-btn"
                                                                onClick={() => handleDeleteWp(p.id)}
                                                            >
                                                                Delete
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="confirm-no-btn"
                                                                onClick={() => setDeleteConfirmWpId(null)}
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            className="delete-btn"
                                                            onClick={() => setDeleteConfirmWpId(p.id)}
                                                        >
                                                            🗑️ Delete Puzzle
                                                        </button>
                                                    )}
                                                </div>

                                                <h3 className="manage-q-text" style={{ color: "var(--primary)" }}>
                                                    Target Word: <strong>{p.word}</strong>
                                                </h3>

                                                <div className="manage-explanation" style={{ fontSize: "0.95rem" }}>
                                                    💡 <strong>Clue:</strong> {p.clue}
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Sub Tab 2: ADD MANUAL WORD PUZZLE */}
                    {wpSubTab === "add" && (
                        <div className="add-q-grid">
                            <form className="add-q-form-card" onSubmit={handleAddWpSubmit}>
                                <div className="form-group">
                                    <label>Target Word</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="e.g. ALGORITHM, SUPERNOVA..."
                                        value={newWpWord}
                                        onChange={(e) => setNewWpWord(e.target.value.toUpperCase())}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Clue / Definition</label>
                                    <textarea
                                        className="form-textarea"
                                        rows={3}
                                        placeholder="Enter definition or hint for players..."
                                        value={newWpClue}
                                        onChange={(e) => setNewWpClue(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group flex-1">
                                        <label>Category</label>
                                        <select
                                            className="form-select"
                                            value={newWpCategory}
                                            onChange={(e) => setNewWpCategory(e.target.value)}
                                        >
                                            {existingCategories.map((c) => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group flex-1">
                                        <label>Difficulty</label>
                                        <select
                                            className="form-select"
                                            value={newWpDifficulty}
                                            onChange={(e) => setNewWpDifficulty(e.target.value)}
                                        >
                                            <option value="Easy">Easy</option>
                                            <option value="Medium">Medium</option>
                                            <option value="Hard">Hard</option>
                                        </select>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="primary-btn submit-btn"
                                    disabled={submittingWp}
                                >
                                    {submittingWp ? "Saving..." : "🚀 Publish Word Puzzle"}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Sub Tab 3: AI WORD PUZZLE GENERATOR */}
                    {wpSubTab === "ai" && (
                        <div className="ai-generator-section">
                            <div className="add-q-form-card" style={{ marginBottom: "1.5rem" }}>
                                <h3>✨ AI Word Puzzle Generator</h3>
                                <p style={{ opacity: 0.85, fontSize: "0.9rem", marginBottom: "1rem" }}>
                                    Generate vocabulary anagram challenges with hints automatically!
                                </p>

                                <form onSubmit={handleGenerateAiWp}>
                                    <div className="form-group">
                                        <label>Topic / Domain</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="e.g., Programming & Tech, Science & Space..."
                                            value={aiWpTopic}
                                            onChange={(e) => setAiWpTopic(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group flex-1">
                                            <label>Difficulty</label>
                                            <select
                                                className="form-select"
                                                value={aiWpDifficulty}
                                                onChange={(e) => setAiWpDifficulty(e.target.value)}
                                            >
                                                <option value="Easy">Easy</option>
                                                <option value="Medium">Medium</option>
                                                <option value="Hard">Hard</option>
                                            </select>
                                        </div>

                                        <div className="form-group flex-1">
                                            <label>Number of Puzzles ({aiWpCount})</label>
                                            <div className="button-group">
                                                {[1, 3, 5].map((cnt) => (
                                                    <button
                                                        key={cnt}
                                                        type="button"
                                                        className={`pill-btn ${aiWpCount === cnt ? "active" : ""}`}
                                                        onClick={() => setAiWpCount(cnt)}
                                                    >
                                                        {cnt} Puzzles
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="primary-btn submit-btn"
                                        disabled={aiWpGenerating}
                                        style={{ background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)" }}
                                    >
                                        {aiWpGenerating ? "⚡ Generating AI Puzzles..." : "✨ Generate AI Word Puzzles"}
                                    </button>
                                </form>
                            </div>

                            {/* Generated AI Preview List */}
                            {aiWpGeneratedList.length > 0 && (
                                <div className="ai-preview-batch">
                                    <div className="section-header-row" style={{ marginBottom: "1rem" }}>
                                        <h3>👁️ Generated Word Puzzles ({aiWpGeneratedList.length})</h3>
                                        <button
                                            type="button"
                                            className="primary-btn"
                                            disabled={aiWpPublishing}
                                            onClick={handlePublishAllAiWp}
                                        >
                                            {aiWpPublishing ? "Publishing..." : "🚀 Publish All to Database"}
                                        </button>
                                    </div>

                                    <div className="questions-manage-list">
                                        {aiWpGeneratedList.map((item, idx) => (
                                            <div key={idx} className="question-manage-card">
                                                <h3 className="manage-q-text" style={{ color: "var(--primary)" }}>
                                                    Target Word: <strong>{item.word}</strong>
                                                </h3>
                                                <div className="manage-explanation">
                                                    💡 <strong>Clue:</strong> {item.clue}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
