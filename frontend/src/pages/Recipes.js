import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Plus, ChefHat, Search } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { toast } from 'sonner';

export default function Recipes() {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [newRecipe, setNewRecipe] = useState({
    title: '',
    description: '',
    recipe_type: 'fermentation',
    ingredients: [''],
    instructions: [''],
    tags: ''
  });

  useEffect(() => {
    fetchRecipes();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = recipes.filter(recipe => 
        recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredRecipes(filtered);
    } else {
      setFilteredRecipes(recipes);
    }
  }, [searchQuery, recipes]);

  const fetchRecipes = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/recipes?limit=100`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setRecipes(data);
        setFilteredRecipes(data);
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRecipe = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/recipes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...newRecipe,
          ingredients: newRecipe.ingredients.filter(i => i.trim()),
          instructions: newRecipe.instructions.filter(i => i.trim()),
          tags: newRecipe.tags.split(',').map(t => t.trim()).filter(t => t)
        })
      });

      if (response.ok) {
        toast.success('Recipe created!');
        setDialogOpen(false);
        setNewRecipe({
          title: '',
          description: '',
          recipe_type: 'fermentation',
          ingredients: [''],
          instructions: [''],
          tags: ''
        });
        fetchRecipes();
      }
    } catch (error) {
      toast.error('Failed to create recipe');
    }
  };

  const addIngredient = () => {
    setNewRecipe({ ...newRecipe, ingredients: [...newRecipe.ingredients, ''] });
  };

  const addInstruction = () => {
    setNewRecipe({ ...newRecipe, instructions: [...newRecipe.instructions, ''] });
  };

  const updateIngredient = (index, value) => {
    const updated = [...newRecipe.ingredients];
    updated[index] = value;
    setNewRecipe({ ...newRecipe, ingredients: updated });
  };

  const updateInstruction = (index, value) => {
    const updated = [...newRecipe.instructions];
    updated[index] = value;
    setNewRecipe({ ...newRecipe, instructions: updated });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-ferment-green"></div>
      </div>
    );
  }

  return (
    <div data-testid="recipes-page" className="min-h-screen bg-cream dark:bg-charcoal p-6 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl md:text-6xl font-serif font-semibold text-foreground mb-4 tracking-tight">
              Recipe Library
            </h1>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              Discover and share fermentation recipes
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="create-recipe-btn" className="bg-ferment-green text-white hover:bg-ferment-green-dark rounded-full">
                <Plus className="h-5 w-5 mr-2" />
                New Recipe
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-serif">Create New Recipe</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateRecipe} className="space-y-6">
                <div>
                  <Label htmlFor="title">Recipe Title</Label>
                  <Input
                    id="title"
                    value={newRecipe.title}
                    onChange={(e) => setNewRecipe({ ...newRecipe, title: e.target.value })}
                    placeholder="e.g., Traditional Kimchi"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="type">Recipe Type</Label>
                  <Select
                    value={newRecipe.recipe_type}
                    onValueChange={(value) => setNewRecipe({ ...newRecipe, recipe_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fermentation">Fermentation</SelectItem>
                      <SelectItem value="post-fermentation">Post-Fermentation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newRecipe.description}
                    onChange={(e) => setNewRecipe({ ...newRecipe, description: e.target.value })}
                    placeholder="Describe your recipe..."
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <Label>Ingredients</Label>
                  {newRecipe.ingredients.map((ingredient, index) => (
                    <Input
                      key={index}
                      value={ingredient}
                      onChange={(e) => updateIngredient(index, e.target.value)}
                      placeholder="e.g., 1 head napa cabbage"
                      className="mb-2"
                    />
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={addIngredient}>
                    + Add Ingredient
                  </Button>
                </div>
                <div>
                  <Label>Instructions</Label>
                  {newRecipe.instructions.map((instruction, index) => (
                    <Textarea
                      key={index}
                      value={instruction}
                      onChange={(e) => updateInstruction(index, e.target.value)}
                      placeholder={`Step ${index + 1}...`}
                      rows={2}
                      className="mb-2"
                    />
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={addInstruction}>
                    + Add Step
                  </Button>
                </div>
                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={newRecipe.tags}
                    onChange={(e) => setNewRecipe({ ...newRecipe, tags: e.target.value })}
                    placeholder="e.g., kimchi, spicy, traditional"
                  />
                </div>
                <Button type="submit" className="w-full bg-ferment-green text-white hover:bg-ferment-green-dark">
                  Create Recipe
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search recipes..."
              data-testid="search-input"
              className="pl-10"
            />
          </div>
        </div>

        {filteredRecipes.length === 0 ? (
          <div className="text-center py-24">
            <ChefHat className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
            <h3 className="text-2xl font-serif mb-4">No recipes yet</h3>
            <p className="text-muted-foreground mb-8">Be the first to share a recipe!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe, index) => (
              <motion.div
                key={recipe.recipe_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  onClick={() => setSelectedRecipe(recipe)}
                  data-testid={`recipe-card-${recipe.recipe_id}`}
                  className="p-6 cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 border-border/50"
                >
                  <div className="flex items-start justify-between mb-4">
                    <ChefHat className="h-10 w-10 text-ferment-green" />
                    <span className="text-xs font-mono uppercase tracking-widest px-2 py-1 rounded-full bg-ferment-green/10 text-ferment-green">
                      {recipe.recipe_type}
                    </span>
                  </div>
                  <h3 className="text-xl font-serif font-semibold mb-2">{recipe.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{recipe.description}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>By {recipe.user?.name || 'Unknown'}</span>
                  </div>
                  {recipe.tags && recipe.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {recipe.tags.slice(0, 3).map((tag, i) => (
                        <span key={i} className="text-xs bg-muted px-2 py-1 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        <Dialog open={!!selectedRecipe} onOpenChange={() => setSelectedRecipe(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            {selectedRecipe && (
              <div>
                <DialogHeader>
                  <DialogTitle className="text-3xl font-serif mb-2">{selectedRecipe.title}</DialogTitle>
                  <p className="text-muted-foreground">By {selectedRecipe.user?.name || 'Unknown'}</p>
                </DialogHeader>
                <div className="space-y-6 mt-6">
                  <div>
                    <h3 className="text-xl font-serif mb-2">Description</h3>
                    <p className="text-muted-foreground">{selectedRecipe.description}</p>
                  </div>
                  <div>
                    <h3 className="text-xl font-serif mb-3">Ingredients</h3>
                    <ul className="space-y-2">
                      {selectedRecipe.ingredients.map((ingredient, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="text-ferment-green mt-1">•</span>
                          <span>{ingredient}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-serif mb-3">Instructions</h3>
                    <ol className="space-y-4">
                      {selectedRecipe.instructions.map((instruction, i) => (
                        <li key={i} className="flex gap-4">
                          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-ferment-green text-white flex items-center justify-center font-semibold text-sm">
                            {i + 1}
                          </span>
                          <span className="flex-1 pt-1">{instruction}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                  {selectedRecipe.tags && selectedRecipe.tags.length > 0 && (
                    <div>
                      <h3 className="text-xl font-serif mb-3">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedRecipe.tags.map((tag, i) => (
                          <span key={i} className="text-sm bg-muted px-3 py-1 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
