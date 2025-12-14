import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Toaster } from './components/ui/sonner';
import AuthCallback from './components/AuthCallback';
import ProtectedRoute from './components/ProtectedRoute';
import Shell from './components/Shell';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Feed from './pages/Feed';
import Recipes from './pages/Recipes';
import Profile from './pages/Profile';
import Pricing from './pages/Pricing';
import Analytics from './pages/Analytics';
import './App.css';

function AppRouter() {
  const location = useLocation();

  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Shell>
              <Dashboard />
            </Shell>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <Shell>
              <Projects />
            </Shell>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/projects/:projectId"
        element={
          <ProtectedRoute>
            <Shell>
              <ProjectDetail />
            </Shell>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/feed"
        element={
          <ProtectedRoute>
            <Shell>
              <Feed />
            </Shell>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/recipes"
        element={
          <ProtectedRoute>
            <Shell>
              <Recipes />
            </Shell>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Shell>
              <Profile />
            </Shell>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/profile/:userId"
        element={
          <ProtectedRoute>
            <Shell>
              <Profile />
            </Shell>
          </ProtectedRoute>
        }
      />
      
      <Route path="*" element={<Landing />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRouter />
          <Toaster position="top-right" />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
