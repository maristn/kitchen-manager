import { useState, useEffect } from 'react';
import { ShoppingCart, Check, X, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { shoppingAPI, ingredientsAPI } from '../services/api';
import Modal from '../components/Modal';
import Alert from '../components/Alert';

const ShoppingList = () => {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, purchased: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // pending or purchased
  const [alert, setAlert] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [availableIngredients, setAvailableIngredients] = useState([]);
  const [selectedIngredient, setSelectedIngredient] = useState('');
  const [quantity, setQuantity] = useState(100);
  
  useEffect(() => {
    loadItems();
    loadStats();
    loadIngredients();
  }, []);
  
  const loadItems = async () => {
    try {
      const response = await shoppingAPI.getAll();
      setItems(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading shopping list:', error);
      showAlert('error', 'Erro ao carregar lista de compras');
      setLoading(false);
    }
  };
  
  const loadStats = async () => {
    try {
      const response = await shoppingAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };
  
  const loadIngredients = async () => {
    try {
      const response = await ingredientsAPI.getAll();
      setAvailableIngredients(response.data);
    } catch (error) {
      console.error('Error loading ingredients:', error);
    }
  };
  
  const handleCheckLowStock = async () => {
    try {
      const response = await shoppingAPI.checkLowStock();
      showAlert('success', response.data.message);
      loadItems();
      loadStats();
    } catch (error) {
      console.error('Error checking low stock:', error);
      showAlert('error', 'Erro ao verificar estoque baixo');
    }
  };
  
  const handleMarkPurchased = async (item) => {
    try {
      await shoppingAPI.markPurchased(item.id, {
        add_to_stock: true,
        quantity_purchased: item.quantity_needed
      });
      showAlert('success', `${item.ingredient_name} marcado como comprado e adicionado ao estoque`);
      loadItems();
      loadStats();
    } catch (error) {
      console.error('Error marking as purchased:', error);
      showAlert('error', 'Erro ao marcar como comprado');
    }
  };
  
  const handleDelete = async (item) => {
    try {
      await shoppingAPI.delete(item.id);
      showAlert('success', 'Item removido da lista');
      loadItems();
      loadStats();
    } catch (error) {
      console.error('Error deleting item:', error);
      showAlert('error', 'Erro ao remover item');
    }
  };
  
  const handleClearPurchased = async () => {
    if (!window.confirm('Remover todos os itens comprados da lista?')) {
      return;
    }
    
    try {
      await shoppingAPI.clearPurchased();
      showAlert('success', 'Itens comprados removidos');
      loadItems();
      loadStats();
    } catch (error) {
      console.error('Error clearing purchased items:', error);
      showAlert('error', 'Erro ao limpar itens comprados');
    }
  };
  
  const handleAddItem = async () => {
    if (!selectedIngredient) {
      showAlert('error', 'Selecione um ingrediente');
      return;
    }
    
    try {
      await shoppingAPI.add({
        ingredient_id: parseInt(selectedIngredient),
        quantity_needed: quantity
      });
      showAlert('success', 'Item adicionado à lista');
      setShowAddModal(false);
      setSelectedIngredient('');
      setQuantity(100);
      loadItems();
      loadStats();
    } catch (error) {
      console.error('Error adding item:', error);
      showAlert('error', error.response?.data?.error || 'Erro ao adicionar item');
    }
  };
  
  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };
  
  const filteredItems = items.filter(item =>
    activeTab === 'pending' ? !item.purchased : item.purchased
  );
  
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
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Lista de Compras</h1>
            <p className="text-gray-600 mt-1">
              {stats.pending} itens pendentes • {stats.purchased} comprados
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleCheckLowStock}
              className="btn-secondary flex items-center space-x-2"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Verificar Estoque</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Adicionar Item</span>
            </button>
          </div>
        </div>
        
        {alert && (
          <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
        )}
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Itens</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <ShoppingCart className="w-12 h-12 text-gray-300" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pendentes</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
            </div>
            <ShoppingCart className="w-12 h-12 text-yellow-200" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Comprados</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats.purchased}</p>
            </div>
            <Check className="w-12 h-12 text-green-200" />
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="card mb-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'pending'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Pendentes ({stats.pending})
          </button>
          <button
            onClick={() => setActiveTab('purchased')}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'purchased'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Comprados ({stats.purchased})
          </button>
        </div>
        
        {activeTab === 'purchased' && stats.purchased > 0 && (
          <div className="p-4 border-b border-gray-200">
            <button
              onClick={handleClearPurchased}
              className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Limpar itens comprados</span>
            </button>
          </div>
        )}
        
        {/* Items List */}
        <div className="divide-y divide-gray-200">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {activeTab === 'pending' ? 'Lista vazia' : 'Nenhum item comprado'}
              </h3>
              <p className="text-gray-600">
                {activeTab === 'pending'
                  ? 'Adicione itens manualmente ou verifique o estoque'
                  : 'Marque itens como comprados para vê-los aqui'}
              </p>
            </div>
          ) : (
            filteredItems.map(item => (
              <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    {activeTab === 'pending' && (
                      <button
                        onClick={() => handleMarkPurchased(item)}
                        className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                      >
                        <Check className="w-5 h-5 text-green-600" />
                      </button>
                    )}
                    
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.ingredient_name}</h4>
                      <p className="text-sm text-gray-600">
                        {item.quantity_needed} {item.ingredient_unit}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Adicionado em: {new Date(item.added_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {item.purchased && item.purchased_at && (
                      <span className="badge-success">
                        Comprado em {new Date(item.purchased_at).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                    <button
                      onClick={() => handleDelete(item)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Add Item Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Adicionar Item à Lista"
      >
        <div className="space-y-4">
          <div>
            <label className="label">Ingrediente</label>
            <select
              value={selectedIngredient}
              onChange={(e) => setSelectedIngredient(e.target.value)}
              className="input"
            >
              <option value="">Selecione um ingrediente...</option>
              {availableIngredients.map(ing => (
                <option key={ing.id} value={ing.id}>
                  {ing.name} (atual: {ing.quantity} {ing.unit})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="label">Quantidade Necessária</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
              className="input"
              min="0"
              step="0.01"
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button onClick={handleAddItem} className="btn-primary flex-1">
              Adicionar
            </button>
            <button onClick={() => setShowAddModal(false)} className="btn-secondary">
              Cancelar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ShoppingList;
