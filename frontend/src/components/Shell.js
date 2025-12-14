import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Home, Beaker, Users, BookOpen, User, LogOut, Moon, Sun, Menu, X, Crown, TrendingUp } from 'lucide-react';
import { Button } from './ui/button';

export default function Shell({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const baseNavItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Beaker, label: 'Projects', path: '/projects' },
    { icon: Users, label: 'Community', path: '/feed' },
    { icon: BookOpen, label: 'Recipes', path: '/recipes' },
    { icon: User, label: 'Profile', path: '/profile' }
  ];

  const navItems = subscriptionStatus?.is_premium 
    ? [...baseNavItems, { icon: TrendingUp, label: 'Analytics', path: '/analytics' }]
    : baseNavItems;

  const [subscriptionStatus, setSubscriptionStatus] = useState(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/subscription/status`, {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          setSubscriptionStatus(data);
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
      }
    };
    fetchSubscription();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-cream dark:bg-charcoal">
      <nav className="bg-white/80 dark:bg-card/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <button
                onClick={() => navigate('/dashboard')}
                data-testid="nav-logo"
                className="text-2xl font-serif font-semibold text-ferment-green hover:opacity-80 transition-opacity"
              >
                Culture Club
              </button>

              <div className="hidden md:flex items-center gap-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  const isPremiumFeature = item.label === 'Analytics';
                  return (
                    <button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      data-testid={`nav-${item.label.toLowerCase()}`}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                        isActive
                          ? 'bg-ferment-green text-white'
                          : isPremiumFeature
                          ? 'text-brine-gold hover:bg-brine-gold/10 border border-brine-gold/30'
                          : 'text-foreground hover:bg-muted'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-sm font-medium">{item.label}</span>
                      {isPremiumFeature && (
                        <Crown className="h-3 w-3" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                data-testid="theme-toggle"
                className="p-2 rounded-full hover:bg-muted transition-colors"
              >
                {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </button>

              <div className="hidden md:flex items-center gap-3">
                {subscriptionStatus?.is_premium ? (
                  <Button
                    onClick={() => navigate('/analytics')}
                    variant="ghost"
                    size="sm"
                    className="text-brine-gold hover:text-brine-gold"
                    data-testid="nav-analytics"
                  >
                    <TrendingUp className="h-4 w-4 mr-1" />
                    Analytics
                  </Button>
                ) : (
                  <Button
                    onClick={() => navigate('/pricing')}
                    variant="ghost"
                    size="sm"
                    className="text-brine-gold hover:text-brine-gold"
                    data-testid="nav-upgrade"
                  >
                    <Crown className="h-4 w-4 mr-1" />
                    Upgrade
                  </Button>
                )}
                {user?.picture ? (
                  <img src={user.picture} alt="" className="h-8 w-8 rounded-full" />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-ferment-green flex items-center justify-center text-white font-semibold text-sm">
                    {user?.name?.[0] || 'U'}
                  </div>
                )}
                <span className="text-sm font-medium">{user?.name || 'User'}</span>
                <Button
                  onClick={handleLogout}
                  data-testid="nav-logout"
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                data-testid="mobile-menu-btn"
                className="md:hidden p-2 rounded-full hover:bg-muted transition-colors"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden pb-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-ferment-green text-white'
                        : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                );
              })}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted transition-all"
              >
                <LogOut className="h-5 w-5" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          )}
        </div>
      </nav>

      <main>{children}</main>
    </div>
  );
}
