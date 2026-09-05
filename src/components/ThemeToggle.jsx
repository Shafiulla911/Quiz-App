import { useTheme } from "../context/ThemeContext";
import { playSound } from "../services/sound";

export default function ThemeToggle() {
    const { theme, toggleTheme, isDark } = useTheme();

    const handleToggle = () => {
        playSound("tick");
        toggleTheme();
    };

    return (
        <button
            type="button"
            className={`theme-toggle-switch ${isDark ? "dark-active" : "light-active"}`}
            onClick={handleToggle}
            aria-label={`Switch to ${isDark ? "Light" : "Dark"} mode`}
            title={`Current: ${theme.toUpperCase()} mode. Click to toggle.`}
        >
            <span className="toggle-track">
                <span className="toggle-icon-sun">☀️</span>
                <span className="toggle-icon-moon">🌙</span>
                <span className="toggle-thumb">
                    {isDark ? "🌙" : "☀️"}
                </span>
            </span>
        </button>
    );
}
