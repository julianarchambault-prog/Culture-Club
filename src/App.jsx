import React, { useState, useEffect } from 'react';
import { Heart, Plus, MessageSquare, Book, User, Home, Beaker, TrendingUp, Calendar, Camera, Search, X, Settings, Crown, LogOut, Bell, CheckCircle, Clock, XCircle } from 'lucide-react';

const CultureClubApp = () => {
  const [currentView, setCurrentView] = useState('login');
  const [currentUser, setCurrentUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [ferments, setFerments] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [posts, setPosts] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    if (currentUser) {
      setFerments([
        { id: 1, name: 'Spicy Kimchi', category: 'Kimchi', startDate: '2025-10-25', status: 'active', saltPercent: 2.5, ingredients: 'Napa cabbage, Korean chili flakes, garlic', notes: 'Smells great!', daysElapsed: 6 },
        { id: 2, name: 'Kombucha Batch #3', category: 'Kombucha', startDate: '2025-10-20', status: 'aging', saltPercent: 0, ingredients: 'Black tea, sugar, SCOBY', notes: 'Second fermentation with ginger', daysElapsed: 11 }
      ]);
      
      setRecipes([
        { id: 1, name: 'Classic Sauerkraut', type: 'fermentation', category: 'Lacto', difficulty: 'Easy', likes: 234, author: 'FermentQueen', ingredients: 'Cabbage, salt', steps: '1. Shred cabbage\n2. Mix with 2% salt\n3. Pack into jar\n4. Ferment 3-4 weeks' },
        { id: 2, name: 'Kimchi Fried Rice', type: 'usage', category: 'Korean', difficulty: 'Easy', likes: 156, author: 'ChefMike', ingredients: 'Kimchi, rice, egg, sesame oil', steps: '1. Chop kimchi\n2. Fry with rice\n3. Add egg\n4. Season with sesame oil' }
      ]);
      
      setPosts([
        { id: 1, author: 'FermentFan', avatar: '🧑‍🍳', title: 'My first batch of hot sauce!', content: 'Just finished a 2-week ferment of habaneros. The flavor is incredible!', likes: 42, comments: 8, category: 'Hot Sauce', timestamp: '2 hours ago' },
        { id: 2, author: 'SourDoughSam', avatar: '👨‍🔬', title: 'Question about kahm yeast', content: 'I see a white film on my pickles. Is this safe?', likes: 15, comments: 12, category: 'Lacto', timestamp: '5 hours ago' }
      ]);
    }
  }, [currentUser]);

  const handleLogin = (email, isPro = false) => {
    setCurrentUser({
      email,
      name: email.split('@')[0],
      isPro,
      avatar: '👤'
    });
    setCurrentView('home');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('login');
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setSelectedItem(item);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  const addFerment = (ferment) => {
    setFerments([...ferments, { ...ferment, id: Date.now(), status: 'active', daysElapsed: 0 }]);
    closeModal();
  };

  const addRecipe = (recipe) => {
    setRecipes([...recipes, { ...recipe, id: Date.now(), likes: 0, author: currentUser.name }]);
    closeModal();
  };

  const addPost = (post) => {
    setPosts([{ ...post, id: Date.now(), author: currentUser.name, avatar: currentUser.avatar, likes: 0, comments: 0, timestamp: 'Just now' }, ...posts]);
    closeModal();
  };

  if (currentView === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🫙</div>
            <h1 className="text-4xl font-bold text-orange-900 mb-2">Culture Club</h1>
            <p className="text-orange-700">Your fermentation community</p>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={() => handleLogin('demo@cultureclub.com', false)}
              className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition font-semibold"
            >
              Demo Free Account
            </button>
            <button
              onClick={() => handleLogin('pro@cultureclub.com', true)}
              className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white py-3 rounded-lg hover:from-amber-700 hover:to-orange-700 transition font-semibold flex items-center justify-center gap-2"
            >
              <Crown size={20} />
              Demo Pro Account
            </button>
          </div>
          
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Real app would support:</p>
            <p className="mt-2">Google • Apple • Email Sign-in</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50">
      <header className="bg-white shadow-sm border-b border-orange-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🫙</div>
            <div>
              <h1 className="text-2xl font-bold text-orange-900">Culture Club</h1>
              <p className="text-xs text-orange-700">Fermentation Community</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {currentUser.isPro && (
              <span className="flex items-center gap-1 bg-gradient-to-r from-amber-100 to-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-semibold">
                <Crown size={16} />
                Pro
              </span>
            )}
            <Bell size={24} className="text-orange-700 cursor-pointer hover:text-orange-900" />
            <div className="flex items-center gap-2 cursor-pointer" onClick={handleLogout}>
              <span className="text-2xl">{currentUser.avatar}</span>
              <span className="text-sm font-medium text-orange-900">{currentUser.name}</span>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b border-orange-200 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            {[
              { id: 'home', icon: Home, label: 'Home' },
              { id: 'ferments', icon: Beaker, label: 'My Ferments' },
              { id: 'recipes', icon: Book, label: 'Recipes' },
              { id: 'community', icon: MessageSquare, label: 'Community' },
              { id: 'learn', icon: TrendingUp, label: 'Learn' }
            ].map(nav => (
              <button
                key={nav.id}
                onClick={() => setCurrentView(nav.id)}
                className={`flex items-center gap-2 px-6 py-3 font-medium transition ${
                  currentView === nav.id
                    ? 'text-orange-700 border-b-2 border-orange-600'
                    : 'text-gray-600 hover:text-orange-700'
                }`}
              >
                <nav.icon size={20} />
                <span className="hidden md:inline">{nav.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {!currentUser.isPro && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-center py-3 px-4">
          <p className="text-sm">
            ✨ Upgrade to Pro for an ad-free experience + unlimited recipes! 
            <button className="ml-3 bg-white text-purple-600 px-4 py-1 rounded-full text-xs font-bold hover:bg-gray-100 transition">
              Upgrade Now
            </button>
          </p>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-6">
        {currentView === 'home' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-orange-900">Welcome back, {currentUser.name}! 👋</h2>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-orange-900 flex items-center gap-2">
                  <Beaker className="text-orange-600" />
                  Active Ferments
                </h3>
                <button
                  onClick={() => openModal('addFerment')}
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition flex items-center gap-2"
                >
                  <Plus size={20} />
                  New Batch
                </button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                {ferments.filter(f => f.status === 'active' || f.status === 'aging').map(ferment => (
                  <div key={ferment.id} className="border border-orange-200 rounded-lg p-4 hover:shadow-lg transition">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-lg text-orange-900">{ferment.name}</h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        ferment.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {ferment.status === 'active' ? <Clock size={12} className="inline mr-1" /> : <CheckCircle size={12} className="inline mr-1" />}
                        {ferment.status.charAt(0).toUpperCase() + ferment.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{ferment.category} • Day {ferment.daysElapsed}</p>
                    <div className="bg-orange-50 p-3 rounded text-sm">
                      <p><strong>Salt:</strong> {ferment.saltPercent}%</p>
                      <p><strong>Started:</strong> {ferment.startDate}</p>
                      <p className="mt-2 text-gray-700">{ferment.notes}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-orange-900 mb-4 flex items-center gap-2">
                <MessageSquare className="text-orange-600" />
                Latest from the Community
              </h3>
              <div className="space-y-4">
                {posts.slice(0, 2).map(post => (
                  <div key={post.id} className="border-b border-gray-200 pb-4 last:border-0">
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{post.avatar}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-gray-900">{post.author}</span>
                          <span className="text-gray-500 text-sm">• {post.timestamp}</span>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2">{post.title}</h4>
                        <p className="text-gray-700 text-sm">{post.content}</p>
                        <div className="flex gap-4 mt-3 text-sm text-gray-600">
                          <button className="flex items-center gap-1 hover:text-orange-600">
                            <Heart size={16} /> {post.likes}
                          </button>
                          <button className="flex items-center gap-1 hover:text-orange-600">
                            <MessageSquare size={16} /> {post.comments}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentView === 'ferments' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-orange-900">My Ferments</h2>
              <button
                onClick={() => openModal('addFerment')}
                className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition flex items-center gap-2"
              >
                <Plus size={20} />
                New Batch
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {ferments.map(ferment => (
                <div key={ferment.id} className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-xl text-orange-900">{ferment.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      ferment.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {ferment.status.charAt(0).toUpperCase() + ferment.status.slice(1)}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm mb-4">
                    <p><strong>Category:</strong> {ferment.category}</p>
                    <p><strong>Day:</strong> {ferment.daysElapsed}</p>
                    <p><strong>Salt:</strong> {ferment.saltPercent}%</p>
                  </div>
                  <button className="w-full bg-orange-600 text-white py-2 rounded hover:bg-orange-700 transition">
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentView === 'recipes' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-orange-900">Recipe Library</h2>
              <button
                onClick={() => openModal('addRecipe')}
                className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition flex items-center gap-2"
              >
                <Plus size={20} />
                Add Recipe
              </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipes.map(recipe => (
                <div key={recipe.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="h-48 bg-gradient-to-br from-orange-200 to-amber-200 flex items-center justify-center text-6xl">
                    {recipe.type === 'fermentation' ? '🫙' : '🍽️'}
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-xl text-orange-900 mb-2">{recipe.name}</h3>
                    <p className="text-sm text-gray-600 mb-4">by {recipe.author}</p>
                    <div className="flex items-center justify-between">
                      <button className="flex items-center gap-1 text-orange-600">
                        <Heart size={18} />
                        {recipe.likes}
                      </button>
                      <button className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition">
                        View Recipe
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentView === 'community' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-orange-900">Community Forum</h2>
              <button
                onClick={() => openModal('addPost')}
                className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition flex items-center gap-2"
              >
                <Plus size={20} />
                New Post
              </button>
            </div>

            <div className="space-y-4">
              {posts.map(post => (
                <div key={post.id} className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-start gap-4">
                    <span className="text-4xl">{post.avatar}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-gray-900">{post.author}</span>
                        <span className="text-gray-500 text-sm">• {post.timestamp}</span>
                      </div>
                      <h3 className="font-bold text-xl text-orange-900 mb-2">{post.title}</h3>
                      <p className="text-gray-700 mb-4">{post.content}</p>
                      <div className="flex gap-6 text-sm">
                        <button className="flex items-center gap-2 text-gray-600 hover:text-orange-600">
                          <Heart size={18} /> {post.likes}
                        </button>
                        <button className="flex items-center gap-2 text-gray-600 hover:text-orange-600">
                          <MessageSquare size={18} /> {post.comments}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentView === 'learn' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-orange-900">Educational Hub</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: 'Getting Started with Fermentation', category: 'Basics', icon: '📚' },
                { title: 'Understanding Salt Ratios', category: 'Science', icon: '🧪' },
                { title: 'pH Testing Guide', category: 'Safety', icon: '🔬' },
                { title: 'Troubleshooting Kahm Yeast', category: 'Problems', icon: '🔍' },
                { title: 'Lacto-Fermentation 101', category: 'Techniques', icon: '🥒' },
                { title: 'Kombucha SCOBY Care', category: 'Techniques', icon: '🫖' }
              ].map((article, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow-md p-6 cursor-pointer hover:shadow-xl transition">
                  <div className="text-5xl mb-4">{article.icon}</div>
                  <span className="inline-block px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold mb-3">
                    {article.category}
                  </span>
                  <h3 className="font-bold text-lg text-orange-900">{article.title}</h3>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-orange-900">
                {modalType === 'addFerment' && 'Start New Batch'}
                {modalType === 'addRecipe' && 'Add New Recipe'}
                {modalType === 'addPost' && 'Create Post'}
              </h3>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              {modalType === 'addFerment' && (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.target);
                  addFerment({
                    name: fd.get('name'),
                    category: fd.get('category'),
                    startDate: fd.get('startDate'),
                    saltPercent: parseFloat(fd.get('saltPercent')),
                    ingredients: fd.get('ingredients'),
                    notes: fd.get('notes')
                  });
                }} className="space-y-4">
                  <input name="name" required placeholder="Batch Name" className="w-full px-4 py-2 border rounded-lg" />
                  <select name="category" required className="w-full px-4 py-2 border rounded-lg">
                    <option value="">Select Category</option>
                    <option>Kimchi</option>
                    <option>Kombucha</option>
                    <option>Hot Sauce</option>
                  </select>
                  <input name="startDate" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full px-4 py-2 border rounded-lg" />
                  <input name="saltPercent" type="number" step="0.1" required placeholder="Salt %" className="w-full px-4 py-2 border rounded-lg" />
                  <textarea name="ingredients" required placeholder="Ingredients" className="w-full px-4 py-2 border rounded-lg" rows="3" />
                  <textarea name="notes" placeholder="Notes" className="w-full px-4 py-2 border rounded-lg" rows="2" />
                  <button type="submit" className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 font-semibold">
                    Start Fermenting!
                  </button>
                </form>
              )}

              {modalType === 'addRecipe' && (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.target);
                  addRecipe({
                    name: fd.get('name'),
                    type: fd.get('type'),
                    category: fd.get('category'),
                    difficulty: fd.get('difficulty'),
                    ingredients: fd.get('ingredients'),
                    steps: fd.get('steps')
                  });
                }} className="space-y-4">
                  <input name="name" required placeholder="Recipe Name" className="w-full px-4 py-2 border rounded-lg" />
                  <select name="type" required className="w-full px-4 py-2 border rounded-lg">
                    <option value="">Recipe Type</option>
                    <option value="fermentation">Fermentation Recipe</option>
                    <option value="usage">Usage Recipe</option>
                  </select>
                  <input name="category" required placeholder="Category" className="w-full px-4 py-2 border rounded-lg" />
                  <select name="difficulty" required className="w-full px-4 py-2 border rounded-lg">
                    <option value="">Difficulty</option>
                    <option>Easy</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                  <textarea name="ingredients" required placeholder="Ingredients" className="w-full px-4 py-2 border rounded-lg" rows="4" />
                  <textarea name="steps" required placeholder="Instructions" className="w-full px-4 py-2 border rounded-lg" rows="6" />
                  <button type="submit" className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 font-semibold">
                    Add Recipe
                  </button>
                </form>
              )}

              {modalType === 'addPost' && (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.target);
                  addPost({
                    title: fd.get('title'),
                    content: fd.get('content'),
                    category: fd.get('category')
                  });
                }} className="space-y-4">
                  <input name="title" required placeholder="Post Title" className="w-full px-4 py-2 border rounded-lg" />
                  <select name="category" required className="w-full px-4 py-2 border rounded-lg">
                    <option value="">Category</option>
                    <option>Lacto</option>
                    <option>Kombucha</option>
                    <option>Hot Sauce</option>
                    <option>Question</option>
                  </select>
                  <textarea name="content" required placeholder="What's on your mind?" className="w-full px-4 py-2 border rounded-lg" rows="6" />
                  <button type="submit" className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 font-semibold">
                    Post to Community
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CultureClubApp;
