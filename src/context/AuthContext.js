import { createContext, useContext, useState, useEffect } from "react";
import { apiLogin, apiRegister } from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem("quiz_user");
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            localStorage.setItem("quiz_user", JSON.stringify(user));
        } else {
            localStorage.removeItem("quiz_user");
        }
    }, [user]);

    const login = async (identifier, password) => {
        setLoading(true);
        try {
            const res = await apiLogin({ identifier, password });
            setUser(res.user);
            return res.user;
        } finally {
            setLoading(false);
        }
    };

    const register = async (username, email, password) => {
        setLoading(true);
        try {
            const res = await apiRegister({ username, email, password });
            // Do not auto-login; user must log in with their credentials
            return res.user;
        } finally {
            setLoading(false);
        }
    };


    const logout = () => {
        setUser(null);
        localStorage.removeItem("quiz_user");
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                loading,
                login,
                register,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
