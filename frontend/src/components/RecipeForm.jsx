import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { ingredientsAPI } from '../services/api';

const RecipeForm = ({ recipe, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    instructions: '',
    servings: 1,
    prep_time: 0,
    cook_time: 0,
    ingredients: []
  });
  
  const [availableIngredients, setAvailableIngredients] = useState([]);
  
  useEffect(() => {
    loadIngredients();
    
    if (recipe) {
      setFormData({
        name: recipe.name || '',
        instructions: recipe.instructions || '',
        servings: recipe.servings || 1,
        prep_time: recipe.prep_time || 0,
        cook_time: recipe.cook_time || 0,
        ingredients: recipe.ingredients || []
      });
    }
  }, [recipe]);
  
  const loadIngredients = async () => {
    try {
      const response = await ingredientsAPI.getAll();
      setAvailableIngredients(response.data);
    } catch (error) {
      console.error('Error loading ingredients:', error);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleAddIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { ingredient_id: '', quantity_needed: 0, unit: 'g' }]
    }));
  };
  
  const handleRemoveIngredient = (index) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };
  
  const handleIngredientChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) =>
        i === index ? { ...ing, [field]: value } : ing
      )
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Filtrar ingredientes válidos
    const validIngredients = formData.ingredients.filter(
      ing => ing.ingredient_id && ing.quantity_needed > 0
    );
    
    onSubmit({
      ...formData,
      ingredients: validIngredients
    });
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Nome da Receita *</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="input"
          required
        />
      </div>
      
      <div>
        <label className="label">Instruções</label>
        <textarea
          name="instructions"
          value={formData.instructions}
          onChange={handleChange}
          className="input"
          rows="4"
          placeholder="Descreva como preparar a receita..."
        />
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="label">Porções *</label>
          <input
            type="number"
            name="servings"
            value={formData.servings}
            onChange={handleChange}
            className="input"
            min="1"
            required
          />
        </div>
        
        <div>
          <label className="label">Tempo de Preparo (min)</label>
          <input
            type="number"
            name="prep_time"
            value={formData.prep_time}
            onChange={handleChange}
            className="input"
            min="0"
          />
        </div>
        
        <div>
          <label className="label">Tempo de Cozimento (min)</label>
          <input
            type="number"
            name="cook_time"
            value={formData.cook_time}
            onChange={handleChange}
            className="input"
            min="0"
          />
        </div>
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="label mb-0">Ingredientes</label>
          <button
            type="button"
            onClick={handleAddIngredient}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-1"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Ingrediente</span>
          </button>
        </div>
        
        <div className="space-y-3">
          {formData.ingredients.map((ingredient, index) => (
            <div key={index} className="flex items-start space-x-2 bg-gray-50 p-3 rounded-lg">
              <div className="flex-1 grid grid-cols-3 gap-2">
                <select
                  value={ingredient.ingredient_id}
                  onChange={(e) => handleIngredientChange(index, 'ingredient_id', e.target.value)}
                  className="input"
                  required
                >
                  <option value="">Selecione...</option>
                  {availableIngredients.map(ing => (
                    <option key={ing.id} value={ing.id}>
                      {ing.name} ({ing.quantity} {ing.unit})
                    </option>
                  ))}
                </select>
                
                <input
                  type="number"
                  value={ingredient.quantity_needed}
                  onChange={(e) => handleIngredientChange(index, 'quantity_needed', e.target.value)}
                  className="input"
                  placeholder="Quantidade"
                  min="0"
                  step="0.01"
                  required
                />
                
                <input
                  type="text"
                  value={ingredient.unit}
                  onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                  className="input"
                  placeholder="Unidade"
                  required
                />
              </div>
              
              <button
                type="button"
                onClick={() => handleRemoveIngredient(index)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
          
          {formData.ingredients.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              Nenhum ingrediente adicionado. Clique em "Adicionar Ingrediente" para começar.
            </p>
          )}
        </div>
      </div>
      
      <div className="flex space-x-3 pt-4">
        <button type="submit" className="btn-primary flex-1">
          {recipe ? 'Atualizar' : 'Criar'} Receita
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancelar
        </button>
      </div>
    </form>
  );
};

export default RecipeForm;
