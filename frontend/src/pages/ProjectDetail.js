import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, Edit, Trash2, Bell, Camera } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { toast } from 'sonner';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import ImageUpload from '../components/ImageUpload';

export default function ProjectDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newReminder, setNewReminder] = useState({
    reminder_type: 'stir',
    scheduled_time: ''
  });

  useEffect(() => {
    fetchProjectData();
  }, [projectId]);

  const fetchProjectData = async () => {
    try {
      const [projectRes, remindersRes] = await Promise.all([
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/projects/${projectId}`, {
          credentials: 'include'
        }),
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/reminders?project_id=${projectId}`, {
          credentials: 'include'
        })
      ]);

      if (projectRes.ok) {
        const projectData = await projectRes.json();
        setProject(projectData);
        setNotes(projectData.notes || '');
      }
      if (remindersRes.ok) {
        const remindersData = await remindersRes.json();
        setReminders(remindersData);
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      toast.error('Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateNotes = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ notes })
      });

      if (response.ok) {
        toast.success('Notes updated!');
        fetchProjectData();
      }
    } catch (error) {
      toast.error('Failed to update notes');
    }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/projects/${projectId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        toast.success('Project deleted');
        navigate('/projects');
      }
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  const handleCreateReminder = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/reminders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          project_id: projectId,
          ...newReminder
        })
      });

      if (response.ok) {
        toast.success('Reminder created!');
        setDialogOpen(false);
        setNewReminder({ reminder_type: 'stir', scheduled_time: '' });
        fetchProjectData();
      }
    } catch (error) {
      toast.error('Failed to create reminder');
    }
  };

  const getDaysElapsed = (startDate) => {
    const start = new Date(startDate);
    const now = new Date();
    return Math.floor((now - start) / (1000 * 60 * 60 * 24));
  };

  const getProgressPercentage = (startDate, duration) => {
    const elapsed = getDaysElapsed(startDate);
    return Math.min((elapsed / duration) * 100, 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-ferment-green"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Project not found</p>
      </div>
    );
  }

  const elapsed = getDaysElapsed(project.start_date);
  const progress = getProgressPercentage(project.start_date, project.estimated_duration);
  const isComplete = elapsed >= project.estimated_duration;

  return (
    <div data-testid="project-detail" className="min-h-screen bg-cream dark:bg-charcoal p-6 sm:p-8">
      <div className="max-w-5xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/projects')}
          className="mb-6"
          data-testid="back-btn"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Projects
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-8 mb-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-serif font-semibold mb-2">
                  {project.name}
                </h1>
                <p className="text-lg text-muted-foreground">{project.fermentation_type}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" data-testid="edit-btn">
                  <Edit className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleDeleteProject}
                  data-testid="delete-btn"
                  className="text-destructive hover:bg-destructive hover:text-white"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-ferment-green" />
                <div>
                  <p className="text-sm text-muted-foreground">Started</p>
                  <p className="font-medium">{new Date(project.start_date).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-ferment-green" />
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-medium">Day {elapsed} of {project.estimated_duration}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  isComplete ? 'bg-brine-gold' : 'bg-ferment-green'
                } animate-pulse`}></div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-medium capitalize">{isComplete ? 'Complete' : project.status}</p>
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Progress</span>
                <span className="text-muted-foreground">{Math.round(progress)}%</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
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
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-8">
              <h2 className="text-2xl font-serif mb-4">Notes</h2>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about your fermentation process..."
                rows={8}
                className="mb-4"
              />
              <Button
                onClick={handleUpdateNotes}
                className="bg-ferment-green text-white hover:bg-ferment-green-dark"
              >
                Save Notes
              </Button>
            </Card>

            <Card className="p-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-serif">Reminders</h2>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-ferment-green text-white">
                      <Bell className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-serif">Create Reminder</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateReminder} className="space-y-6">
                      <div>
                        <Label>Type</Label>
                        <Select
                          value={newReminder.reminder_type}
                          onValueChange={(value) => setNewReminder({ ...newReminder, reminder_type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="stir">Stir</SelectItem>
                            <SelectItem value="check">Check</SelectItem>
                            <SelectItem value="smell">Smell</SelectItem>
                            <SelectItem value="taste">Taste</SelectItem>
                            <SelectItem value="adjust">Adjust</SelectItem>
                            <SelectItem value="complete">Complete</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Scheduled Time</Label>
                        <input
                          type="datetime-local"
                          value={newReminder.scheduled_time}
                          onChange={(e) => setNewReminder({ ...newReminder, scheduled_time: e.target.value })}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full bg-ferment-green text-white">
                        Create Reminder
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {reminders.length === 0 ? (
                <p className="text-muted-foreground text-sm">No reminders set</p>
              ) : (
                <div className="space-y-3">
                  {reminders.map((reminder) => (
                    <div
                      key={reminder.reminder_id}
                      className="flex items-center justify-between p-4 border border-border/50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium capitalize">{reminder.reminder_type}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(reminder.scheduled_time).toLocaleString()}
                        </p>
                      </div>
                      {reminder.is_completed && (
                        <span className="text-xs bg-brine-gold/10 text-brine-gold px-2 py-1 rounded-full">
                          Completed
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
