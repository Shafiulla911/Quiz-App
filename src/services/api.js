const BASE_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5001/api";

/**
 * Wrapper around fetch to gracefully catch connection/network errors
 * and provide actionable messages when the Python Flask server is down.
 */
async function safeFetch(url, options = {}) {
    let response;
    try {
        response = await fetch(url, options);
    } catch (err) {
        if (err.name === "TypeError" || err.message?.includes("fetch")) {
            throw new Error(
                "Unable to connect to backend server. Please ensure the Python backend is running on port 5001 (python src/backend/app.py)."
            );
        }
        throw err;
    }

    const contentType = response.headers.get("content-type");
    let data;
    if (contentType && contentType.includes("application/json")) {
        data = await response.json().catch(() => ({}));
    } else {
        data = await response.text().catch(() => "");
    }

    if (!response.ok) {
        const errorMsg = typeof data === "object" && data?.error
            ? data.error
            : `Request failed with status ${response.status}`;
        throw new Error(errorMsg);
    }

    return data;
}

// ==============================================================================
// AUTH API
// ==============================================================================

export async function apiRegister({ username, email, password }) {
    return safeFetch(`${BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
    });
}

export async function apiLogin({ identifier, password }) {
    return safeFetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
    });
}

export async function apiGetUser(userId) {
    return safeFetch(`${BASE_URL}/auth/user/${userId}`);
}

// ==============================================================================
// QUESTIONS & CATEGORIES API
// ==============================================================================

export async function fetchCategories() {
    return safeFetch(`${BASE_URL}/categories`);
}

export async function fetchQuestions({ category = "All", difficulty = "All", limit = 10 } = {}) {
    const params = new URLSearchParams();
    if (category && category !== "All") params.append("category", category);
    if (difficulty && difficulty !== "All") params.append("difficulty", difficulty);
    if (limit) params.append("limit", limit);

    return safeFetch(`${BASE_URL}/questions?${params.toString()}`);
}

export async function submitQuestion(questionData) {
    return safeFetch(`${BASE_URL}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(questionData),
    });
}

export async function deleteQuestion(questionId) {
    return safeFetch(`${BASE_URL}/questions/${questionId}`, {
        method: "DELETE",
    });
}

// ==============================================================================
// LEADERBOARD & STATS API
// ==============================================================================

export async function fetchLeaderboard(limit = 20) {
    return safeFetch(`${BASE_URL}/leaderboard?limit=${limit}`);
}

export async function submitScore(scoreData) {
    return safeFetch(`${BASE_URL}/leaderboard`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scoreData),
    });
}

export async function fetchStats() {
    return safeFetch(`${BASE_URL}/stats`);
}

// ==============================================================================
// ADMIN API
// ==============================================================================

export async function fetchAdminUsers() {
    return safeFetch(`${BASE_URL}/admin/users`);
}

export async function updateUserRole(userId, role) {
    return safeFetch(`${BASE_URL}/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
    });
}

export async function deleteAdminUser(userId) {
    return safeFetch(`${BASE_URL}/admin/users/${userId}`, {
        method: "DELETE",
    });
}

export async function deleteLeaderboardEntry(entryId) {
    return safeFetch(`${BASE_URL}/admin/leaderboard/${entryId}`, {
        method: "DELETE",
    });
}

export async function fetchAdminAnalytics() {
    return safeFetch(`${BASE_URL}/admin/analytics`);
}

export async function generateAiQuestions({ topic, difficulty, count }) {
    return safeFetch(`${BASE_URL}/admin/generate-questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, difficulty, count }),
    });
}

// ==============================================================================
// USER PROFILE & HISTORY API
// ==============================================================================

export async function fetchUserHistory(userId) {
    return safeFetch(`${BASE_URL}/users/${userId}/history`);
}

// ==============================================================================
// WORD PUZZLE API
// ==============================================================================

export async function fetchWordPuzzles({ category = "All", difficulty = "All", limit = 10 } = {}) {
    const params = new URLSearchParams();
    if (category && category !== "All") params.append("category", category);
    if (difficulty && difficulty !== "All") params.append("difficulty", difficulty);
    if (limit) params.append("limit", limit);

    return safeFetch(`${BASE_URL}/word-puzzles?${params.toString()}`);
}

export async function submitWordPuzzle(puzzleData) {
    return safeFetch(`${BASE_URL}/word-puzzles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(puzzleData),
    });
}

export async function deleteWordPuzzle(puzzleId) {
    return safeFetch(`${BASE_URL}/word-puzzles/${puzzleId}`, {
        method: "DELETE",
    });
}

export async function generateAiWordPuzzles({ topic, difficulty, count }) {
    return safeFetch(`${BASE_URL}/admin/generate-word-puzzles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, difficulty, count }),
    });
}