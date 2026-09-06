import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { playSound } from "../services/sound";

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, register, isAuthenticated, user, logout } = useAuth();

    const from = location.state?.from?.pathname || "/";

    const [isRegisterMode, setIsRegisterMode] = useState(false);
    const [identifier, setIdentifier] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [loginType, setLoginType] = useState("user");

    const handleLoginTypeChange = (type) => {
        setLoginType(type);
        setError(null);
        if (type === "admin") {
            setIdentifier("admin");
            setPassword("admin123");
            playSound("streak");
        } else {
            setIdentifier("");
            setPassword("");
            playSound("tick");
        }
    };

    const handleMouseMove = (e) => {
        const { clientX, clientY } = e;
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const offsetX = (clientX - centerX) / 25;
        const offsetY = (clientY - centerY) / 25;
        setMousePos({ x: offsetX, y: offsetY });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage("");

        setLoading(true);
        try {
            if (isRegisterMode) {
                // Sign Up validation
                if (!username.trim() || username.length < 3) {
                    throw new Error("Username must be at least 3 characters.");
                }
                if (!email.trim() || !email.includes("@") || !email.includes(".")) {
                    throw new Error("Please enter a valid email address.");
                }
                if (password.length < 6) {
                    throw new Error("Password must be at least 6 characters.");
                }
                if (password !== confirmPassword) {
                    throw new Error("Passwords do not match. Please re-enter.");
                }

                // Register user in database
                await register(username.trim(), email.trim(), password);
                
                // Do NOT auto-login or redirect. Pre-fill login credentials and switch to Login tab.
                playSound("correct");
                const registeredName = username.trim();
                
                setIdentifier(registeredName);
                setPassword("");
                setConfirmPassword("");
                setUsername("");
                setEmail("");
                setIsRegisterMode(false);
                setSuccessMessage(`🎉 Account created for "${registeredName}"! Please enter your password below to log in.`);
            } else {
                // Log In validation
                if (!identifier.trim() || !password) {
                    throw new Error("Please enter your username/email and password.");
                }

                await login(identifier.trim(), password);
                playSound("correct");
                setSuccessMessage("🎉 Login successful! Opening QuizSpark...");

                setTimeout(() => {
                    navigate(from === "/login" ? "/" : from, { replace: true });
                }, 500);
            }
        } catch (err) {
            console.error("Auth error:", err);
            setError(err.message || "Authentication failed. Please check your credentials.");
            playSound("incorrect");
        } finally {
            setLoading(false);
        }
    };

    if (isAuthenticated && user) {
        return (
            <div className="auth-container">
                <div className="auth-card profile-active-card">
                    <div className="auth-header">
                        <div className="user-avatar-large">
                            {user.username.slice(0, 2).toUpperCase()}
                        </div>
                        <h2 className="auth-title">Welcome back, {user.username}!</h2>
                        <p className="auth-subtitle">Signed in as <strong>{user.email}</strong></p>
                    </div>

                    <div className="profile-actions">
                        <button
                            type="button"
                            className="primary-btn-large"
                            onClick={() => navigate("/")}
                        >
                            ⚡ Enter Quiz App
                        </button>
                        {user.role === "admin" && (
                            <button
                                type="button"
                                className="primary-btn-large"
                                style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" }}
                                onClick={() => navigate("/admin")}
                            >
                                👑 Open Admin Studio
                            </button>
                        )}
                        <button
                            type="button"
                            className="secondary-btn"
                            onClick={() => navigate("/leaderboard")}
                        >
                            🏆 View Leaderboard
                        </button>
                        <button
                            type="button"
                            className="danger-btn"
                            onClick={() => {
                                logout();
                                playSound("tick");
                            }}
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container" onMouseMove={handleMouseMove}>
            {/* Interactive Cursor-Tracking 3D Parallax Animation Layer (Login/Signup Only) */}
            <div className="auth-bg-animation" aria-hidden="true">
                {/* 3D Floating Glass Geometric Prisms - Mid Layer */}
                <div
                    className="parallax-layer shapes-layer"
                    style={{
                        transform: `translate3d(${mousePos.x * 1.3}px, ${mousePos.y * 1.3}px, 0)`
                    }}
                >
                    <div className="geo-shape shape-1"></div>
                    <div className="geo-shape shape-2"></div>
                    <div className="geo-shape shape-3"></div>
                    <div className="geo-shape shape-4"></div>
                    <div className="geo-shape shape-5"></div>
                </div>

                {/* Radiating Energy Aura Rings - Deep Layer */}
                <div
                    className="parallax-layer rings-layer"
                    style={{
                        transform: `translate3d(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px, 0)`
                    }}
                >
                    <div className="energy-ring ring-1"></div>
                    <div className="energy-ring ring-2"></div>
                </div>

                {/* Twinkling Light Crystals & Sparkles - Foreground Layer */}
                <div
                    className="parallax-layer crystals-layer"
                    style={{
                        transform: `translate3d(${mousePos.x * 2.2}px, ${mousePos.y * 2.2}px, 0)`
                    }}
                >
                    <div className="light-crystal c1">✨</div>
                    <div className="light-crystal c2">💎</div>
                    <div className="light-crystal c3">⚡</div>
                    <div className="light-crystal c4">✨</div>
                    <div className="light-crystal c5">🌟</div>
                    <div className="light-crystal c6">✦</div>
                </div>
            </div>

            <div className="auth-card">

                {/* Header */}
                <div className="auth-header">
                    <span className="auth-icon-badge">🧠</span>
                    <h1 className="auth-title">
                        {isRegisterMode ? "Create QuizSpark Account" : "Welcome to QuizSpark"}
                    </h1>
                    <p className="auth-subtitle">
                        {isRegisterMode
                            ? "Sign up to create your player account, then log in with your credentials!"
                            : "Select your account type below to log in."}
                    </p>
                </div>

                {/* Tab Switcher */}
                <div className="auth-tab-group">
                    <button
                        type="button"
                        className={`auth-tab ${!isRegisterMode ? "active" : ""}`}
                        onClick={() => {
                            setIsRegisterMode(false);
                            setError(null);
                        }}
                    >
                        Log In
                    </button>
                    <button
                        type="button"
                        className={`auth-tab ${isRegisterMode ? "active" : ""}`}
                        onClick={() => {
                            setIsRegisterMode(true);
                            setError(null);
                            setSuccessMessage("");
                        }}
                    >
                        Sign Up
                    </button>
                </div>

                {/* Role Selector (Log In Mode Only) */}
                {!isRegisterMode && (
                    <div className="form-group" style={{ marginBottom: "1rem" }}>
                        <label style={{ fontSize: "0.88rem", fontWeight: 700, marginBottom: "0.4rem", display: "block" }}>
                            Account Type / Role:
                        </label>
                        <select
                            className="form-select"
                            value={loginType}
                            onChange={(e) => handleLoginTypeChange(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "0.75rem 1rem",
                                borderRadius: "12px",
                                border: "1px solid var(--border-light)",
                                background: "var(--surface-card-muted)",
                                color: "var(--text-main)",
                                fontWeight: 600,
                                cursor: "pointer"
                            }}
                        >
                            <option value="user">👤 Player / Normal User</option>
                            <option value="admin">👑 Administrator (Auto-Fill Admin Credentials)</option>
                        </select>

                        {loginType === "admin" && (
                            <div className="alert success-alert" style={{ marginTop: "0.75rem", fontSize: "0.85rem" }}>
                                🔑 <strong>Admin Auto-Fill Active!</strong> Default credentials set to:
                                <div style={{ marginTop: "4px", fontFamily: "monospace" }}>
                                    Username: <strong>admin</strong> | Password: <strong>admin123</strong>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Alert Messages */}
                {error && (
                    <div className="alert error-alert">
                        <span>⚠️ {error}</span>
                        {error.includes("backend") && (
                            <div style={{ marginTop: "8px", fontSize: "0.85rem", opacity: 0.9 }}>
                                💡 <strong>Quick Fix:</strong> Run <code>python src/backend/app.py</code> in your terminal or use <code>npm run backend</code> to start the backend server.
                            </div>
                        )}
                    </div>
                )}

                {successMessage && (
                    <div className="alert success-alert">
                        <span>{successMessage}</span>
                    </div>
                )}

                {/* Auth Form */}
                <form className="auth-form" onSubmit={handleSubmit}>
                    {isRegisterMode ? (
                        <>
                            <div className="form-group">
                                <label>Username</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Choose a player username (min 3 chars)"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </>
                    ) : (
                        <div className="form-group">
                            <label>Username or Email</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Enter your username or email"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <div className="label-with-action">
                            <label>Password</label>
                            <button
                                type="button"
                                className="text-toggle-btn"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                        <input
                            type={showPassword ? "text" : "password"}
                            className="form-input"
                            placeholder={isRegisterMode ? "Create password (min 6 chars)" : "Enter your password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {isRegisterMode && (
                        <div className="form-group">
                            <label>Confirm Password</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                className="form-input"
                                placeholder="Re-enter your password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        className="auth-submit-btn"
                        disabled={loading}
                    >
                        {loading
                            ? "Verifying..."
                            : isRegisterMode
                                ? "Create Account →"
                                : "Log In & Open Website ⚡"}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        {isRegisterMode ? "Already have an account? " : "Don't have an account? "}
                        <button
                            type="button"
                            className="link-btn"
                            onClick={() => {
                                setIsRegisterMode(!isRegisterMode);
                                setError(null);
                                setSuccessMessage("");
                            }}
                        >
                            {isRegisterMode ? "Log In" : "Sign Up Free"}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
