import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, Clock, Beaker } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import { Card } from '../components/ui/card';

export default function Projects() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState('timeline');
  const [newProject, setNewProject] = useState({
    name: '',
    fermentation_type: '',
    estimated_duration: 7,
    notes: ''
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/projects`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
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
        fetchProjects();
      }
    } catch (error) {
      toast.error('Failed to create project');
    }
  };

  const getDaysElapsed = (startDate) => {
    const start = new Date(startDate);
    const now = new Date();
    const diff = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getProgressPercentage = (startDate, duration) => {
    const elapsed = getDaysElapsed(startDate);
    return Math.min((elapsed / duration) * 100, 100);
  };

  const fermentationTypes = [
    'Lacto-Fermentation', 'Kimchi', 'Sauerkraut', 'Kombucha', 'Sourdough',
    'Miso', 'Vinegar', 'Wine', 'Beer', 'Other'
  ];

  const TimelineView = () => {
    const sortedProjects = [...projects].sort((a, b) => 
      new Date(a.start_date) - new Date(b.start_date)
    );

    return (
      <div className="space-y-8">
        {sortedProjects.map((project, index) => {
          const elapsed = getDaysElapsed(project.start_date);
          const progress = getProgressPercentage(project.start_date, project.estimated_duration);
          const isComplete = elapsed >= project.estimated_duration;

          return (
            <motion.div
              key={project.project_id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              <div className="flex gap-6">
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    isComplete ? 'bg-brine-gold' : 'bg-ferment-green'
                  } text-white font-bold text-lg shadow-lg`}>
                    {elapsed}
                  </div>
                  {index < sortedProjects.length - 1 && (
                    <div className="w-0.5 h-full bg-border mt-4"></div>
                  )}
                </div>

                <Card
                  onClick={() => navigate(`/projects/${project.project_id}`)}
                  className="flex-1 p-6 cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 border-border/50"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-serif font-semibold mb-2">{project.name}</h3>
                      <p className="text-sm text-muted-foreground">{project.fermentation_type}</p>
                    </div>
                    <span className={`text-xs font-mono uppercase tracking-widest px-3 py-1 rounded-full ${
                      isComplete ? 'bg-brine-gold/10 text-brine-gold' : 'bg-ferment-green/10 text-ferment-green'
                    }`}>
                      {isComplete ? 'Complete' : project.status}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Started {new Date(project.start_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Day {elapsed} of {project.estimated_duration}</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium">Progress</span>
                      <span className="text-muted-foreground">{Math.round(progress)}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className={`h-full ${
                          isComplete ? 'bg-brine-gold' : 'bg-ferment-green'
                        }`}
                      />
                    </div>
                  </div>

                  {project.notes && (
                    <p className="mt-4 text-sm text-muted-foreground line-clamp-2">{project.notes}</p>
                  )}
                </Card>
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  const GridView = () => (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project, index) => {
        const elapsed = getDaysElapsed(project.start_date);
        const progress = getProgressPercentage(project.start_date, project.estimated_duration);
        const isComplete = elapsed >= project.estimated_duration;

        return (
          <motion.div
            key={project.project_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              onClick={() => navigate(`/projects/${project.project_id}`)}
              data-testid={`project-card-${project.project_id}`}
              className="p-6 cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 border-border/50"
            >
              <div className="flex items-start justify-between mb-4">
                <Beaker className="h-10 w-10 text-ferment-green" />
                <span className={`text-xs font-mono uppercase tracking-widest px-3 py-1 rounded-full ${
                  isComplete ? 'bg-brine-gold/10 text-brine-gold' : 'bg-ferment-green/10 text-ferment-green'
                }`}>
                  {isComplete ? 'Complete' : project.status}
                </span>
              </div>

              <h3 className="text-xl font-serif font-semibold mb-2">{project.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{project.fermentation_type}</p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(project.start_date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Day {elapsed} of {project.estimated_duration}</span>
                </div>
              </div>

              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    isComplete ? 'bg-brine-gold' : 'bg-ferment-green'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-ferment-green"></div>
      </div>
    );
  }

  return (
    <div data-testid="projects-page" className="min-h-screen bg-cream dark:bg-charcoal p-6 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl md:text-6xl font-serif font-semibold text-foreground mb-4 tracking-tight">
              My Projects
            </h1>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              Track your fermentation timeline and progress
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant={viewMode === 'timeline' ? 'default' : 'outline'}
              onClick={() => setViewMode('timeline')}
              data-testid="timeline-view-btn"
              className={viewMode === 'timeline' ? 'bg-ferment-green text-white' : ''}
            >
              Timeline
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              onClick={() => setViewMode('grid')}
              data-testid="grid-view-btn"
              className={viewMode === 'grid' ? 'bg-ferment-green text-white' : ''}
            >
              Grid
            </Button>
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
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-24">
            <Beaker className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
            <h3 className="text-2xl font-serif mb-4">No projects yet</h3>
            <p className="text-muted-foreground mb-8">Start tracking your first fermentation project!</p>
            <Button
              onClick={() => setDialogOpen(true)}
              className="bg-ferment-green text-white hover:bg-ferment-green-dark rounded-full px-8 py-6"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Your First Project
            </Button>
          </div>
        ) : (
          <div>
            {viewMode === 'timeline' ? <TimelineView /> : <GridView />}
          </div>
        )}
      </div>
    </div>
  );
}
