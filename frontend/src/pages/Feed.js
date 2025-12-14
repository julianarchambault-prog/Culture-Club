import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Heart, MessageCircle, Share2, Send, Camera } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import ImageUpload from '../components/ImageUpload';

export default function Feed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/feed?limit=50`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          content: newPost,
          youtube_url: youtubeUrl || null,
          tags: []
        })
      });

      if (response.ok) {
        toast.success('Post created!');
        setNewPost('');
        setYoutubeUrl('');
        fetchPosts();
      }
    } catch (error) {
      toast.error('Failed to create post');
    }
  };

  const handleLikePost = async (postId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/posts/${postId}/like`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        fetchPosts();
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleOpenComments = async (post) => {
    setSelectedPost(post);
    setDialogOpen(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/posts/${post.post_id}/comments`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedPost) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/posts/${selectedPost.post_id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content: newComment })
      });

      if (response.ok) {
        setNewComment('');
        handleOpenComments(selectedPost);
        fetchPosts();
      }
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  const getYoutubeEmbedUrl = (url) => {
    if (!url) return null;
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    return videoId ? `https://www.youtube.com/embed/${videoId[1]}` : null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-ferment-green"></div>
      </div>
    );
  }

  return (
    <div data-testid="feed-page" className="min-h-screen bg-cream dark:bg-charcoal p-6 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-6xl font-serif font-semibold text-foreground mb-4 tracking-tight">
            Community Feed
          </h1>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
            Share your fermentation journey with the world
          </p>
        </motion.div>

        <Card className="p-6 mb-8">
          <form onSubmit={handleCreatePost} className="space-y-4">
            <div className="flex gap-3">
              {user?.picture ? (
                <img src={user.picture} alt="" className="h-12 w-12 rounded-full" />
              ) : (
                <div className="h-12 w-12 rounded-full bg-ferment-green flex items-center justify-center text-white font-semibold">
                  {user?.name?.[0] || 'U'}
                </div>
              )}
              <Textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="Share your fermentation experience..."
                data-testid="new-post-input"
                rows={3}
                className="flex-1"
              />
            </div>
            <div>
              <Input
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="YouTube URL (optional)"
                data-testid="youtube-url-input"
              />
            </div>
            <Button
              type="submit"
              data-testid="submit-post-btn"
              className="bg-ferment-green text-white hover:bg-ferment-green-dark rounded-full"
            >
              <Send className="h-5 w-5 mr-2" />
              Post
            </Button>
          </form>
        </Card>

        <div className="space-y-6">
          {posts.map((post, index) => {
            const embedUrl = getYoutubeEmbedUrl(post.youtube_url);
            return (
              <motion.div
                key={post.post_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card data-testid={`post-${post.post_id}`} className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    {post.user?.picture ? (
                      <img src={post.user.picture} alt="" className="h-12 w-12 rounded-full" />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-ferment-green flex items-center justify-center text-white font-semibold">
                        {post.user?.name?.[0] || 'U'}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-semibold">{post.user?.name || 'Unknown'}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(post.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <p className="mb-4 whitespace-pre-wrap">{post.content}</p>

                  {embedUrl && (
                    <div className="mb-4 rounded-lg overflow-hidden">
                      <iframe
                        src={embedUrl}
                        title="YouTube video"
                        className="w-full aspect-video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-6 pt-4 border-t border-border/50">
                    <button
                      onClick={() => handleLikePost(post.post_id)}
                      data-testid={`like-btn-${post.post_id}`}
                      className="flex items-center gap-2 text-muted-foreground hover:text-kimchi-red transition-colors"
                    >
                      <Heart className={`h-5 w-5 ${post.is_liked ? 'fill-kimchi-red text-kimchi-red' : ''}`} />
                      <span>{post.likes_count}</span>
                    </button>
                    <button
                      onClick={() => handleOpenComments(post)}
                      data-testid={`comment-btn-${post.post_id}`}
                      className="flex items-center gap-2 text-muted-foreground hover:text-ferment-green transition-colors"
                    >
                      <MessageCircle className="h-5 w-5" />
                      <span>{post.comments_count}</span>
                    </button>
                    <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                      <Share2 className="h-5 w-5" />
                    </button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-serif">Comments</DialogTitle>
            </DialogHeader>
            {selectedPost && (
              <div>
                <div className="mb-6 pb-6 border-b border-border/50">
                  <div className="flex items-start gap-4 mb-4">
                    {selectedPost.user?.picture ? (
                      <img src={selectedPost.user.picture} alt="" className="h-10 w-10 rounded-full" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-ferment-green flex items-center justify-center text-white font-semibold text-sm">
                        {selectedPost.user?.name?.[0] || 'U'}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold">{selectedPost.user?.name || 'Unknown'}</p>
                      <p className="text-sm text-muted-foreground mt-1">{selectedPost.content}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 mb-6 min-h-[100px]">
                  {comments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">No comments yet. Be the first to comment!</p>
                    </div>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.comment_id} className="flex items-start gap-3 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                        {comment.user?.picture ? (
                          <img src={comment.user.picture} alt="" className="h-8 w-8 rounded-full" />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-ferment-green flex items-center justify-center text-white font-semibold text-xs">
                            {comment.user?.name?.[0] || 'U'}
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-sm">{comment.user?.name || 'Unknown'}</p>
                            <span className="text-xs text-muted-foreground">
                              {new Date(comment.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm">{comment.content}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleAddComment} className="flex gap-3">
                  <Input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    data-testid="comment-input"
                  />
                  <Button type="submit" data-testid="submit-comment-btn" className="bg-ferment-green text-white">
                    <Send className="h-5 w-5" />
                  </Button>
                </form>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
