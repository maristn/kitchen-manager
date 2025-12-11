import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  ChefHat,
  ShoppingCart,
  AlertTriangle,
  TrendingUp,
  Clock,
  Check
} from 'lucide-react';
import {
  ingredientsAPI,
  recipesAPI,
  shoppingAPI,
  historyAPI
} from '../services/api';
import Alert from '../components/Alert';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalIngredients: 0,
    lowStockIngredients: 0,
    expiringIngredients: 0,
    totalRecipes: 0,
    availableRecipes: 0,
    shoppingListPending: 0,
    recipesThisWeek: 0,
    recipesThisMonth: 0
  });
  const [expiringItems, setExpiringItems] = useState([]);
  const [availableRecipes, setAvailableRecipes] = useState([]);
  const [recentHistory, setRecentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipes, setSelectedRecipes] = useState([]);
  const [alert, setAlert] = useState(null);
  
  useEffect(() => {
    loadDashboardData();
  }, []);
  
  const loadDashboardData = async () => {
    try {
      // Load all data in parallel
      const [
        ingredientsRes,
        expiringRes,
        recipesRes,
        availableRecipesRes,
        shoppingRes,
        historyStatsRes,
        recentHistoryRes
      ] = await Promise.all([
        ingredientsAPI.getAll(),
        ingredientsAPI.getExpiring(),
        recipesAPI.getAll(),
        recipesAPI.getAvailable(),
        shoppingAPI.getStats(),
        historyAPI.getStats(),
        historyAPI.getRecent()
      ]);
      
      const ingredients = ingredientsRes.data;
      
      // Filter ingredients: only show those with quantity > 0 OR unlimited (like water)
      const ingredientsInStock = ingredients.filter(
        ing => ing.quantity > 0 || ing.unlimited
      );
      
      const lowStock = ingredientsInStock.filter(
        ing => ing.quantity <= ing.minimum_quantity && ing.minimum_quantity > 0 && !ing.unlimited
      );
      
      setStats({
        totalIngredients: ingredientsInStock.length,
        lowStockIngredients: lowStock.length,
        expiringIngredients: expiringRes.data.length,
        totalRecipes: recipesRes.data.length,
        availableRecipes: availableRecipesRes.data.length,
        shoppingListPending: shoppingRes.data.pending,
        recipesThisWeek: historyStatsRes.data.cooked_this_week,
        recipesThisMonth: historyStatsRes.data.cooked_this_month
      });
      
      setExpiringItems(expiringRes.data);
      setAvailableRecipes(availableRecipesRes.data.slice(0, 6));
      setRecentHistory(recentHistoryRes.data.slice(0, 5));
      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      setLoading(false);
    }
  };
  
  const toggleRecipeSelection = async (recipeId) => {
    const isCurrentlySelected = selectedRecipes.includes(recipeId);
    
    if (isCurrentlySelected) {
      // Desselecionar - apenas remove da lista
      setSelectedRecipes(prev => prev.filter(id => id !== recipeId));
    } else {
      // Selecionar - adiciona e já processa os ingredientes
      setSelectedRecipes(prev => [...prev, recipeId]);
      await addRecipeToShoppingList(recipeId);
    }
  };
  
  const addRecipeToShoppingList = async (recipeId) => {
    try {
      const response = await recipesAPI.canMake(recipeId);
      
      if (!response.data.can_make && response.data.missing_ingredients) {
        let addedCount = 0;
        
        for (const ing of response.data.missing_ingredients) {
          try {
            await shoppingAPI.add({
              ingredient_id: ing.ingredient_id,
              quantity_needed: Math.ceil(ing.missing)
            });
            addedCount++;
          } catch (error) {
            // Item já existe na lista
          }
        }
        
        if (addedCount > 0) {
          showAlert('success', `${addedCount} ingrediente(s) adicionado(s) à lista de compras!`);
          loadDashboardData(); // Recarregar stats
        }
      } else if (response.data.can_make) {
        showAlert('info', 'Você já tem todos os ingredientes dessa receita!');
      }
    } catch (error) {
      console.error('Error adding to shopping list:', error);
      showAlert('error', 'Erro ao adicionar à lista de compras');
    }
  };
  
  
  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };
  
  const isRecipeVegan = (recipe) => {
    // Verifica se a receita tem ingredientes e se todos são veganos
    if (!recipe.ingredients || recipe.ingredients.length === 0) {
      return false;
    }
    // Precisa buscar os detalhes dos ingredientes para verificar se são veganos
    // Por enquanto, vamos assumir que a informação vem junto
    return recipe.is_vegan || false;
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
        <p className="text-gray-600 mt-1">Visão geral da sua cozinha</p>
      </div>
      
      {/* Alert */}
      {alert && (
        <div className="mb-6">
          <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
        </div>
      )}
      
      {/* Available Recipes - MOVED TO TOP */}
      {availableRecipes.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Receitas Disponíveis
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Clique para selecionar e adicionar ingredientes faltantes automaticamente
              </p>
            </div>
            <Link
              to="/recipes"
              className="text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              Ver todas →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableRecipes.map(recipe => {
              const isSelected = selectedRecipes.includes(recipe.id);
              return (
                <div
                  key={recipe.id}
                  className={`card hover:shadow-lg transition-all cursor-pointer relative ${
                    isSelected ? 'ring-2 ring-primary-500 bg-primary-50' : ''
                  }`}
                  onClick={(e) => {
                    if (e.target.tagName !== 'A') {
                      toggleRecipeSelection(recipe.id);
                    }
                  }}
                >
                  {/* Vegan Badge */}
                  {recipe.is_vegan && (
                    <div className="absolute top-4 left-4 bg-green-500 text-white px-2 py-1 rounded-lg text-xs font-bold flex items-center shadow-md">
                      <span className="text-base mr-1">🌱</span>
                      VEGANO
                    </div>
                  )}
                  
                  {/* Checkbox */}
                  <div className="absolute top-4 right-4">
                    <div
                      className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-primary-600 border-primary-600'
                          : 'bg-white border-gray-300'
                      }`}
                    >
                      {isSelected && <Check className="w-4 h-4 text-white" />}
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 mb-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <ChefHat className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1 pr-8">
                      <Link
                        to={`/recipes/${recipe.id}`}
                        className="font-semibold text-gray-900 hover:text-primary-600"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {recipe.name}
                      </Link>
                      {recipe.servings && (
                        <p className="text-sm text-gray-600">{recipe.servings} porções</p>
                      )}
                    </div>
                  </div>
                  {recipe.ingredients && recipe.ingredients.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {recipe.ingredients.slice(0, 3).map((ing, idx) => (
                        <span key={idx} className="badge bg-gray-100 text-gray-700 text-xs">
                          {ing.ingredient_name}
                        </span>
                      ))}
                      {recipe.ingredients.length > 3 && (
                        <span className="badge bg-gray-100 text-gray-700 text-xs">
                          +{recipe.ingredients.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Ingredients */}
        <Link to="/ingredients" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ingredientes</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {stats.totalIngredients}
              </p>
              {stats.lowStockIngredients > 0 && (
                <p className="text-xs text-yellow-600 mt-1">
                  {stats.lowStockIngredients} com estoque baixo
                </p>
              )}
            </div>
            <Package className="w-12 h-12 text-gray-300" />
          </div>
        </Link>
        
        {/* Total Recipes */}
        <Link to="/recipes" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Receitas</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {stats.totalRecipes}
              </p>
              <p className="text-xs text-green-600 mt-1">
                {stats.availableRecipes} disponíveis agora
              </p>
            </div>
            <ChefHat className="w-12 h-12 text-gray-300" />
          </div>
        </Link>
        
        {/* Shopping List */}
        <Link to="/shopping-list" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Lista de Compras</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">
                {stats.shoppingListPending}
              </p>
              <p className="text-xs text-gray-600 mt-1">itens pendentes</p>
            </div>
            <ShoppingCart className="w-12 h-12 text-yellow-200" />
          </div>
        </Link>
        
        {/* Recipes This Month */}
        <Link to="/history" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Este Mês</p>
              <p className="text-3xl font-bold text-primary-600 mt-1">
                {stats.recipesThisMonth}
              </p>
              <p className="text-xs text-gray-600 mt-1">receitas feitas</p>
            </div>
            <TrendingUp className="w-12 h-12 text-primary-200" />
          </div>
        </Link>
      </div>
      
      {/* Alerts Section */}
      {(stats.expiringIngredients > 0 || stats.lowStockIngredients > 0) && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Alertas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.expiringIngredients > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-red-900 mb-2">
                      Ingredientes Vencendo
                    </h3>
                    <p className="text-sm text-red-700 mb-3">
                      {stats.expiringIngredients} ingrediente(s) vencendo nos próximos 7 dias
                    </p>
                    <div className="space-y-1">
                      {expiringItems.slice(0, 3).map(item => (
                        <p key={item.id} className="text-xs text-red-800">
                          • {item.name} - {new Date(item.expiry_date).toLocaleDateString('pt-BR')}
                        </p>
                      ))}
                    </div>
                    <Link
                      to="/ingredients"
                      className="text-sm font-medium text-red-700 hover:text-red-800 mt-2 inline-block"
                    >
                      Ver todos →
                    </Link>
                  </div>
                </div>
              </div>
            )}
            
            {stats.lowStockIngredients > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-yellow-900 mb-2">
                      Estoque Baixo
                    </h3>
                    <p className="text-sm text-yellow-700 mb-3">
                      {stats.lowStockIngredients} ingrediente(s) com estoque abaixo do mínimo
                    </p>
                    <Link
                      to="/shopping-list"
                      className="text-sm font-medium text-yellow-700 hover:text-yellow-800"
                    >
                      Ver lista de compras →
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Recent Activity */}
      {recentHistory.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Atividade Recente
            </h2>
            <Link
              to="/history"
              className="text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              Ver histórico →
            </Link>
          </div>
          <div className="card">
            <div className="space-y-3">
              {recentHistory.map(item => (
                <Link
                  key={item.id}
                  to={`/recipes/${item.recipe_id}`}
                  className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary-100 p-2 rounded-lg">
                      <ChefHat className="w-4 h-4 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.recipe_name}</p>
                      <p className="text-sm text-gray-600">
                        {item.servings_made} porções
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>
                      {new Date(item.cooked_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Empty State */}
      {stats.totalIngredients === 0 && stats.totalRecipes === 0 && (
        <div className="text-center py-12">
          <ChefHat className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            Bem-vindo ao Kitchen Manager!
          </h3>
          <p className="text-gray-600 mb-6">
            Comece adicionando ingredientes e receitas para gerenciar sua cozinha
          </p>
          <div className="flex justify-center space-x-4">
            <Link to="/ingredients" className="btn-primary">
              Adicionar Ingredientes
            </Link>
            <Link to="/recipes" className="btn-secondary">
              Criar Receita
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
