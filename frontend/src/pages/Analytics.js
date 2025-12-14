import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Beaker, TrendingUp, Heart, MessageCircle, Award, Crown } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';

export default function Analytics() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/analytics`, {
        credentials: 'include'
      });
      
      if (response.status === 403) {
        setError('premium_required');
        setLoading(false);
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('fetch_error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-ferment-green"></div>
      </div>
    );
  }

  if (error === 'premium_required') {
    return (
      <div className="min-h-screen bg-cream dark:bg-charcoal p-6 sm:p-8">
        <div className="max-w-3xl mx-auto text-center py-24">
          <Crown className="h-24 w-24 text-brine-gold mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-serif font-semibold mb-4">
            Premium Feature
          </h1>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            Analytics dashboard is available for premium members. Upgrade to get insights about your fermentation journey!
          </p>
          <Button
            onClick={() => navigate('/pricing')}
            className="bg-ferment-green text-white hover:bg-ferment-green-dark rounded-full px-8 py-6"
          >
            <Crown className="h-5 w-5 mr-2" />
            Upgrade to Premium
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="analytics-page" className="min-h-screen bg-cream dark:bg-charcoal p-6 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <Crown className="h-8 w-8 text-brine-gold" />
            <h1 className="text-4xl md:text-6xl font-serif font-semibold text-foreground tracking-tight">
              Analytics Dashboard
            </h1>
          </div>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
            Track your fermentation success and community engagement
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Beaker className="h-10 w-10 text-ferment-green" />
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">Total Projects</p>
              <p className="text-4xl font-bold text-ferment-green">{analytics?.total_projects || 0}</p>
              <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Active</p>
                  <p className="font-semibold">{analytics?.active_projects || 0}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Complete</p>
                  <p className="font-semibold">{analytics?.completed_projects || 0}</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Heart className="h-10 w-10 text-kimchi-red" />
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">Total Engagement</p>
              <p className="text-4xl font-bold text-kimchi-red">
                {(analytics?.total_likes || 0) + (analytics?.total_comments || 0)}
              </p>
              <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Likes</p>
                  <p className="font-semibold">{analytics?.total_likes || 0}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Comments</p>
                  <p className="font-semibold">{analytics?.total_comments || 0}</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <MessageCircle className="h-10 w-10 text-brine-gold" />
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">Community Posts</p>
              <p className="text-4xl font-bold text-brine-gold">{analytics?.total_posts || 0}</p>
              <div className="mt-4 pt-4 border-t border-border/50 text-sm">
                <p className="text-muted-foreground">Engagement Rate</p>
                <p className="font-semibold">{analytics?.engagement_rate || 0}x per post</p>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Award className="h-10 w-10 text-ferment-green" />
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">Recipes Shared</p>
              <p className="text-4xl font-bold text-ferment-green">{analytics?.total_recipes || 0}</p>
              <div className="mt-4 pt-4 border-t border-border/50 text-sm">
                <p className="text-muted-foreground">Avg Duration</p>
                <p className="font-semibold">{analytics?.avg_project_duration || 0} days</p>
              </div>
            </Card>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-8">
              <h2 className="text-2xl font-serif mb-6">Fermentation Types</h2>
              {analytics?.fermentation_types && Object.keys(analytics.fermentation_types).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(analytics.fermentation_types)
                    .sort(([, a], [, b]) => b - a)
                    .map(([type, count]) => {
                      const maxCount = Math.max(...Object.values(analytics.fermentation_types));
                      const percentage = (count / maxCount) * 100;
                      return (
                        <div key={type}>
                          <div className="flex justify-between mb-2">
                            <span className="font-medium">{type}</span>
                            <span className="text-muted-foreground">{count}</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-ferment-green transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <p className="text-muted-foreground">No fermentation data yet</p>
              )}
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="p-8">
              <h2 className="text-2xl font-serif mb-6">Quick Stats</h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                    <p className="text-2xl font-bold">
                      {analytics?.total_projects > 0
                        ? Math.round((analytics.completed_projects / analytics.total_projects) * 100)
                        : 0}%
                    </p>
                  </div>
                  <Award className="h-12 w-12 text-brine-gold" />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Community Impact</p>
                    <p className="text-2xl font-bold">
                      {(analytics?.total_likes || 0) + (analytics?.total_comments || 0)}
                    </p>
                  </div>
                  <Heart className="h-12 w-12 text-kimchi-red" />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Project Duration</p>
                    <p className="text-2xl font-bold">{analytics?.avg_project_duration || 0} days</p>
                  </div>
                  <Beaker className="h-12 w-12 text-ferment-green" />
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
