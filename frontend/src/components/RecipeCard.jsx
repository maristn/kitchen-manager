import { ChefHat, Clock, Users, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const RecipeCard = ({ recipe, canMake }) => {
  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);
  
  // Check if recipe is vegan (from backend or check ingredients)
  const isVegan = recipe.is_vegan || (
    recipe.ingredients && recipe.ingredients.length > 0 
      ? recipe.ingredients.every(ing => ing.vegan === true)
      : false
  );
  
  return (
    <Link to={`/recipes/${recipe.id}`} className="card hover:shadow-lg transition-all group relative">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-primary-100 p-3 rounded-lg">
            <ChefHat className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
              {recipe.name}
            </h3>
            <div className="flex items-center space-x-3 mt-1 text-sm text-gray-600">
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
        
        {canMake !== undefined && (
          <div>
            {canMake ? (
              <span className="badge-success flex items-center space-x-1">
                <CheckCircle className="w-3 h-3" />
                <span>Pode fazer</span>
              </span>
            ) : (
              <span className="badge-danger flex items-center space-x-1">
                <XCircle className="w-3 h-3" />
                <span>Faltam ingredientes</span>
              </span>
            )}
          </div>
        )}
      </div>
      
      {recipe.instructions && (
        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
          {recipe.instructions}
        </p>
      )}
      
      {recipe.ingredients && recipe.ingredients.length > 0 && (
        <div className="border-t border-gray-200 pt-3">
          <p className="text-xs font-medium text-gray-500 mb-2">
            Ingredientes ({recipe.ingredients.length})
          </p>
          <div className="flex flex-wrap gap-1">
            {recipe.ingredients.slice(0, 3).map((ing, idx) => (
              <span key={idx} className="badge bg-gray-100 text-gray-700 text-xs">
                {ing.ingredient_name}
              </span>
            ))}
            {recipe.ingredients.length > 3 && (
              <span className="badge bg-gray-100 text-gray-700 text-xs">
                +{recipe.ingredients.length - 3} mais
              </span>
            )}
          </div>
        </div>
      )}
      
      {/* Vegan Badge */}
      {isVegan && (
        <div className="absolute bottom-4 right-4">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 border border-green-200 shadow-sm">
            🌱 VEGANO
          </span>
        </div>
      )}
    </Link>
  );
};

export default RecipeCard;
