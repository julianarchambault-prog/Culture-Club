import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, setIsAuthenticated } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processAuth = async () => {
      const hash = location.hash;
      const sessionIdMatch = hash.match(/session_id=([^&]+)/);
      
      if (!sessionIdMatch) {
        navigate('/login');
        return;
      }

      const sessionId = sessionIdMatch[1];

      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/session`, {
          method: 'POST',
          headers: {
            'X-Session-ID': sessionId
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Authentication failed');
        }

        const data = await response.json();
        setUser(data.user);
        setIsAuthenticated(true);
        navigate('/dashboard', { replace: true, state: { user: data.user } });
      } catch (error) {
        console.error('Auth error:', error);
        navigate('/login', { replace: true });
      }
    };

    processAuth();
  }, [location, navigate, setUser, setIsAuthenticated]);

  return (
    <div data-testid="auth-callback-loading" className="flex items-center justify-center min-h-screen bg-cream dark:bg-charcoal">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-ferment-green mx-auto mb-4"></div>
        <p className="text-foreground">Authenticating...</p>
      </div>
    </div>
  );
}
