import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from "./pages/Home";
import Quiz from './pages/Quiz';
import Result from "./pages/Result";
import Leaderboard from './pages/Leaderboard';
import WordPuzzle from './pages/WordPuzzle';
import AdminDashboard from './pages/AdminDashboard';
import UserProfile from './pages/UserProfile';
import Login from './pages/Login';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function PlayerRoute({ children }) {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }
  return children;
}

function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function AppContent() {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route
            path="/"
            element={
              <PlayerRoute>
                <Home />
              </PlayerRoute>
            }
          />
          <Route
            path="/quiz"
            element={
              <PlayerRoute>
                <Quiz />
              </PlayerRoute>
            }
          />
          <Route
            path="/word-puzzle"
            element={
              <PlayerRoute>
                <WordPuzzle />
              </PlayerRoute>
            }
          />
          <Route
            path="/result"
            element={
              <PlayerRoute>
                <Result />
              </PlayerRoute>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute>
                <Leaderboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/add-question"
            element={<Navigate to="/admin" replace />}
          />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
