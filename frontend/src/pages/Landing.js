import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Beaker, Users, BookOpen, Bell } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function Landing() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Beaker,
      title: 'Track Projects',
      description: 'Never forget to stir, taste, or check your ferments with smart reminders'
    },
    {
      icon: Users,
      title: 'Join Community',
      description: 'Connect with fermentation enthusiasts worldwide and share your experiments'
    },
    {
      icon: BookOpen,
      title: 'Recipe Library',
      description: 'Access and contribute to a growing collection of fermentation recipes'
    },
    {
      icon: Bell,
      title: 'Smart Reminders',
      description: 'Timeline-based notifications keep your fermentation on track'
    }
  ];

  const handleLogin = () => {
    const redirectUrl = window.location.origin + '/dashboard';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div className="min-h-screen bg-cream dark:bg-charcoal">
      <div 
        className="relative overflow-hidden"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1765454195979-812683c802aa?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwxfHxmZXJtZW50YXRpb24lMjBqYXJzJTIwZ2xhc3MlMjB2ZWdldGFibGVzJTIwa2l0Y2hlbnxlbnwwfHx8fDE3NjU3MTcwNjV8MA&ixlib=rb-4.1.0&q=85')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-ferment-green/90 to-ferment-green/70"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-32 sm:py-40">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-serif font-semibold text-white mb-6 tracking-tight">
              Welcome to Culture Club
            </h1>
            <p className="text-base md:text-lg text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed">
              Track your fermentation projects, connect with a global community, and never miss a stir again.
            </p>
            <Button
              data-testid="landing-login-btn"
              onClick={handleLogin}
              className="bg-white text-ferment-green hover:bg-gray-100 rounded-full px-8 py-6 font-semibold shadow-lg hover:shadow-xl transition-all active:scale-95"
            >
              Get Started
            </Button>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
                className="bg-card rounded-xl border border-border/50 p-8 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
              >
                <Icon className="h-12 w-12 text-ferment-green mb-6" />
                <h3 className="text-2xl md:text-3xl font-serif mb-4">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
