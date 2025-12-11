import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Ingredients from './pages/Ingredients';
import Recipes from './pages/Recipes';
import RecipeDetail from './pages/RecipeDetail';
import ShoppingList from './pages/ShoppingList';
import History from './pages/History';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-stone-50">
        <Navbar />
        <main className="container mx-auto px-6 py-10 max-w-7xl">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/ingredients" element={<Ingredients />} />
            <Route path="/recipes" element={<Recipes />} />
            <Route path="/recipes/:id" element={<RecipeDetail />} />
            <Route path="/shopping-list" element={<ShoppingList />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
