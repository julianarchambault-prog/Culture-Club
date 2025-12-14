import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Beaker, FileText, ChefHat, Edit2, Check, X, Camera } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import ImageUpload from '../components/ImageUpload';

export default function Profile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', bio: '' });
  const [newProfilePic, setNewProfilePic] = useState([]);

  const isOwnProfile = !userId || userId === currentUser?.user_id;

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const targetUserId = userId || currentUser?.user_id;
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/users/${targetUserId}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setEditForm({ name: data.name, bio: data.bio || '' });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const updateData = { ...editForm };
      if (newProfilePic.length > 0) {
        updateData.picture = newProfilePic[0];
      }
      
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/users/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        toast.success('Profile updated!');
        setEditing(false);
        setNewProfilePic([]);
        fetchProfile();
      }
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-ferment-green"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Profile not found</p>
      </div>
    );
  }

  return (
    <div data-testid="profile-page" className="min-h-screen bg-cream dark:bg-charcoal p-6 sm:p-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-8 mb-8">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-shrink-0">
                {profile.picture ? (
                  <img
                    src={profile.picture}
                    alt={profile.name}
                    className="w-32 h-32 rounded-full border-4 border-ferment-green"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-ferment-green flex items-center justify-center text-white text-5xl font-serif font-semibold border-4 border-ferment-green">
                    {profile.name?.[0] || 'U'}
                  </div>
                )}
              </div>

              <div className="flex-1">
                {editing ? (
                  <div className="space-y-4">
                    <Input
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      placeholder="Name"
                      data-testid="edit-name-input"
                    />
                    <Textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      placeholder="Bio"
                      data-testid="edit-bio-input"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={handleUpdateProfile}
                        data-testid="save-profile-btn"
                        className="bg-ferment-green text-white"
                      >
                        <Check className="h-5 w-5 mr-2" />
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditing(false);
                          setEditForm({ name: profile.name, bio: profile.bio || '' });
                        }}
                        data-testid="cancel-edit-btn"
                      >
                        <X className="h-5 w-5 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h1 className="text-3xl md:text-4xl font-serif font-semibold mb-2">
                          {profile.name}
                        </h1>
                        <p className="text-muted-foreground">{profile.email}</p>
                      </div>
                      {isOwnProfile && (
                        <Button
                          variant="outline"
                          onClick={() => setEditing(true)}
                          data-testid="edit-profile-btn"
                        >
                          <Edit2 className="h-5 w-5 mr-2" />
                          Edit
                        </Button>
                      )}
                    </div>
                    {profile.bio && (
                      <p className="text-muted-foreground mb-6 leading-relaxed">{profile.bio}</p>
                    )}
                    {profile.is_premium && (
                      <span className="inline-block text-xs font-mono uppercase tracking-widest px-3 py-1 rounded-full bg-brine-gold/10 text-brine-gold">
                        Premium Member
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Card>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 text-center cursor-pointer hover:shadow-lg transition-all" onClick={() => navigate('/projects')}>
              <Beaker className="h-12 w-12 text-ferment-green mx-auto mb-4" />
              <p className="text-4xl font-bold text-ferment-green mb-2">{profile.stats?.projects || 0}</p>
              <p className="text-muted-foreground">Projects</p>
            </Card>
            <Card className="p-6 text-center cursor-pointer hover:shadow-lg transition-all" onClick={() => navigate('/feed')}>
              <FileText className="h-12 w-12 text-kimchi-red mx-auto mb-4" />
              <p className="text-4xl font-bold text-kimchi-red mb-2">{profile.stats?.posts || 0}</p>
              <p className="text-muted-foreground">Posts</p>
            </Card>
            <Card className="p-6 text-center cursor-pointer hover:shadow-lg transition-all" onClick={() => navigate('/recipes')}>
              <ChefHat className="h-12 w-12 text-brine-gold mx-auto mb-4" />
              <p className="text-4xl font-bold text-brine-gold mb-2">{profile.stats?.recipes || 0}</p>
              <p className="text-muted-foreground">Recipes</p>
            </Card>
          </div>

          <Card className="p-8">
            <h2 className="text-2xl font-serif mb-6">About</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Member Since</p>
                <p className="font-medium">{new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Email</p>
                <p className="font-medium">{profile.email}</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
