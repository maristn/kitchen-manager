import { useState } from 'react';
import { Snowflake, X } from 'lucide-react';

const FreezeMealModal = ({ recipe, onConfirm, onCancel }) => {
  const [portions, setPortions] = useState(recipe?.servings || 1);
  const [notes, setNotes] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (portions <= 0) {
      alert('A quantidade de porções deve ser maior que zero');
      return;
    }
    
    const data = {
      recipe_id: recipe.id,
      portions: parseInt(portions),
      notes: notes.trim() || null,
    };
    
    if (expiryDate) {
      data.expiry_date = expiryDate;
    }
    
    onConfirm(data);
  };
  
  // Calcular data padrão (3 meses a partir de hoje)
  const getDefaultExpiryDate = () => {
    const date = new Date();
    date.setMonth(date.getMonth() + 3);
    return date.toISOString().split('T')[0];
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-blue-100 p-3 rounded-lg">
          <Snowflake className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Congelar Porções
          </h3>
          <p className="text-sm text-gray-600">
            {recipe?.name}
          </p>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Quantidade de Porções a Congelar *
        </label>
        <input
          type="number"
          min="1"
          value={portions}
          onChange={(e) => setPortions(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Receita padrão: {recipe?.servings || 1} porções
        </p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Data de Validade (opcional)
        </label>
        <input
          type="date"
          value={expiryDate}
          onChange={(e) => setExpiryDate(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          placeholder={getDefaultExpiryDate()}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          Padrão: 3 meses a partir de hoje ({getDefaultExpiryDate()})
        </p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notas (opcional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows="3"
          placeholder="Ex: Congelado em potes individuais de 250ml..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      <div className="flex space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <div className="flex items-center justify-center space-x-2">
            <Snowflake className="w-4 h-4" />
            <span>Congelar</span>
          </div>
        </button>
      </div>
    </form>
  );
};

export default FreezeMealModal;
