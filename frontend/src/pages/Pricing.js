import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Check, X, Crown, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { toast } from 'sonner';
import PayPalButton from '../components/PayPalButton';

export default function Pricing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptionStatus();
  }, []);

  const fetchSubscriptionStatus = async () => {
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
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = () => {
    toast.info('PayPal integration coming soon! This will enable monthly subscriptions.');
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription? You\'ll retain access until the end of your billing period.')) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/subscription/cancel`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        toast.success('Subscription cancelled successfully');
        fetchSubscriptionStatus();
      }
    } catch (error) {
      toast.error('Failed to cancel subscription');
    }
  };

  const freeTierFeatures = [
    { included: true, text: 'Up to 3 active projects' },
    { included: true, text: '2 posts per month' },
    { included: true, text: 'View recipes' },
    { included: true, text: 'Basic profile' },
    { included: false, text: 'Unlimited projects' },
    { included: false, text: 'Unlimited posts' },
    { included: false, text: 'Submit recipes' },
    { included: false, text: 'Smart reminders' },
    { included: false, text: 'Analytics dashboard' }
  ];

  const premiumFeatures = [
    { included: true, text: 'Unlimited projects' },
    { included: true, text: 'Unlimited posts' },
    { included: true, text: 'Submit recipes' },
    { included: true, text: 'Smart reminders' },
    { included: true, text: 'Analytics dashboard' },
    { included: true, text: 'Priority support' },
    { included: true, text: 'Ad-free experience' },
    { included: true, text: 'Early access to features' },
    { included: true, text: 'Premium badge' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-ferment-green"></div>
      </div>
    );
  }

  return (
    <div data-testid="pricing-page" className="min-h-screen bg-cream dark:bg-charcoal p-6 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-serif font-semibold text-foreground mb-4 tracking-tight">
            Choose Your Plan
          </h1>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
            Start for free, upgrade when you're ready
          </p>
        </motion.div>

        {subscriptionStatus?.is_premium && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 bg-brine-gold/10 border border-brine-gold/30 rounded-xl"
          >
            <div className="flex items-center gap-3 mb-2">
              <Crown className="h-6 w-6 text-brine-gold" />
              <h3 className="text-xl font-serif font-semibold">You're on Premium!</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Status: {subscriptionStatus.status === 'active' ? 'Active' : 'Cancelled'}
              {subscriptionStatus.expires_at && (
                <> • Renews: {new Date(subscriptionStatus.expires_at).toLocaleDateString()}</>
              )}
            </p>
            {subscriptionStatus.status === 'active' && (
              <Button
                variant="outline"
                onClick={handleCancelSubscription}
                className="text-destructive border-destructive hover:bg-destructive hover:text-white"
              >
                Cancel Subscription
              </Button>
            )}
          </motion.div>
        )}

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-8 h-full flex flex-col border-border/50">
              <div className="mb-6">
                <h2 className="text-3xl font-serif font-semibold mb-2">Free</h2>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold">$0</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </div>

              <div className="flex-1 space-y-4 mb-8">
                {freeTierFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    {feature.included ? (
                      <Check className="h-5 w-5 text-ferment-green flex-shrink-0 mt-0.5" />
                    ) : (
                      <X className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    )}
                    <span className={feature.included ? '' : 'text-muted-foreground'}>
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>

              <Button
                disabled={!subscriptionStatus?.is_premium}
                variant="outline"
                className="w-full"
              >
                Current Plan
              </Button>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-8 h-full flex flex-col border-2 border-ferment-green relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <div className="bg-ferment-green text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  POPULAR
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-3xl font-serif font-semibold mb-2 flex items-center gap-2">
                  Premium
                  <Crown className="h-6 w-6 text-brine-gold" />
                </h2>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold">$9.99</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </div>

              <div className="flex-1 space-y-4 mb-8">
                {premiumFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-ferment-green flex-shrink-0 mt-0.5" />
                    <span>{feature.text}</span>
                  </div>
                ))}
              </div>

              {subscriptionStatus?.is_premium ? (
                <Button
                  disabled
                  className="w-full bg-ferment-green text-white"
                >
                  Current Plan
                </Button>
              ) : (
                <Button
                  onClick={handleSubscribe}
                  data-testid="subscribe-btn"
                  className="w-full bg-ferment-green text-white hover:bg-ferment-green-dark"
                >
                  Upgrade to Premium
                </Button>
              )}
            </Card>
          </motion.div>
        </div>

        {subscriptionStatus && !subscriptionStatus.is_premium && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 p-6 bg-card rounded-xl border border-border/50 max-w-3xl mx-auto"
          >
            <h3 className="text-xl font-serif font-semibold mb-4">Your Current Usage</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Active Projects</p>
                <p className="text-2xl font-bold">
                  {subscriptionStatus.active_projects} / {subscriptionStatus.project_limit}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Posts Remaining This Month</p>
                <p className="text-2xl font-bold">
                  {subscriptionStatus.posts_remaining !== null ? subscriptionStatus.posts_remaining : '∞'}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
