import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ChefHat,
  ShoppingCart,
  Check
} from 'lucide-react';
import {
  ingredientsAPI,
  recipesAPI
} from '../services/api';
import Alert from '../components/Alert';

const Dashboard = () => {
  const [allRecipes, setAllRecipes] = useState([]);
  const [allIngredients, setAllIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipes, setSelectedRecipes] = useState([]);
  const [shoppingList, setShoppingList] = useState([]);
  const [alert, setAlert] = useState(null);
  
  useEffect(() => {
    loadDashboardData();
  }, []);
  
  useEffect(() => {
    calculateShoppingList();
  }, [selectedRecipes, allRecipes, allIngredients]);
  
  const loadDashboardData = async () => {
    try {
      // Load all recipes and ingredients
      const [recipesRes, ingredientsRes] = await Promise.all([
        recipesAPI.getAll(),
        ingredientsAPI.getAll()
      ]);
      
      setAllRecipes(recipesRes.data);
      setAllIngredients(ingredientsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      setLoading(false);
    }
  };
  
  const toggleRecipeSelection = (recipeId) => {
    setSelectedRecipes(prev => {
      if (prev.includes(recipeId)) {
        return prev.filter(id => id !== recipeId);
      } else {
        return [...prev, recipeId];
      }
    });
  };
  
  const calculateShoppingList = () => {
    if (selectedRecipes.length === 0) {
      setShoppingList([]);
      return;
    }
    
    // Aggregate all ingredients needed from selected recipes
    const ingredientsNeeded = {};
    
    selectedRecipes.forEach(recipeId => {
      const recipe = allRecipes.find(r => r.id === recipeId);
      if (!recipe || !recipe.ingredients) return;
      
      recipe.ingredients.forEach(recipeIng => {
        const ingId = recipeIng.ingredient_id;
        const needed = recipeIng.quantity_needed;
        
        if (ingredientsNeeded[ingId]) {
          ingredientsNeeded[ingId].totalNeeded += needed;
        } else {
          ingredientsNeeded[ingId] = {
            ingredient_id: ingId,
            ingredient_name: recipeIng.ingredient_name,
            totalNeeded: needed,
            unit: recipeIng.unit
          };
        }
      });
    });
    
    // Compare with current stock and calculate what's missing
    const missingIngredients = [];
    
    Object.values(ingredientsNeeded).forEach(needed => {
      const ingredient = allIngredients.find(i => i.id === needed.ingredient_id);
      
      if (!ingredient) return;
      
      // Skip unlimited ingredients (like water)
      if (ingredient.unlimited) return;
      
      const available = ingredient.quantity;
      const required = needed.totalNeeded;
      
      if (available < required) {
        missingIngredients.push({
          ...needed,
          available,
          missing: required - available
        });
      }
    });
    
    setShoppingList(missingIngredients);
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
  
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Selecione as receitas que deseja fazer e veja a lista de compras</p>
      </div>
      
      {/* Alert */}
      {alert && (
        <div className="mb-6">
          <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
        </div>
      )}
      
      {/* RECEITAS SECTION */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              📋 Receitas
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {selectedRecipes.length > 0 
                ? `${selectedRecipes.length} receita(s) selecionada(s)`
                : 'Clique para selecionar as receitas que deseja fazer'
              }
            </p>
          </div>
          <Link
            to="/recipes"
            className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center space-x-1"
          >
            <span>Gerenciar receitas</span>
            <span>→</span>
          </Link>
        </div>
        
        {allRecipes.length === 0 ? (
          <div className="card text-center py-12">
            <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma receita cadastrada
            </h3>
            <p className="text-gray-600 mb-6">
              Comece criando receitas para planejar suas refeições
            </p>
            <Link to="/recipes" className="btn-primary inline-flex">
              Criar Receita
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {allRecipes.map((recipe, index) => {
              const isSelected = selectedRecipes.includes(recipe.id);
              
              // Cores diferentes para cada card
              const colors = [
                { bg: 'from-pink-400 to-rose-500', light: 'bg-pink-50', border: 'border-pink-200', ring: 'ring-pink-500', text: 'text-pink-700' },
                { bg: 'from-purple-400 to-indigo-500', light: 'bg-purple-50', border: 'border-purple-200', ring: 'ring-purple-500', text: 'text-purple-700' },
                { bg: 'from-blue-400 to-cyan-500', light: 'bg-blue-50', border: 'border-blue-200', ring: 'ring-blue-500', text: 'text-blue-700' },
                { bg: 'from-green-400 to-emerald-500', light: 'bg-green-50', border: 'border-green-200', ring: 'ring-green-500', text: 'text-green-700' },
                { bg: 'from-yellow-400 to-orange-500', light: 'bg-yellow-50', border: 'border-yellow-200', ring: 'ring-yellow-500', text: 'text-yellow-700' },
                { bg: 'from-red-400 to-pink-500', light: 'bg-red-50', border: 'border-red-200', ring: 'ring-red-500', text: 'text-red-700' },
                { bg: 'from-teal-400 to-cyan-500', light: 'bg-teal-50', border: 'border-teal-200', ring: 'ring-teal-500', text: 'text-teal-700' },
                { bg: 'from-amber-400 to-yellow-500', light: 'bg-amber-50', border: 'border-amber-200', ring: 'ring-amber-500', text: 'text-amber-700' },
              ];
              
              const colorSet = colors[index % colors.length];
              
              return (
                <div
                  key={recipe.id}
                  className={`group relative bg-white rounded-xl p-3 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl border-2 ${
                    isSelected 
                      ? `ring-4 ${colorSet.ring} ${colorSet.light} shadow-xl scale-105` 
                      : `${colorSet.border} hover:${colorSet.border} shadow-md`
                  }`}
                  onClick={() => toggleRecipeSelection(recipe.id)}
                >
                  {/* Checkbox */}
                  <div className="absolute -top-1.5 -right-1.5 z-10">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shadow-lg ${
                        isSelected
                          ? `bg-gradient-to-br ${colorSet.bg} border-white scale-110`
                          : 'bg-white border-gray-300 group-hover:border-gray-400'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 text-white font-bold" />}
                    </div>
                  </div>
                  
                  {/* Emoji */}
                  <div className="flex justify-center mb-2">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-3xl shadow-sm transition-all ${
                      isSelected ? `bg-gradient-to-br ${colorSet.bg}` : colorSet.light
                    }`}>
                      {recipe.emoji || '🍽️'}
                    </div>
                  </div>
                  
                  {/* Nome */}
                  <h3 className={`text-center font-bold text-xs mb-1.5 line-clamp-2 min-h-[32px] transition-colors ${
                    isSelected ? colorSet.text : 'text-gray-800'
                  }`}>
                    {recipe.name}
                  </h3>
                  
                  {/* Info Compacta */}
                  <div className="flex flex-col gap-0.5 text-[10px] text-gray-600 text-center mb-1">
                    {recipe.servings && (
                      <div className="flex items-center justify-center gap-0.5">
                        <span>🍽️</span>
                        <span className="font-medium">{recipe.servings}</span>
                      </div>
                    )}
                    {(recipe.prep_time || recipe.cook_time) && (
                      <div className="flex items-center justify-center gap-0.5">
                        <span>⏱️</span>
                        <span className="font-medium">{(recipe.prep_time || 0) + (recipe.cook_time || 0)}min</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Vegan Badge - Canto Inferior Direito */}
                  {recipe.is_vegan && (
                    <div className="absolute bottom-2 right-2">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[8px] font-bold bg-green-500 text-white shadow-sm">
                        🌱
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* LISTA DE COMPRAS SECTION */}
      {selectedRecipes.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                🛒 Lista de Compras
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {shoppingList.length > 0
                  ? `${shoppingList.length} ingrediente(s) necessário(s) para as receitas selecionadas`
                  : 'Você já tem todos os ingredientes! 🎉'
                }
              </p>
            </div>
            <Link
              to="/ingredients"
              className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center space-x-1"
            >
              <span>Ver estoque</span>
              <span>→</span>
            </Link>
          </div>
          
          {shoppingList.length === 0 ? (
            <div className="card text-center py-12 bg-green-50/50 border-2 border-green-200">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                Tudo pronto!
              </h3>
              <p className="text-green-700">
                Você tem todos os ingredientes necessários para fazer as receitas selecionadas
              </p>
            </div>
          ) : (
            <div className="card overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200 font-semibold text-sm text-gray-700">
                <div className="col-span-4">Ingrediente</div>
                <div className="col-span-2 text-center">Disponível</div>
                <div className="col-span-2 text-center">Necessário</div>
                <div className="col-span-2 text-center">Faltando</div>
                <div className="col-span-2 text-center">Unidade</div>
              </div>
              
              {/* Table Body */}
              <div className="divide-y divide-gray-200">
                {shoppingList.map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    {/* Ingredient Name */}
                    <div className="col-span-4 flex items-center">
                      <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center mr-3">
                        <ShoppingCart className="w-4 h-4 text-yellow-600" />
                      </div>
                      <span className="font-medium text-gray-900">
                        {item.ingredient_name}
                      </span>
                    </div>
                    
                    {/* Available */}
                    <div className="col-span-2 flex items-center justify-center">
                      <span className="text-sm text-gray-700">
                        {item.available.toFixed(2)}
                      </span>
                    </div>
                    
                    {/* Total Needed */}
                    <div className="col-span-2 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-900">
                        {item.totalNeeded.toFixed(2)}
                      </span>
                    </div>
                    
                    {/* Missing */}
                    <div className="col-span-2 flex items-center justify-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold bg-red-100 text-red-700">
                        {item.missing.toFixed(2)}
                      </span>
                    </div>
                    
                    {/* Unit */}
                    <div className="col-span-2 flex items-center justify-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                        {item.unit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Summary Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    💡 <strong>Dica:</strong> Vá até a página de ingredientes para comprar e atualizar o estoque
                  </p>
                  <Link
                    to="/ingredients"
                    className="btn-primary text-sm"
                  >
                    Ir para Ingredientes
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
