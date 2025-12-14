import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Beaker, Users, BookOpen } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import NotificationSetup from '../components/NotificationSetup';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    fermentation_type: '',
    estimated_duration: 7,
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [projectsRes, postsRes] = await Promise.all([
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/projects`, {
          credentials: 'include'
        }),
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/feed?limit=5`, {
          credentials: 'include'
        })
      ]);

      if (projectsRes.ok) {
        const projectsData = await projectsRes.json();
        setProjects(projectsData);
      }
      if (postsRes.ok) {
        const postsData = await postsRes.json();
        setRecentPosts(postsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...newProject,
          start_date: new Date().toISOString()
        })
      });

      if (response.ok) {
        toast.success('Project created successfully!');
        setDialogOpen(false);
        setNewProject({ name: '', fermentation_type: '', estimated_duration: 7, notes: '' });
        fetchData();
      }
    } catch (error) {
      toast.error('Failed to create project');
    }
  };

  const fermentationTypes = [
    'Lacto-Fermentation',
    'Kimchi',
    'Sauerkraut',
    'Kombucha',
    'Sourdough',
    'Miso',
    'Vinegar',
    'Wine',
    'Beer',
    'Other'
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-ferment-green"></div>
      </div>
    );
  }

  return (
    <div data-testid="dashboard" className="min-h-screen bg-cream dark:bg-charcoal p-6 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-serif font-semibold text-foreground mb-4 tracking-tight">
            Welcome back, {user?.name || 'Fermenter'}
          </h1>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
            Track your projects and connect with the community
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onClick={() => navigate('/projects')}
            data-testid="dashboard-projects-card"
            className="bg-card rounded-xl border border-border/50 p-8 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer hover:-translate-y-1"
          >
            <Beaker className="h-12 w-12 text-ferment-green mb-4" />
            <h3 className="text-2xl font-serif mb-2">Projects</h3>
            <p className="text-4xl font-bold text-ferment-green">{projects.length}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => navigate('/feed')}
            className="bg-card rounded-xl border border-border/50 p-8 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer hover:-translate-y-1"
          >
            <Users className="h-12 w-12 text-kimchi-red mb-4" />
            <h3 className="text-2xl font-serif mb-2">Community</h3>
            <p className="text-4xl font-bold text-kimchi-red">{recentPosts.length}+ Posts</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onClick={() => navigate('/recipes')}
            className="bg-card rounded-xl border border-border/50 p-8 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer hover:-translate-y-1"
          >
            <BookOpen className="h-12 w-12 text-brine-gold mb-4" />
            <h3 className="text-2xl font-serif mb-2">Recipes</h3>
            <p className="text-sm text-muted-foreground">Explore library</p>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card rounded-xl border border-border/50 p-8 shadow-sm"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-serif">Active Projects</h2>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="create-project-btn" className="bg-ferment-green text-white hover:bg-ferment-green-dark rounded-full">
                    <Plus className="h-5 w-5 mr-2" />
                    New Project
                  </Button>
                </DialogTrigger>
                <DialogContent data-testid="create-project-dialog">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-serif">Create New Project</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateProject} className="space-y-6">
                    <div>
                      <Label htmlFor="name">Project Name</Label>
                      <Input
                        id="name"
                        data-testid="project-name-input"
                        value={newProject.name}
                        onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                        placeholder="e.g., Spring Kimchi Batch"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="type">Fermentation Type</Label>
                      <Select
                        value={newProject.fermentation_type}
                        onValueChange={(value) => setNewProject({ ...newProject, fermentation_type: value })}
                      >
                        <SelectTrigger data-testid="fermentation-type-select">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {fermentationTypes.map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="duration">Estimated Duration (days)</Label>
                      <Input
                        id="duration"
                        type="number"
                        value={newProject.estimated_duration}
                        onChange={(e) => setNewProject({ ...newProject, estimated_duration: parseInt(e.target.value) })}
                        min="1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        value={newProject.notes}
                        onChange={(e) => setNewProject({ ...newProject, notes: e.target.value })}
                        placeholder="Add any initial notes..."
                      />
                    </div>
                    <Button data-testid="submit-project-btn" type="submit" className="w-full bg-ferment-green text-white hover:bg-ferment-green-dark">
                      Create Project
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {projects.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No projects yet</p>
                <p className="text-sm text-muted-foreground">Create your first fermentation project!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.slice(0, 3).map((project) => (
                  <div
                    key={project.project_id}
                    data-testid={`project-card-${project.project_id}`}
                    onClick={() => navigate(`/projects/${project.project_id}`)}
                    className="border border-border/50 rounded-lg p-6 hover:border-ferment-green transition-all cursor-pointer"
                  >
                    <h4 className="font-semibold text-lg mb-2">{project.name}</h4>
                    <p className="text-sm text-muted-foreground">{project.fermentation_type}</p>
                    <div className="mt-4 flex items-center gap-2">
                      <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                        {project.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-card rounded-xl border border-border/50 p-8 shadow-sm"
          >
            <h2 className="text-3xl font-serif mb-6">Community Feed</h2>
            {recentPosts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No posts yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentPosts.map((post) => (
                  <div
                    key={post.post_id}
                    data-testid={`post-card-${post.post_id}`}
                    className="border border-border/50 rounded-lg p-6 hover:border-kimchi-red transition-all"
                  >
                    <div className="flex items-start gap-4 mb-3">
                      {post.user?.picture ? (
                        <img src={post.user.picture} alt="" className="h-10 w-10 rounded-full" />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-ferment-green flex items-center justify-center text-white font-semibold">
                          {post.user?.name?.[0] || 'U'}
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-semibold">{post.user?.name || 'Unknown'}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">{post.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
