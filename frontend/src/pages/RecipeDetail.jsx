import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChefHat, Clock, Users, ArrowLeft, Edit2, Trash2, AlertCircle, Snowflake } from 'lucide-react';
import { recipesAPI, shoppingAPI, historyAPI, frozenMealsAPI } from '../services/api';
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
  const [frozenMeals, setFrozenMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCookModal, setShowCookModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingFrozenId, setEditingFrozenId] = useState(null);
  const [freezePortions, setFreezePortions] = useState('');
  const [freezeMeasure, setFreezeMeasure] = useState('potes');
  const [freezeDate, setFreezeDate] = useState(() => {
    // Data de hoje no formato YYYY-MM-DD
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [freezing, setFreezing] = useState(false);
  const [alert, setAlert] = useState(null);
  
  useEffect(() => {
    loadRecipe();
    loadCanMake();
    loadHistory();
    loadFrozenMeals();
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
  
  const loadFrozenMeals = async () => {
    try {
      const response = await frozenMealsAPI.getAll('frozen', false);
      // Filtrar apenas as refeições congeladas desta receita
      const recipeFrozen = response.data.filter(meal => meal.recipe_id === parseInt(id));
      setFrozenMeals(recipeFrozen);
    } catch (error) {
      console.error('Error loading frozen meals:', error);
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
  
  const handleFreeze = async (e) => {
    e.preventDefault();
    
    const portions = parseInt(freezePortions);
    if (!portions || portions <= 0) {
      showAlert('error', 'Digite uma quantidade válida de porções');
      return;
    }
    
    setFreezing(true);
    try {
      const data = {
        recipe_id: recipe.id,
        portions: portions,
        measure: freezeMeasure || null
      };
      
      // Adicionar data de congelamento se fornecida
      if (freezeDate) {
        // Converter para formato ISO com hora
        const freezeDateTime = new Date(freezeDate);
        freezeDateTime.setHours(12, 0, 0, 0); // Meio-dia para evitar problemas de timezone
        data.frozen_at = freezeDateTime.toISOString();
      }
      
      if (editingFrozenId) {
        // Atualizar existente
        await frozenMealsAPI.update(editingFrozenId, data);
        showAlert('success', 'Porções congeladas atualizadas com sucesso!');
        setEditingFrozenId(null);
      } else {
        // Criar novo
        await frozenMealsAPI.create(data);
        showAlert('success', `${portions} porção(ões) congelada(s) com sucesso!`);
      }
      
      // Resetar formulário
      setFreezePortions('');
      setFreezeMeasure('potes');
      const today = new Date();
      setFreezeDate(today.toISOString().split('T')[0]);
      loadFrozenMeals();
    } catch (error) {
      console.error('Error freezing meal:', error);
      showAlert('error', error.response?.data?.error || 'Erro ao congelar porções');
    } finally {
      setFreezing(false);
    }
  };
  
  const handleEditFrozen = (meal) => {
    setFreezePortions(meal.remaining_portions.toString());
    setFreezeMeasure(meal.measure || 'potes');
    // Extrair data do frozen_at
    if (meal.frozen_at) {
      const date = new Date(meal.frozen_at);
      setFreezeDate(date.toISOString().split('T')[0]);
    } else {
      const today = new Date();
      setFreezeDate(today.toISOString().split('T')[0]);
    }
    setEditingFrozenId(meal.id);
  };
  
  const handleCancelEdit = () => {
    setFreezePortions('');
    setFreezeMeasure('potes');
    const today = new Date();
    setFreezeDate(today.toISOString().split('T')[0]);
    setEditingFrozenId(null);
  };
  
  const handleDeleteFrozen = async (mealId) => {
    if (!window.confirm('Tem certeza que deseja remover esta entrada de refeição congelada?')) {
      return;
    }
    
    try {
      await frozenMealsAPI.delete(mealId);
      showAlert('success', 'Refeição congelada removida com sucesso');
      loadFrozenMeals();
    } catch (error) {
      console.error('Error deleting frozen meal:', error);
      showAlert('error', 'Erro ao remover refeição congelada');
    }
  };
  
  const handleConsumeFrozen = async (mealId, portions) => {
    try {
      await frozenMealsAPI.consume(mealId, { portions: parseInt(portions) });
      showAlert('success', `${portions} porção(ões) consumida(s)`);
      loadFrozenMeals();
    } catch (error) {
      console.error('Error consuming frozen meal:', error);
      showAlert('error', error.response?.data?.error || 'Erro ao consumir porções');
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
      
      {/* Porções Congeladas Section */}
      <div className="card mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Snowflake className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">
              Porções Congeladas
            </h3>
            <p className="text-sm text-gray-600">
              Gerencie as porções desta receita que foram congeladas
            </p>
          </div>
        </div>
        
        {/* Lista de Porções Congeladas Existentes */}
        {frozenMeals.length > 0 && (
          <div className="mb-6 space-y-3">
            {frozenMeals.map((meal) => {
              const isEditing = editingFrozenId === meal.id;
              const isExpired = meal.is_expired;
              const isExpiringSoon = meal.days_until_expiry !== null && meal.days_until_expiry <= 7 && meal.days_until_expiry > 0;
              
              return (
                <div
                  key={meal.id}
                  className={`p-4 rounded-lg border-2 ${
                    isExpired 
                      ? 'border-red-300 bg-red-50' 
                      : isExpiringSoon 
                        ? 'border-yellow-300 bg-yellow-50' 
                        : 'border-blue-200 bg-blue-50'
                  }`}
                >
                  {isEditing ? (
                    <form onSubmit={handleFreeze} className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Porções *
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={freezePortions}
                            onChange={(e) => setFreezePortions(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Medida *
                          </label>
                          <select
                            value={freezeMeasure}
                            onChange={(e) => setFreezeMeasure(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                          >
                            <option value="potes">potes</option>
                            <option value="porções">porções</option>
                            <option value="g">g</option>
                            <option value="kg">kg</option>
                            <option value="ml">ml</option>
                            <option value="L">L</option>
                            <option value="unidades">unidades</option>
                            <option value="xícaras">xícaras</option>
                            <option value="colheres">colheres</option>
                            <option value="sacos">sacos</option>
                            <option value="bandejas">bandejas</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Data de Congelamento *
                          </label>
                          <input
                            type="date"
                            value={freezeDate}
                            onChange={(e) => setFreezeDate(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div className="flex items-end space-x-2">
                          <button
                            type="submit"
                            className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                          >
                            Salvar
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="px-4 py-2 bg-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-400"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    </form>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {meal.remaining_portions} de {meal.portions} {meal.measure || 'unidades'}
                        </div>
                        <div className="text-xs text-gray-600">
                          Congelado: {new Date(meal.frozen_at).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                      <div className="text-xs text-gray-600">
                        {meal.expiry_date && (
                          <div className={isExpired ? 'text-red-600 font-medium' : isExpiringSoon ? 'text-yellow-600 font-medium' : ''}>
                            Validade: {new Date(meal.expiry_date).toLocaleDateString('pt-BR')}
                            {meal.days_until_expiry !== null && (
                              <span> ({meal.days_until_expiry > 0 ? `${meal.days_until_expiry} dias` : 'Vencido'})</span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {meal.remaining_portions > 0 && (
                          <input
                            type="number"
                            min="1"
                            max={meal.remaining_portions}
                            defaultValue="1"
                            className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
                            id={`consume-${meal.id}`}
                          />
                        )}
                        {meal.remaining_portions > 0 && (
                          <button
                            onClick={() => {
                              const input = document.getElementById(`consume-${meal.id}`);
                              handleConsumeFrozen(meal.id, input.value || 1);
                            }}
                            className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                          >
                            Consumir
                          </button>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditFrozen(meal)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteFrozen(meal.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded"
                          title="Remover"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        
        {/* Formulário para Adicionar Nova Porção */}
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            {editingFrozenId ? 'Editar Porção Congelada' : 'Adicionar Nova Porção Congelada'}
          </h4>
          <form onSubmit={handleFreeze} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantidade de Porções *
                </label>
                <input
                  type="number"
                  min="1"
                  value={freezePortions}
                  onChange={(e) => setFreezePortions(e.target.value)}
                  placeholder={`Ex: ${recipe.servings || 1}`}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={freezing}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Receita padrão: {recipe.servings || 1} porções
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medida *
                </label>
                <select
                  value={freezeMeasure}
                  onChange={(e) => setFreezeMeasure(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={freezing}
                >
                  <option value="">Selecione...</option>
                  <option value="g">g</option>
                  <option value="kg">kg</option>
                  <option value="ml">ml</option>
                  <option value="L">L</option>
                  <option value="unidades">unidades</option>
                  <option value="xícaras">xícaras</option>
                  <option value="colheres (sopa)">colheres (sopa)</option>
                  <option value="colheres (chá)">colheres (chá)</option>
                  <option value="potes">potes</option>
                  <option value="porções">porções</option>
                  <option value="sacos">sacos</option>
                  <option value="bandejas">bandejas</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data de Congelamento *
                </label>
                <input
                  type="date"
                  value={freezeDate}
                  onChange={(e) => setFreezeDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={freezing}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Padrão: hoje
                </p>
              </div>
              
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={freezing || !freezePortions}
                  className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Snowflake className="w-4 h-4" />
                  <span>{freezing ? 'Salvando...' : editingFrozenId ? 'Atualizar' : 'Adicionar'}</span>
                </button>
              </div>
            </div>
            
            {editingFrozenId && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancelar edição
                </button>
              </div>
            )}
          </form>
        </div>
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
        {showEditModal && recipe && (
          <RecipeForm
            key={recipe.id}
            recipe={recipe}
            onSubmit={handleUpdate}
            onCancel={() => setShowEditModal(false)}
          />
        )}
      </Modal>
      
    </div>
  );
};

export default RecipeDetail;
