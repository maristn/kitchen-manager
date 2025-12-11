import { Edit2, Trash2, AlertCircle, Package } from 'lucide-react';

const IngredientCard = ({ ingredient, onEdit, onDelete }) => {
  const isLowStock = ingredient.quantity <= ingredient.minimum_quantity && ingredient.minimum_quantity > 0;
  const isExpiringSoon = ingredient.expiry_date && new Date(ingredient.expiry_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const isExpired = ingredient.expiry_date && new Date(ingredient.expiry_date) < new Date();
  
  const categoryColors = {
    'Vegetais': 'bg-green-100 text-green-800',
    'Frutas': 'bg-red-100 text-red-800',
    'Laticínios': 'bg-yellow-100 text-yellow-800',
    'Carnes': 'bg-rose-100 text-rose-800',
    'Grãos': 'bg-amber-100 text-amber-800',
    'Temperos': 'bg-orange-100 text-orange-800',
    'Bebidas': 'bg-blue-100 text-blue-800',
    'Congelados': 'bg-cyan-100 text-cyan-800',
    'Outros': 'bg-gray-100 text-gray-800',
  };
  
  const locationColors = {
    'Geladeira': 'bg-blue-100 text-blue-800',
    'Freezer': 'bg-cyan-100 text-cyan-800',
    'Despensa': 'bg-amber-100 text-amber-800',
    'Bancada': 'bg-yellow-100 text-yellow-800',
  };
  
  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="bg-primary-100 p-2 rounded-lg">
            <Package className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{ingredient.name}</h3>
            <p className="text-2xl font-bold text-primary-600">
              {ingredient.quantity} {ingredient.unit}
            </p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(ingredient)}
            className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(ingredient)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {ingredient.category && (
            <span className={`badge ${categoryColors[ingredient.category] || categoryColors['Outros']}`}>
              {ingredient.category}
            </span>
          )}
          {ingredient.location && (
            <span className={`badge ${locationColors[ingredient.location] || 'bg-gray-100 text-gray-800'}`}>
              {ingredient.location}
            </span>
          )}
        </div>
        
        {(isLowStock || isExpiringSoon || isExpired) && (
          <div className="space-y-1">
            {isLowStock && (
              <div className="flex items-center space-x-2 text-yellow-700 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>Estoque baixo (mín: {ingredient.minimum_quantity} {ingredient.unit})</span>
              </div>
            )}
            {isExpired && (
              <div className="flex items-center space-x-2 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>Vencido!</span>
              </div>
            )}
            {isExpiringSoon && !isExpired && (
              <div className="flex items-center space-x-2 text-orange-700 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>Vence em breve</span>
              </div>
            )}
          </div>
        )}
        
        {ingredient.expiry_date && (
          <p className="text-sm text-gray-600">
            Validade: {new Date(ingredient.expiry_date).toLocaleDateString('pt-BR')}
          </p>
        )}
      </div>
    </div>
  );
};

export default IngredientCard;
