import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ChefHat, Filter, TrendingUp } from 'lucide-react';
import { historyAPI } from '../services/api';
import Alert from '../components/Alert';

const History = () => {
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [filterDays, setFilterDays] = useState('all'); // all, 7, 30
  
  useEffect(() => {
    loadHistory();
    loadStats();
  }, [filterDays]);
  
  const loadHistory = async () => {
    try {
      const params = {};
      if (filterDays !== 'all') {
        params.days = parseInt(filterDays);
      }
      
      const response = await historyAPI.getAll(params);
      setHistory(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading history:', error);
      showAlert('error', 'Erro ao carregar histórico');
      setLoading(false);
    }
  };
  
  const loadStats = async () => {
    try {
      const response = await historyAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
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
  
  // Group history by date
  const groupedHistory = history.reduce((acc, item) => {
    const date = new Date(item.cooked_at).toLocaleDateString('pt-BR');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(item);
    return acc;
  }, {});
  
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Histórico de Receitas</h1>
        
        {alert && (
          <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
        )}
      </div>
      
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Feitas</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.total_recipes_cooked}
                </p>
              </div>
              <ChefHat className="w-12 h-12 text-gray-300" />
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Esta Semana</p>
                <p className="text-3xl font-bold text-primary-600 mt-1">
                  {stats.cooked_this_week}
                </p>
              </div>
              <Calendar className="w-12 h-12 text-primary-200" />
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Este Mês</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">
                  {stats.cooked_this_month}
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-blue-200" />
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Receitas Únicas</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">
                  {stats.most_cooked_recipes.length}
                </p>
              </div>
              <ChefHat className="w-12 h-12 text-purple-200" />
            </div>
          </div>
        </div>
      )}
      
      {/* Most Cooked Recipes */}
      {stats && stats.most_cooked_recipes.length > 0 && (
        <div className="card mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Receitas Mais Feitas
          </h3>
          <div className="space-y-3">
            {stats.most_cooked_recipes.slice(0, 5).map((recipe) => (
              <Link
                key={recipe.recipe_id}
                to={`/recipes/${recipe.recipe_id}`}
                className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-primary-100 p-2 rounded-lg">
                    <ChefHat className="w-5 h-5 text-primary-600" />
                  </div>
                  <span className="font-medium text-gray-900">{recipe.recipe_name}</span>
                </div>
                <span className="badge bg-primary-100 text-primary-800">
                  {recipe.times_cooked}x
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
      
      {/* Filter */}
      <div className="card mb-6">
        <div className="flex items-center space-x-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filterDays}
            onChange={(e) => setFilterDays(e.target.value)}
            className="input flex-1"
          >
            <option value="all">Todo o período</option>
            <option value="7">Últimos 7 dias</option>
            <option value="30">Últimos 30 dias</option>
          </select>
        </div>
      </div>
      
      {/* History Timeline */}
      {Object.keys(groupedHistory).length === 0 ? (
        <div className="text-center py-12">
          <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma receita feita ainda
          </h3>
          <p className="text-gray-600 mb-4">
            Comece a fazer suas receitas para ver o histórico aqui
          </p>
          <Link to="/recipes" className="btn-primary inline-block">
            Ver Receitas
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedHistory).map(([date, items]) => (
            <div key={date} className="card">
              <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-gray-200">
                <Calendar className="w-5 h-5 text-primary-600" />
                <h3 className="text-lg font-semibold text-gray-900">{date}</h3>
                <span className="badge bg-gray-100 text-gray-700">
                  {items.length} receita{items.length !== 1 ? 's' : ''}
                </span>
              </div>
              
              <div className="space-y-3">
                {items.map((item) => (
                  <Link
                    key={item.id}
                    to={`/recipes/${item.recipe_id}`}
                    className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="bg-primary-100 p-2 rounded-lg">
                          <ChefHat className="w-5 h-5 text-primary-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">
                            {item.recipe_name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {item.servings_made} porções
                          </p>
                          {item.notes && (
                            <p className="text-sm text-gray-700 mt-2 italic">
                              "{item.notes}"
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(item.cooked_at).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
