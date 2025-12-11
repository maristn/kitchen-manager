import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChefHat, Clock, Users, ArrowLeft, Edit2, Trash2, AlertCircle } from 'lucide-react';
import { recipesAPI, shoppingAPI, historyAPI } from '../services/api';
import CookRecipeModal from '../components/CookRecipeModal';
import RecipeForm from '../components/RecipeForm';
import Modal from '../components/Modal';
import Alert from '../components/Alert';

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [canMakeInfo, setCanMakeInfo] = useState(null);
  const [recipeHistory, setRecipeHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCookModal, setShowCookModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [alert, setAlert] = useState(null);
  
  useEffect(() => {
    loadRecipe();
    loadCanMake();
    loadHistory();
  }, [id]);
  
  const loadRecipe = async () => {
    try {
      const response = await recipesAPI.getById(id);
      setRecipe(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading recipe:', error);
      showAlert('error', 'Erro ao carregar receita');
      setLoading(false);
    }
  };
  
  const loadCanMake = async () => {
    try {
      const response = await recipesAPI.canMake(id);
      setCanMakeInfo(response.data);
    } catch (error) {
      console.error('Error checking availability:', error);
    }
  };
  
  const loadHistory = async () => {
    try {
      const response = await historyAPI.getByRecipe(id);
      setRecipeHistory(response.data);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };
  
  const handleCook = async (data) => {
    try {
      const response = await recipesAPI.cook(id, data);
      showAlert('success', response.data.message);
      setShowCookModal(false);
      loadRecipe();
      loadCanMake();
      loadHistory();
      
      // Mostrar ingredientes adicionados à lista
      if (response.data.ingredients_added_to_shopping?.length > 0) {
        setTimeout(() => {
          showAlert('info', `Adicionados à lista de compras: ${response.data.ingredients_added_to_shopping.join(', ')}`);
        }, 3000);
      }
    } catch (error) {
      console.error('Error cooking recipe:', error);
      showAlert('error', error.response?.data?.error || 'Erro ao fazer receita');
    }
  };
  
  const handleAddToShopping = async (missingIngredients) => {
    try {
      for (const ing of missingIngredients) {
        try {
          await shoppingAPI.add({
            ingredient_id: ing.ingredient_id || ing.id,
            quantity_needed: ing.missing
          });
        } catch (error) {
          // Ignorar se já estiver na lista
          console.log('Ingredient already in shopping list:', ing.ingredient_name);
        }
      }
      showAlert('success', 'Ingredientes faltantes adicionados à lista de compras');
    } catch (error) {
      console.error('Error adding to shopping list:', error);
      showAlert('error', 'Erro ao adicionar à lista de compras');
    }
  };
  
  const handleEdit = () => {
    setShowEditModal(true);
  };
  
  const handleUpdate = async (formData) => {
    try {
      await recipesAPI.update(id, formData);
      showAlert('success', 'Receita atualizada com sucesso');
      setShowEditModal(false);
      loadRecipe();
      loadCanMake();
    } catch (error) {
      console.error('Error updating recipe:', error);
      showAlert('error', 'Erro ao atualizar receita');
    }
  };
  
  const handleDelete = async () => {
    if (!window.confirm('Tem certeza que deseja deletar esta receita?')) {
      return;
    }
    
    try {
      await recipesAPI.delete(id);
      showAlert('success', 'Receita deletada com sucesso');
      setTimeout(() => navigate('/recipes'), 1500);
    } catch (error) {
      console.error('Error deleting recipe:', error);
      showAlert('error', 'Erro ao deletar receita');
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
  
  if (!recipe) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Receita não encontrada
        </h3>
        <button onClick={() => navigate('/recipes')} className="btn-primary mt-4">
          Voltar para Receitas
        </button>
      </div>
    );
  }
  
  const canMake = canMakeInfo?.can_make;
  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);
  
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/recipes')}
          className="text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-2 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar para Receitas</span>
        </button>
        
        {alert && (
          <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
        )}
      </div>
      
      {/* Recipe Header */}
      <div className="card mb-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center space-x-4">
            <div className="bg-primary-100 p-4 rounded-xl">
              <ChefHat className="w-10 h-10 text-primary-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{recipe.name}</h1>
              <div className="flex items-center space-x-4 mt-2 text-gray-600">
                {recipe.servings && (
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{recipe.servings} porções</span>
                  </div>
                )}
                {totalTime > 0 && (
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{totalTime} min</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={handleEdit}
              className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            >
              <Edit2 className="w-5 h-5" />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Can Make Status */}
        {canMakeInfo && (
          <div className={`rounded-lg p-4 mb-6 ${canMake ? 'bg-green-50' : 'bg-yellow-50'}`}>
            <div className="flex items-center justify-between">
              <div>
                {canMake ? (
                  <p className="text-green-800 font-medium">
                    ✅ Você pode fazer esta receita agora!
                  </p>
                ) : (
                  <div>
                    <p className="text-yellow-800 font-medium mb-2">
                      ⚠️ Faltam alguns ingredientes
                    </p>
                    <div className="text-sm text-yellow-700">
                      {canMakeInfo.missing_ingredients.map((ing, idx) => (
                        <div key={idx}>
                          • {ing.ingredient_name}: falta {ing.missing.toFixed(2)} {ing.unit}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowCookModal(true)}
                className={`btn-primary ${!canMake ? 'opacity-75' : ''}`}
              >
                Fazer Receita
              </button>
            </div>
          </div>
        )}
        
        {/* Ingredients */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Ingredientes ({recipe.ingredients?.length || 0})
          </h3>
          {recipe.ingredients && recipe.ingredients.length > 0 ? (
            <div className="space-y-3">
              {recipe.ingredients.map((ing, idx) => {
                const status = canMakeInfo?.ingredient_status.find(
                  s => s.ingredient_id === ing.ingredient_id
                );
                const hasEnough = status?.has_enough;
                
                return (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      hasEnough ? 'bg-green-50' : hasEnough === false ? 'bg-red-50' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {hasEnough !== undefined && (
                        <div className={`w-2 h-2 rounded-full ${hasEnough ? 'bg-green-500' : 'bg-red-500'}`} />
                      )}
                      <span className="font-medium text-gray-900">{ing.ingredient_name}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">{ing.quantity_needed} {ing.unit}</span>
                      {status && (
                        <span className="ml-2 text-gray-500">
                          (disponível: {status.quantity_available} {ing.unit})
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500">Nenhum ingrediente adicionado</p>
          )}
        </div>
        
        {/* Instructions */}
        {recipe.instructions && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Instruções</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{recipe.instructions}</p>
          </div>
        )}
      </div>
      
      {/* History */}
      {recipeHistory.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Histórico ({recipeHistory.length})
          </h3>
          <div className="space-y-3">
            {recipeHistory.slice(0, 5).map((h) => (
              <div key={h.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {h.servings_made} porções
                  </p>
                  {h.notes && (
                    <p className="text-xs text-gray-600 mt-1">{h.notes}</p>
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(h.cooked_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Cook Modal */}
      <Modal
        isOpen={showCookModal}
        onClose={() => setShowCookModal(false)}
        title="Fazer Receita"
        size="lg"
      >
        <CookRecipeModal
          recipe={recipe}
          onConfirm={handleCook}
          onCancel={() => setShowCookModal(false)}
          onAddToShopping={handleAddToShopping}
        />
      </Modal>
      
      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Editar Receita"
        size="lg"
      >
        <RecipeForm
          recipe={recipe}
          onSubmit={handleUpdate}
          onCancel={() => setShowEditModal(false)}
        />
      </Modal>
    </div>
  );
};

export default RecipeDetail;
