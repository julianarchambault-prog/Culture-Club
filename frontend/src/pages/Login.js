import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Beaker } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { isAuthenticated, loading, checkAuth, setUser, setIsAuthenticated } = useAuth();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = () => {
    const redirectUrl = window.location.origin + '/dashboard';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const handleDemoLogin = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/demo-login`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsAuthenticated(true);
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Demo login error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-cream dark:bg-charcoal">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-ferment-green"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream dark:bg-charcoal flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Beaker className="h-16 w-16 text-ferment-green mx-auto mb-6" />
          <h1 className="text-4xl md:text-6xl font-serif font-semibold text-foreground mb-4 tracking-tight">
            Culture Club
          </h1>
          <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
            Sign in to track your fermentation journey
          </p>
        </div>

        <div className="bg-card rounded-xl border border-border/50 p-8 shadow-sm space-y-4">
          <Button
            data-testid="login-btn"
            onClick={handleLogin}
            className="w-full bg-ferment-green text-white hover:bg-ferment-green-dark rounded-full px-8 py-6 font-semibold shadow-lg hover:shadow-xl transition-all active:scale-95"
          >
            Sign in with Google
          </Button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or for testing</span>
            </div>
          </div>
          
          <Button
            data-testid="demo-login-btn"
            onClick={handleDemoLogin}
            variant="outline"
            className="w-full rounded-full px-8 py-6 font-semibold"
          >
            Demo Login (Test Account)
          </Button>
        </div>
      </div>
    </div>
  );
}
