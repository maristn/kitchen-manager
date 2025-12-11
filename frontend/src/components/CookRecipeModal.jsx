import { useState, useEffect } from 'react';
import { ChefHat, AlertTriangle, CheckCircle, ShoppingCart } from 'lucide-react';

const CookRecipeModal = ({ recipe, onConfirm, onCancel, onAddToShopping }) => {
  const [servings, setServings] = useState(recipe.servings);
  const [notes, setNotes] = useState('');
  const [canMakeInfo, setCanMakeInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    checkAvailability();
  }, [servings]);
  
  const checkAvailability = async () => {
    setLoading(true);
    try {
      const { recipesAPI } = await import('../services/api');
      const response = await recipesAPI.canMake(recipe.id, servings);
      setCanMakeInfo(response.data);
    } catch (error) {
      console.error('Error checking availability:', error);
    }
    setLoading(false);
  };
  
  const handleConfirm = () => {
    onConfirm({ servings, notes });
  };
  
  const handleAddMissingToShopping = () => {
    if (canMakeInfo && canMakeInfo.missing_ingredients) {
      onAddToShopping(canMakeInfo.missing_ingredients);
    }
  };
  
  const canMake = canMakeInfo?.can_make;
  const missingIngredients = canMakeInfo?.missing_ingredients || [];
  
  return (
    <div className="space-y-6">
      {/* Recipe Info */}
      <div className="bg-primary-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-2">{recipe.name}</h4>
        <p className="text-sm text-gray-600">
          Porções padrão: {recipe.servings}
        </p>
      </div>
      
      {/* Servings Input */}
      <div>
        <label className="label">Quantas porções você quer fazer?</label>
        <input
          type="number"
          value={servings}
          onChange={(e) => setServings(parseInt(e.target.value) || 1)}
          className="input text-lg font-semibold"
          min="1"
          max="50"
        />
        {servings !== recipe.servings && (
          <p className="text-sm text-gray-600 mt-1">
            Multiplicador: {(servings / recipe.servings).toFixed(2)}x
          </p>
        )}
      </div>
      
      {/* Ingredient Status */}
      {loading ? (
        <div className="text-center py-4">
          <div className="text-gray-600">Verificando ingredientes...</div>
        </div>
      ) : canMakeInfo && (
        <div>
          <h5 className="font-medium text-gray-900 mb-3">Status dos Ingredientes</h5>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {canMakeInfo.ingredient_status.map((ing, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  ing.has_enough ? 'bg-green-50' : 'bg-red-50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  {ing.has_enough ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  )}
                  <span className="text-sm font-medium text-gray-900">
                    {ing.ingredient_name}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <span className={ing.has_enough ? 'text-green-700' : 'text-red-700'}>
                    {ing.quantity_available} {ing.unit}
                  </span>
                  <span className="text-gray-500"> / {ing.quantity_needed} {ing.unit}</span>
                  {!ing.has_enough && ing.missing > 0 && (
                    <span className="text-red-700 ml-2">
                      (faltam {ing.missing.toFixed(2)} {ing.unit})
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Missing Ingredients Warning */}
      {!canMake && missingIngredients.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h5 className="font-medium text-red-900 mb-2">
                Ingredientes Insuficientes
              </h5>
              <p className="text-sm text-red-700 mb-3">
                Você não tem ingredientes suficientes para fazer esta receita.
              </p>
              <button
                onClick={handleAddMissingToShopping}
                className="text-sm bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Adicionar faltantes à lista de compras</span>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Notes */}
      <div>
        <label className="label">Observações (opcional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="input"
          rows="3"
          placeholder="Ex: Ficou delicioso! Dobrei o alho."
        />
      </div>
      
      {/* Actions */}
      <div className="flex space-x-3">
        <button
          onClick={handleConfirm}
          disabled={!canMake}
          className={`btn-primary flex-1 flex items-center justify-center space-x-2 ${
            !canMake ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <ChefHat className="w-5 h-5" />
          <span>Fazer Receita</span>
        </button>
        <button onClick={onCancel} className="btn-secondary">
          Cancelar
        </button>
      </div>
      
      {canMake && (
        <p className="text-xs text-gray-600 text-center">
          Ao confirmar, os ingredientes serão deduzidos do estoque automaticamente
        </p>
      )}
    </div>
  );
};

export default CookRecipeModal;
