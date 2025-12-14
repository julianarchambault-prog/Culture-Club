import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, checkAuth } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!location.state?.user && isAuthenticated === null) {
      checkAuth();
    }
  }, [location, isAuthenticated, checkAuth]);

  if (location.state?.user) {
    return children;
  }

  if (loading || isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-cream dark:bg-charcoal">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-ferment-green"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
