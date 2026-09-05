const BASE_URL = "http://127.0.0.1:5001/api";

// ==============================================================================
// AUTH API
// ==============================================================================

export async function apiRegister({ username, email, password }) {
    const response = await fetch(`${BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || `Registration failed: ${response.status}`);
    }
    return data;
}

export async function apiLogin({ identifier, password }) {
    const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || `Login failed: ${response.status}`);
    }
    return data;
}

export async function apiGetUser(userId) {
    const response = await fetch(`${BASE_URL}/auth/user/${userId}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch user: ${response.status}`);
    }
    return await response.json();
}

// ==============================================================================
// QUESTIONS & CATEGORIES API
// ==============================================================================

export async function fetchCategories() {
    const response = await fetch(`${BASE_URL}/categories`);
    if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status}`);
    }
    return await response.json();
}

export async function fetchQuestions({ category = "All", difficulty = "All", limit = 10 } = {}) {
    const params = new URLSearchParams();
    if (category && category !== "All") params.append("category", category);
    if (difficulty && difficulty !== "All") params.append("difficulty", difficulty);
    if (limit) params.append("limit", limit);

    const response = await fetch(`${BASE_URL}/questions?${params.toString()}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch questions: ${response.status}`);
    }
    return await response.json();
}

export async function submitQuestion(questionData) {
    const response = await fetch(`${BASE_URL}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(questionData),
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `Failed to submit question: ${response.status}`);
    }
    return await response.json();
}

export async function deleteQuestion(questionId) {
    const response = await fetch(`${BASE_URL}/questions/${questionId}`, {
        method: "DELETE",
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `Failed to delete question: ${response.status}`);
    }
    return await response.json();
}


// ==============================================================================
// LEADERBOARD & STATS API
// ==============================================================================

export async function fetchLeaderboard(limit = 20) {
    const response = await fetch(`${BASE_URL}/leaderboard?limit=${limit}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch leaderboard: ${response.status}`);
    }
    return await response.json();
}

export async function submitScore(scoreData) {
    const response = await fetch(`${BASE_URL}/leaderboard`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scoreData),
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `Failed to submit score: ${response.status}`);
    }
    return await response.json();
}

export async function fetchStats() {
    const response = await fetch(`${BASE_URL}/stats`);
    if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.status}`);
    }
    return await response.json();
}