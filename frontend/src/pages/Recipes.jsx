import { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { recipesAPI } from '../services/api';
import RecipeCard from '../components/RecipeCard';
import RecipeForm from '../components/RecipeForm';
import Modal from '../components/Modal';
import Alert from '../components/Alert';

const Recipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [alert, setAlert] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOption, setFilterOption] = useState('all'); // all, can-make, cannot-make
  const [recipesAvailability, setRecipesAvailability] = useState({});
  
  useEffect(() => {
    loadRecipes();
  }, []);
  
  useEffect(() => {
    filterRecipes();
  }, [recipes, searchTerm, filterOption, recipesAvailability]);
  
  const loadRecipes = async () => {
    try {
      const response = await recipesAPI.getAll();
      setRecipes(response.data);
      
      // Verificar disponibilidade de cada receita
      const availability = {};
      for (const recipe of response.data) {
        try {
          const canMakeResponse = await recipesAPI.canMake(recipe.id);
          availability[recipe.id] = canMakeResponse.data.can_make;
        } catch (error) {
          availability[recipe.id] = false;
        }
      }
      setRecipesAvailability(availability);
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading recipes:', error);
      showAlert('error', 'Erro ao carregar receitas');
      setLoading(false);
    }
  };
  
  const filterRecipes = () => {
    let filtered = [...recipes];
    
    if (searchTerm) {
      filtered = filtered.filter(recipe =>
        recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterOption === 'can-make') {
      filtered = filtered.filter(recipe => recipesAvailability[recipe.id] === true);
    } else if (filterOption === 'cannot-make') {
      filtered = filtered.filter(recipe => recipesAvailability[recipe.id] === false);
    }
    
    setFilteredRecipes(filtered);
  };
  
  const handleAdd = () => {
    setEditingRecipe(null);
    setShowModal(true);
  };
  
  const handleEdit = (recipe) => {
    setEditingRecipe(recipe);
    setShowModal(true);
  };
  
  const handleSubmit = async (formData) => {
    try {
      if (editingRecipe) {
        await recipesAPI.update(editingRecipe.id, formData);
        showAlert('success', 'Receita atualizada com sucesso');
      } else {
        await recipesAPI.create(formData);
        showAlert('success', 'Receita criada com sucesso');
      }
      setShowModal(false);
      loadRecipes();
    } catch (error) {
      console.error('Error saving recipe:', error);
      showAlert('error', error.response?.data?.error || 'Erro ao salvar receita');
    }
  };
  
  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Carregando...</div>
      </div>
    );
  }
  
  const canMakeCount = Object.values(recipesAvailability).filter(Boolean).length;
  
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Receitas</h1>
            <p className="text-gray-600 mt-1">
              {canMakeCount} de {recipes.length} receitas disponíveis para fazer
            </p>
          </div>
          <button onClick={handleAdd} className="btn-primary flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>Criar Receita</span>
          </button>
        </div>
        
        {alert && (
          <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
        )}
      </div>
      
      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar receita..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          
          <div>
            <select
              value={filterOption}
              onChange={(e) => setFilterOption(e.target.value)}
              className="input"
            >
              <option value="all">Todas as receitas</option>
              <option value="can-make">Posso fazer agora</option>
              <option value="cannot-make">Faltam ingredientes</option>
            </select>
          </div>
        </div>
        
        {(searchTerm || filterOption !== 'all') && (
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-gray-600">
              {filteredRecipes.length} de {recipes.length} receitas
            </span>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterOption('all');
              }}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Limpar filtros
            </button>
          </div>
        )}
      </div>
      
      {/* Recipes Grid */}
      {filteredRecipes.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma receita encontrada
          </h3>
          <p className="text-gray-600">
            {searchTerm || filterOption !== 'all'
              ? 'Tente ajustar os filtros'
              : 'Crie sua primeira receita para começar'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map(recipe => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              canMake={recipesAvailability[recipe.id]}
            />
          ))}
        </div>
      )}
      
      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingRecipe ? 'Editar Receita' : 'Criar Receita'}
        size="lg"
      >
        <RecipeForm
          recipe={editingRecipe}
          onSubmit={handleSubmit}
          onCancel={() => setShowModal(false)}
        />
      </Modal>
    </div>
  );
};

export default Recipes;
