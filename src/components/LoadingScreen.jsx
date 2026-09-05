import { useState, useEffect } from "react";

const TRIVIA_FACTS = [
    "Did you know? The shortest war in history lasted only 38 minutes between Britain and Zanzibar.",
    "Did you know? Octopuses have three hearts and blue blood.",
    "Did you know? Honey never spoils — archaeologists have found 3,000-year-old edible honey!",
    "Did you know? A single day on Venus is longer than a whole Venusian year.",
    "Did you know? JavaScript was created in just 10 days by Brendan Eich in 1995.",
    "Did you know? Light from the Sun takes approximately 8 minutes and 20 seconds to reach Earth."
];

export default function LoadingScreen({ message = "Loading quiz challenge..." }) {
    const [factIndex, setFactIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setFactIndex((prev) => (prev + 1) % TRIVIA_FACTS.length);
        }, 2800);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="branded-loading-wrapper">
            <div className="loading-logo-container">
                <div className="logo-sparkle-halo"></div>
                <div className="loading-logo-badge">🧠</div>
            </div>

            <h3 className="loading-title">{message}</h3>

            <div className="loading-progress-track">
                <div className="loading-progress-shimmer"></div>
            </div>

            <div className="loading-trivia-card">
                <span className="trivia-icon">💡</span>
                <p className="trivia-text" key={factIndex}>
                    {TRIVIA_FACTS[factIndex]}
                </p>
            </div>
        </div>
    );
}
