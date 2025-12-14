import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, AlertCircle, Package, ArrowUpDown, X, Check } from 'lucide-react';
import { ingredientsAPI } from '../services/api';
import Alert from '../components/Alert';

const Ingredients = () => {
  const [ingredients, setIngredients] = useState([]);
  const [filteredIngredients, setFilteredIngredients] = useState([]);
  const [zeroQuantityIngredients, setZeroQuantityIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [editingData, setEditingData] = useState({});
  const [showEmojiPicker, setShowEmojiPicker] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newIngredient, setNewIngredient] = useState({
    name: '',
    quantity: 0,
    unit: '',
    category: '',
    location: '',
    emoji: '',
    vegan: false,
    expiry_date: '',
    minimum_quantity: 0,
  });
  const [selectedIds, setSelectedIds] = useState([]);
  const [alert, setAlert] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  
  useEffect(() => {
    loadIngredients();
    loadFilters();
  }, []);
  
  useEffect(() => {
    filterIngredients();
  }, [ingredients, searchTerm, categoryFilter, locationFilter, sortField, sortDirection]);
  
  useEffect(() => {
    console.log('newIngredient state changed:', newIngredient);
  }, [newIngredient]);
  
  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside emoji picker and emoji button
      const emojiPicker = document.querySelector('[data-emoji-picker]');
      const emojiButton = document.querySelector('[data-emoji-button]');
      
      if (showEmojiPicker && 
          emojiPicker && 
          !emojiPicker.contains(event.target) && 
          emojiButton &&
          !emojiButton.contains(event.target)) {
        setShowEmojiPicker(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker]);
  
  const loadIngredients = async () => {
    try {
      const response = await ingredientsAPI.getAll();
      setIngredients(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading ingredients:', error);
      showAlert('error', 'Erro ao carregar ingredientes');
      setLoading(false);
    }
  };
  
  const loadFilters = async () => {
    try {
      const [catResponse, locResponse] = await Promise.all([
        ingredientsAPI.getCategories(),
        ingredientsAPI.getLocations()
      ]);
      setCategories(catResponse.data);
      setLocations(locResponse.data);
    } catch (error) {
      console.error('Error loading filters:', error);
    }
  };
  
  const filterIngredients = () => {
    let filtered = [...ingredients];
    
    // Separate zero quantity ingredients (not unlimited)
    const zeroQty = filtered.filter(ing => ing.quantity === 0 && !ing.unlimited);
    
    // Filter out ingredients with quantity 0, BUT keep unlimited ingredients (like water)
    filtered = filtered.filter(ing => ing.quantity > 0 || ing.unlimited);
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(ing =>
        ing.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (categoryFilter) {
      filtered = filtered.filter(ing => ing.category === categoryFilter);
    }
    
    if (locationFilter) {
      filtered = filtered.filter(ing => ing.location === locationFilter);
    }
    
    // Sort main list
    filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      // Handle null/undefined
      if (!aVal) aVal = '';
      if (!bVal) bVal = '';
      
      // String comparison
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
    
    // Sort zero quantity list by name
    zeroQty.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
    
    setFilteredIngredients(filtered);
    setZeroQuantityIngredients(zeroQty);
  };
  
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const handleAdd = () => {
    setIsAddingNew(true);
    setNewIngredient({
      name: '',
      quantity: 0,
      unit: '',
      category: '',
      location: '',
      emoji: '',
      vegan: false,
      expiry_date: '',
      minimum_quantity: 0,
    });
  };
  
  const handleCellClick = (ingredient, field) => {
    console.log('handleCellClick chamado:', { ingredientId: ingredient.id, field });
    if (editingId && editingId !== ingredient.id) {
      // Auto-save previous edit
      handleSaveEdit({ id: editingId });
    }
    setEditingId(ingredient.id);
    setEditingField(field);
    setEditingData({ ...ingredient });
    console.log('Edição iniciada:', { editingId: ingredient.id, editingField: field });
  };
  
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingField(null);
    setEditingData({});
  };
  
  const handleCancelNew = () => {
    setIsAddingNew(false);
    setNewIngredient({
      name: '',
      quantity: 0,
      unit: '',
      category: '',
      location: '',
      emoji: '',
      vegan: false,
      expiry_date: '',
      minimum_quantity: 0,
    });
  };
  
  const handleSaveEdit = async (ingredient, dataToSave = null) => {
    try {
      const finalData = dataToSave || editingData;
      await ingredientsAPI.update(ingredient.id, finalData);
      showAlert('success', 'Ingrediente atualizado com sucesso');
      
      // Aguardar recarregamento dos dados antes de resetar o estado de edição
      await loadIngredients();
      await loadFilters();
      
      // Agora resetar o estado de edição com os dados já atualizados
      setEditingId(null);
      setEditingField(null);
      setEditingData({});
    } catch (error) {
      console.error('Error updating ingredient:', error);
      showAlert('error', error.response?.data?.error || 'Erro ao atualizar ingrediente');
    }
  };
  
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredIngredients.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredIngredients.map(i => i.id));
    }
  };
  
  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };
  
  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    
    if (!window.confirm(`Tem certeza que deseja deletar ${selectedIds.length} ingrediente(s)?`)) {
      return;
    }
    
    try {
      await Promise.all(selectedIds.map(id => ingredientsAPI.delete(id)));
      showAlert('success', `${selectedIds.length} ingrediente(s) deletado(s) com sucesso`);
      setSelectedIds([]);
      loadIngredients();
    } catch (error) {
      console.error('Error deleting ingredients:', error);
      showAlert('error', 'Erro ao deletar ingredientes');
    }
  };
  
  const handleSaveNew = async () => {
    if (!newIngredient.name.trim()) {
      showAlert('error', 'Nome é obrigatório');
      return;
    }
    
    if (!newIngredient.unit) {
      showAlert('error', 'Unidade de medida é obrigatória');
      return;
    }
    
    // Check if ingredient is water (case insensitive) and mark as unlimited
    const isWater = newIngredient.name.toLowerCase().trim() === 'água';
    
    const dataToSave = {
      ...newIngredient,
      unlimited: isWater,
      quantity: isWater ? 999999 : newIngredient.quantity,
    };
    
    try {
      await ingredientsAPI.create(dataToSave);
      showAlert('success', isWater ? '💧 Água adicionada como ingrediente ilimitado!' : 'Ingrediente adicionado com sucesso');
      setIsAddingNew(false);
      setNewIngredient({
        name: '',
        quantity: 0,
        unit: '',
        category: '',
        location: '',
        emoji: '',
        vegan: false,
        expiry_date: '',
        minimum_quantity: 0,
      });
      loadIngredients();
      loadFilters();
    } catch (error) {
      console.error('Error creating ingredient:', error);
      showAlert('error', error.response?.data?.error || 'Erro ao adicionar ingrediente');
    }
  };
  
  const handleDelete = async (ingredient) => {
    if (!window.confirm(`Tem certeza que deseja deletar "${ingredient.name}"?`)) {
      return;
    }
    
    try {
      await ingredientsAPI.delete(ingredient.id);
      showAlert('success', 'Ingrediente deletado com sucesso');
      loadIngredients();
    } catch (error) {
      console.error('Error deleting ingredient:', error);
      showAlert('error', 'Erro ao deletar ingrediente');
    }
  };
  
  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };
  
  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setLocationFilter('');
  };
  
  const getStatusBadge = (ingredient) => {
    const isLowStock = ingredient.quantity <= ingredient.minimum_quantity && ingredient.minimum_quantity > 0;
    const isExpiringSoon = ingredient.expiry_date && new Date(ingredient.expiry_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const isExpired = ingredient.expiry_date && new Date(ingredient.expiry_date) < new Date();
    
    if (isExpired) {
      return <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-100/80 text-red-800 border border-red-200/50 backdrop-blur-sm shadow-soft">
        <AlertCircle className="w-3 h-3 mr-1.5" />
        Vencido
      </span>;
    }
    if (isExpiringSoon) {
      return <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold bg-orange-100/80 text-orange-800 border border-orange-200/50 backdrop-blur-sm shadow-soft">
        <AlertCircle className="w-3 h-3 mr-1.5" />
        Vence em breve
      </span>;
    }
    if (isLowStock) {
      return <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold bg-yellow-100/80 text-yellow-800 border border-yellow-200/50 backdrop-blur-sm shadow-soft">
        <AlertCircle className="w-3 h-3 mr-1.5" />
        Estoque baixo
      </span>;
    }
    return null;
  };
  
  const categoryColors = {
    'Vegetais': 'bg-green-100/80 text-green-800 border-green-200/50',
    'Frutas': 'bg-red-100/80 text-red-800 border-red-200/50',
    'Laticínios': 'bg-yellow-100/80 text-yellow-800 border-yellow-200/50',
    'Carnes': 'bg-rose-100/80 text-rose-800 border-rose-200/50',
    'Grãos': 'bg-amber-100/80 text-amber-800 border-amber-200/50',
    'Temperos': 'bg-orange-100/80 text-orange-800 border-orange-200/50',
    'Bebidas': 'bg-blue-100/80 text-blue-800 border-blue-200/50',
    'Congelados': 'bg-cyan-100/80 text-cyan-800 border-cyan-200/50',
    'Outros': 'bg-gray-100/80 text-gray-800 border-gray-200/50',
  };
  
  const locationIcons = {
    'Geladeira': '🧊',
    'Freezer': '❄️',
    'Despensa': '🏺',
    'Bancada': '🪴',
  };
  
  const categoryEmojis = {
    'Vegetais': '🥬',
    'Frutas': '🍎',
    'Laticínios': '🥛',
    'Carnes': '🥩',
    'Grãos': '🌾',
    'Temperos': '🌿',
    'Bebidas': '🥤',
    'Congelados': '🧊',
    'Outros': '📦',
  };
  
  const units = ['g', 'kg', 'ml', 'L', 'unidade(s)', 'xícara(s)', 'colher(es)'];
  const categoryOptions = ['Vegetais', 'Frutas', 'Laticínios', 'Carnes', 'Grãos', 'Temperos', 'Bebidas', 'Congelados', 'Outros'];
  const locationOptions = ['Geladeira', 'Freezer', 'Despensa', 'Bancada'];
  
  const popularEmojis = [
    '🥬', '🍎', '🥛', '🥩', '🌾', '🌿', '🥤', '🧊', '📦',
    '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍒', '🍑',
    '🥭', '🍍', '🥥', '🥝', '🍅', '🥑', '🥦', '🥒', '🌶️',
    '🫑', '🌽', '🥕', '🧄', '🧅', '🥔', '🍠', '🥐', '🥖',
    '🍞', '🥨', '🧀', '🥚', '🍳', '🥓', '🍗', '🍖', '🌭',
    '🍔', '🍟', '🍕', '🥪', '🧆', '🌮', '🌯', '🥗', '🥘',
    '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🦐', '🍤', '🦞',
    '🦀', '🐟', '🥠', '🍢', '🍡', '🍧', '🍨', '🍦', '🥧',
    '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩',
    '🍪', '🌰', '🥜', '🍯', '🍼', '☕', '🧃', '🧋', '🍵',
    '🍶', '🍺', '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '🧂',
    '🧈', '🥯', '🫓', '🍽️'
  ];
  
  const getIngredientEmoji = (ingredient) => {
    // Prioriza o emoji salvo pelo usuário, senão usa o da categoria
    return ingredient.emoji || categoryEmojis[ingredient.category] || '🍽️';
  };
  
  const updateEditingField = (field, value) => {
    console.log('updateEditingField chamado:', { field, value });
    setEditingData(prev => {
      const updated = { ...prev, [field]: value };
      console.log('editingData atualizado:', updated);
      return updated;
    });
  };
  
  const updateNewField = (field, value) => {
    console.log('updateNewField chamado:', { field, value });
    setNewIngredient(prev => {
      const updated = { ...prev, [field]: value };
      console.log('newIngredient atualizado:', updated);
      return updated;
    });
  };
  
  const handleEmojiSelect = async (ingredientId, emoji) => {
    try {
      const ingredient = ingredients.find(i => i.id === ingredientId);
      await ingredientsAPI.update(ingredientId, { ...ingredient, emoji });
      setShowEmojiPicker(null);
      loadIngredients();
      showAlert('success', 'Emoji atualizado!');
    } catch (error) {
      console.error('Error updating emoji:', error);
      showAlert('error', 'Erro ao atualizar emoji');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-600 border-t-transparent absolute top-0 left-0"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-br from-gray-900 via-gray-800 to-gray-600 bg-clip-text text-transparent">
            Ingredientes
          </h1>
          <p className="text-lg text-gray-600 font-medium">
            Gerencie seu estoque de ingredientes
          </p>
        </div>
        {selectedIds.length > 0 && (
          <button 
            onClick={handleDeleteSelected}
            className="inline-flex items-center justify-center px-5 py-3.5 text-base font-semibold rounded-2xl text-white bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-4 focus:ring-red-500/30 shadow-soft-md hover:shadow-soft-lg transition-all duration-300 active:scale-[0.98]"
          >
            <Trash2 className="w-5 h-5 mr-2" />
            Excluir ({selectedIds.length})
          </button>
        )}
      </div>
      
      {alert && (
        <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
      )}
      
      {/* Stats Cards */}
      {filteredIngredients.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="group bg-white/80 backdrop-blur-xl rounded-3xl p-7 border border-blue-200/50 shadow-soft hover:shadow-soft-md transition-all duration-300 hover:scale-[1.02] hover:border-blue-300/50">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-blue-600/80">Total</p>
              <p className="text-4xl font-bold text-blue-600">{filteredIngredients.length}</p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200/50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="group bg-white/80 backdrop-blur-xl rounded-3xl p-7 border border-green-200/50 shadow-soft hover:shadow-soft-md transition-all duration-300 hover:scale-[1.02] hover:border-green-300/50">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-green-600/80">Em Estoque</p>
              <p className="text-4xl font-bold text-green-600">
                {filteredIngredients.filter(i => i.quantity > 0 || i.unlimited).length}
              </p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200/50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Package className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="group bg-white/80 backdrop-blur-xl rounded-3xl p-7 border border-yellow-200/50 shadow-soft hover:shadow-soft-md transition-all duration-300 hover:scale-[1.02] hover:border-yellow-300/50">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-yellow-600/80">Estoque Zerado</p>
              <p className="text-4xl font-bold text-yellow-600">
                {filteredIngredients.filter(i => i.quantity === 0 && !i.unlimited).length}
              </p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-100 to-yellow-200/50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>
        
        <div className="group bg-white/80 backdrop-blur-xl rounded-3xl p-7 border border-red-200/50 shadow-soft hover:shadow-soft-md transition-all duration-300 hover:scale-[1.02] hover:border-red-300/50">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-red-600/80">Vencidos/Vencendo</p>
              <p className="text-4xl font-bold text-red-600">
                {filteredIngredients.filter(i => i.expiry_date && new Date(i.expiry_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)).length}
              </p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200/50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>
      </div>
      )}
      
      {/* Filters */}
      {filteredIngredients.length > 0 && (
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-soft border border-gray-200/50 p-7">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-primary-500 transition-colors" />
              <input
                type="text"
                placeholder="Buscar por nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-12 py-3.5 bg-gray-50/50 border border-gray-200/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 focus:bg-white transition-all duration-200 text-gray-900 placeholder:text-gray-400"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-all active:scale-95"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 focus:bg-white transition-all duration-200 text-gray-900 cursor-pointer hover:border-gray-300/50"
            >
              <option value="">Todas categorias</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          <div>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 focus:bg-white transition-all duration-200 text-gray-900 cursor-pointer hover:border-gray-300/50"
            >
              <option value="">Todos locais</option>
              {locations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
        </div>
        
        {(searchTerm || categoryFilter || locationFilter) && (
          <div className="mt-5 flex items-center justify-between pt-5 border-t border-gray-200/50">
            <span className="text-sm text-gray-600 font-medium">
              <strong className="font-bold text-gray-900">{filteredIngredients.length}</strong> {filteredIngredients.length === 1 ? 'ingrediente' : 'ingredientes'} em estoque
            </span>
            <button
              onClick={clearFilters}
              className="text-sm text-primary-600 hover:text-primary-700 font-semibold flex items-center space-x-1.5 px-3 py-1.5 rounded-xl hover:bg-primary-50 transition-all active:scale-95"
            >
              <X className="w-4 h-4" />
              <span>Limpar filtros</span>
            </button>
          </div>
        )}
      </div>
      )}
      
      {/* Ingredients List */}
      {filteredIngredients.length === 0 && !isAddingNew && !searchTerm && !categoryFilter && !locationFilter ? (
        // Empty state - no ingredients at all
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-soft border border-gray-200/50 p-20 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary-100 to-primary-200/50 rounded-3xl mb-6 shadow-soft">
              <Package className="w-12 h-12 text-primary-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Seu estoque está vazio
            </h2>
            <p className="text-gray-600 mb-10 text-lg font-medium leading-relaxed">
              {ingredients.length > 0 
                ? 'Todos os seus ingredientes estão com estoque zerado. Adicione quantidade aos existentes ou crie novos ingredientes.'
                : 'Comece adicionando seus ingredientes para gerenciar seu estoque, controlar validades e criar listas de compras automaticamente.'
              }
            </p>
            <button
              onClick={handleAdd}
              className="inline-flex items-center px-8 py-4 text-base font-semibold rounded-2xl text-white bg-gradient-to-br from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-soft-lg hover:shadow-soft-lg transition-all duration-300 active:scale-[0.98] group"
            >
              <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              Adicionar Primeiro Ingrediente
            </button>
            
            <div className="mt-12 grid grid-cols-3 gap-6 text-left">
              <div className="bg-gradient-to-br from-green-50/80 to-green-100/30 backdrop-blur-sm rounded-2xl p-5 border border-green-200/50">
                <div className="text-3xl mb-3">🥬</div>
                <h4 className="font-semibold text-gray-900 mb-1">Organize</h4>
                <p className="text-sm text-gray-600">Categorize por tipo e local de armazenamento</p>
              </div>
              <div className="bg-gradient-to-br from-yellow-50/80 to-yellow-100/30 backdrop-blur-sm rounded-2xl p-5 border border-yellow-200/50">
                <div className="text-3xl mb-3">⏰</div>
                <h4 className="font-semibold text-gray-900 mb-1">Controle</h4>
                <p className="text-sm text-gray-600">Acompanhe validades e estoques mínimos</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50/80 to-blue-100/30 backdrop-blur-sm rounded-2xl p-5 border border-blue-200/50">
                <div className="text-3xl mb-3">🛒</div>
                <h4 className="font-semibold text-gray-900 mb-1">Automatize</h4>
                <p className="text-sm text-gray-600">Liste compras quando o estoque baixar</p>
              </div>
            </div>
          </div>
        </div>
      ) : filteredIngredients.length === 0 && !isAddingNew ? (
        // Filtered state - has ingredients but filters return nothing
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-soft border border-gray-200/50 p-16 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200/50 rounded-3xl mb-5 shadow-soft">
            <Search className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">
            Nenhum ingrediente encontrado
          </h3>
          <p className="text-gray-600 mb-8 text-base font-medium max-w-md mx-auto">
            Nenhum ingrediente corresponde aos filtros aplicados.<br />
            Tente ajustar sua busca ou limpar os filtros.
          </p>
          <button
            onClick={clearFilters}
            className="inline-flex items-center px-6 py-3 text-sm font-semibold rounded-2xl text-primary-600 bg-primary-50 hover:bg-primary-100 border border-primary-200/50 shadow-soft hover:shadow-soft-md transition-all duration-300 active:scale-[0.98]"
          >
            <X className="w-4 h-4 mr-2" />
            Limpar Filtros
          </button>
        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-soft border border-gray-200/50 overflow-hidden">
          {/* Table Header */}
          <div className="bg-gradient-to-br from-gray-50/80 to-gray-100/30 backdrop-blur-sm border-b border-gray-200/50 px-6 py-4">
            <div className="grid grid-cols-12 gap-4 text-xs font-bold text-gray-600 uppercase tracking-wide items-center">
              <div className="col-span-1 flex items-center">
                <input
                  type="checkbox"
                  checked={selectedIds.length === filteredIngredients.length && filteredIngredients.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 text-primary-600 bg-white border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
                />
              </div>
              <div className="col-span-2 flex items-center cursor-pointer hover:text-gray-900 transition-all group" onClick={() => handleSort('name')}>
                Nome
                <ArrowUpDown className="w-3.5 h-3.5 ml-2 opacity-50 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="col-span-2 flex items-center cursor-pointer hover:text-gray-900 transition-all group" onClick={() => handleSort('quantity')}>
                Quantidade
                <ArrowUpDown className="w-3.5 h-3.5 ml-2 opacity-50 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="col-span-1 flex items-center cursor-pointer hover:text-gray-900 transition-all group" onClick={() => handleSort('unit')}>
                Medida
                <ArrowUpDown className="w-3.5 h-3.5 ml-2 opacity-50 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="col-span-2 flex items-center cursor-pointer hover:text-gray-900 transition-all group" onClick={() => handleSort('category')}>
                Categoria
                <ArrowUpDown className="w-3.5 h-3.5 ml-2 opacity-50 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="col-span-2 flex items-center cursor-pointer hover:text-gray-900 transition-all group" onClick={() => handleSort('location')}>
                Local
                <ArrowUpDown className="w-3.5 h-3.5 ml-2 opacity-50 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="col-span-2">Validade</div>
            </div>
          </div>
          
          {/* Table Body */}
          <div className="divide-y divide-gray-100/50">
            {/* New Ingredient Row */}
            {isAddingNew && (
              <div className="px-6 py-4 bg-primary-50/30 border-l-4 border-primary-500">
                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* Checkbox placeholder */}
                  <div className="col-span-1"></div>
                  
                  {/* Name */}
                  <div className="col-span-2 flex items-center gap-3">
                    <div className="relative">
                      <div 
                        data-emoji-button
                        className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200/50 rounded-2xl flex items-center justify-center text-2xl shadow-soft cursor-pointer hover:scale-110 hover:shadow-soft-md transition-all"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowEmojiPicker(showEmojiPicker === 'new' ? null : 'new');
                        }}
                        title="Clique para escolher um emoji"
                      >
                        {newIngredient.emoji || '🍽️'}
                      </div>
                      
                      {/* Emoji Picker for new ingredient */}
                      {showEmojiPicker === 'new' && (
                        <div 
                          data-emoji-picker
                          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[9999] bg-white/95 backdrop-blur-xl rounded-2xl shadow-soft-lg border border-gray-200/50 p-4 w-72"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-semibold text-gray-700">Escolha um emoji</p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowEmojiPicker(null);
                              }}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="grid grid-cols-8 gap-1 max-h-48 overflow-y-auto">
                            {popularEmojis.map((emoji, idx) => (
                              <button
                                key={idx}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateNewField('emoji', emoji);
                                  setShowEmojiPicker(null);
                                }}
                                className="w-8 h-8 text-xl hover:bg-primary-50 rounded-lg transition-colors flex items-center justify-center"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <input
                      type="text"
                      placeholder="Nome do ingrediente"
                      value={newIngredient.name}
                      onChange={(e) => updateNewField('name', e.target.value)}
                      className="flex-1 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                      autoFocus
                    />
                  </div>
                  
                  {/* Quantity */}
                  <div className="col-span-2">
                    <input
                      type="number"
                      placeholder="Qtd"
                      value={newIngredient.quantity || ''}
                      onChange={(e) => updateNewField('quantity', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                      className="w-full px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 bg-white border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  
                  {/* Unit */}
                  <div className="col-span-1">
                    <select
                      value={newIngredient.unit || ''}
                      onChange={(e) => {
                        const selectedValue = e.target.value;
                        console.log('onChange disparado:', selectedValue);
                        console.log('Estado atual antes:', newIngredient.unit);
                        updateNewField('unit', selectedValue);
                      }}
                      className="w-full px-3 py-2 text-sm font-medium text-gray-900 bg-white border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 cursor-pointer"
                    >
                      <option value="">-</option>
                      {units.map(u => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Category */}
                  <div className="col-span-2">
                    <select
                      value={newIngredient.category}
                      onChange={(e) => updateNewField('category', e.target.value)}
                      className="w-full px-3 py-2 text-xs text-gray-900 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                    >
                      <option value="">Categoria</option>
                      {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  
                  {/* Location */}
                  <div className="col-span-2">
                    <select
                      value={newIngredient.location}
                      onChange={(e) => updateNewField('location', e.target.value)}
                      className="w-full px-3 py-2 text-xs text-gray-900 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                    >
                      <option value="">Local</option>
                      {locationOptions.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                  
                  {/* Expiry Date */}
                  <div className="col-span-2 flex items-center gap-2">
                    <input
                      type="date"
                      value={newIngredient.expiry_date}
                      onChange={(e) => updateNewField('expiry_date', e.target.value)}
                      className="flex-1 px-3 py-2 text-xs text-gray-900 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                    />
                    <div className="flex space-x-1.5">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleSaveNew();
                        }}
                        className="p-2 text-white bg-green-500 hover:bg-green-600 rounded-xl transition-all active:scale-95 shadow-soft cursor-pointer"
                        title="Salvar"
                        type="button"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleCancelNew}
                        className="p-2 text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-xl transition-all active:scale-95 shadow-soft"
                        title="Cancelar"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Existing Ingredients */}
            {filteredIngredients.map((ingredient, index) => {
              const isEditing = editingId === ingredient.id;
              const data = isEditing ? editingData : ingredient;
              const isSelected = selectedIds.includes(ingredient.id);
              
              return (
                <div
                  key={ingredient.id}
                  className={`px-6 py-4 transition-all duration-200 ${
                    isSelected ? 'bg-primary-50/20' : ''
                  } ${
                    isEditing 
                      ? 'bg-blue-50/30 border-l-4 border-blue-500' 
                      : 'hover:bg-gray-50/50'
                  }`}
                  style={{
                    animation: `fadeIn 0.4s ease-out ${index * 0.03}s both`
                  }}
                >
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* Checkbox */}
                    <div className="col-span-1">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(ingredient.id)}
                        className="w-4 h-4 text-primary-600 bg-white border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    
                    {/* Name */}
                    <div 
                      className="col-span-2 cursor-text"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isEditing) {
                          console.log('Clique no nome');
                          handleCellClick(ingredient, 'name');
                        }
                      }}
                    >
                      {isEditing && editingField === 'name' ? (
                        <input
                          type="text"
                          value={data.name}
                          onChange={(e) => updateEditingField('name', e.target.value)}
                          onBlur={() => handleSaveEdit(ingredient)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(ingredient);
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                          className="w-full px-3 py-2 text-sm text-gray-900 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                          autoFocus
                        />
                      ) : (
                        <div className="flex items-center space-x-3 hover:bg-blue-50/30 rounded-xl px-2 py-1.5 -mx-2 transition-colors">
                          <div className="relative">
                            <div 
                              data-emoji-button
                              className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200/50 rounded-2xl flex items-center justify-center text-2xl shadow-soft transition-all duration-200 cursor-pointer hover:scale-110 hover:shadow-soft-md"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowEmojiPicker(showEmojiPicker === ingredient.id ? null : ingredient.id);
                              }}
                              title="Clique para mudar o emoji"
                            >
                              {getIngredientEmoji(ingredient)}
                            </div>
                            
                            {/* Emoji Picker */}
                            {showEmojiPicker === ingredient.id && (
                              <div 
                                data-emoji-picker
                                className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[9999] bg-white/95 backdrop-blur-xl rounded-2xl shadow-soft-lg border border-gray-200/50 p-4 w-72"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <p className="text-xs font-semibold text-gray-700">Escolha um emoji</p>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setShowEmojiPicker(null);
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                                <div className="grid grid-cols-8 gap-1 max-h-48 overflow-y-auto">
                                  {popularEmojis.map((emoji, idx) => (
                                    <button
                                      key={idx}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEmojiSelect(ingredient.id, emoji);
                                      }}
                                      className="w-8 h-8 text-xl hover:bg-primary-50 rounded-lg transition-colors flex items-center justify-center"
                                    >
                                      {emoji}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{ingredient.name}</p>
                            {ingredient.expiry_date && (
                              <p className="text-xs text-gray-500 font-medium mt-0.5">
                                Vence: {new Date(ingredient.expiry_date).toLocaleDateString('pt-BR')}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Quantity */}
                    <div 
                      className="col-span-2 cursor-text"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isEditing && !ingredient.unlimited) {
                          console.log('Clique na quantidade');
                          handleCellClick(ingredient, 'quantity');
                        }
                      }}
                    >
                      {isEditing && editingField === 'quantity' && !ingredient.unlimited ? (
                        <input
                          type="number"
                          value={data.quantity}
                          onChange={(e) => updateEditingField('quantity', parseFloat(e.target.value) || 0)}
                          onBlur={() => handleSaveEdit(ingredient)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(ingredient);
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                          className="w-full px-3 py-2 text-sm text-gray-900 bg-white border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                          step="0.01"
                          min="0"
                          autoFocus
                        />
                      ) : (
                        <div className={`hover:bg-blue-50/30 rounded-xl px-2 py-1.5 -mx-2 transition-colors ${ingredient.unlimited ? 'cursor-default' : ''}`}>
                          {ingredient.unlimited ? (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200/50 rounded-xl">
                              <span className="text-lg">♾️</span>
                              <span className="text-xs font-bold text-blue-600">Ilimitado</span>
                            </div>
                          ) : (
                            <>
                              <span className="text-lg font-bold text-gray-900">{ingredient.quantity}</span>
                              {ingredient.minimum_quantity > 0 && (
                                <p className="text-xs text-gray-500 font-medium mt-0.5">
                                  Mín: {ingredient.minimum_quantity}
                                </p>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Unit */}
                    <div 
                      className="col-span-1 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isEditing && !ingredient.unlimited) {
                          console.log('Clique na medida');
                          handleCellClick(ingredient, 'unit');
                        }
                      }}
                    >
                      {isEditing && editingField === 'unit' && !ingredient.unlimited ? (
                        <select
                          value={data.unit || ''}
                          onChange={(e) => {
                            const selectedValue = e.target.value;
                            const updatedData = { ...editingData, unit: selectedValue };
                            setEditingData(updatedData);
                            // Passar os dados atualizados diretamente
                            handleSaveEdit(ingredient, updatedData);
                          }}
                          onFocus={(e) => {
                            // Forçar abertura do dropdown no foco
                            setTimeout(() => {
                              if (e.target.showPicker) {
                                try {
                                  e.target.showPicker();
                                } catch (err) {
                                  e.target.click();
                                }
                              } else {
                                e.target.click();
                              }
                            }, 100);
                          }}
                          className="w-full px-3 py-2 text-sm font-medium text-gray-900 bg-white border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 cursor-pointer"
                          autoFocus
                        >
                          {units.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                      ) : (
                        <div className="hover:bg-blue-50/30 rounded-xl px-2 py-1.5 -mx-2 transition-colors">
                          {ingredient.unlimited ? (
                            <span className="text-xs text-gray-400">-</span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                              {ingredient.unit}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Category */}
                    <div 
                      className="col-span-2 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isEditing) {
                          console.log('Clique na categoria');
                          handleCellClick(ingredient, 'category');
                        }
                      }}
                    >
                      {isEditing && editingField === 'category' ? (
                        <select
                          value={data.category}
                          onChange={(e) => {
                            const selectedValue = e.target.value;
                            const updatedData = { ...editingData, category: selectedValue };
                            setEditingData(updatedData);
                            // Passar os dados atualizados diretamente
                            handleSaveEdit(ingredient, updatedData);
                          }}
                          onFocus={(e) => {
                            // Forçar abertura do dropdown no foco
                            setTimeout(() => {
                              if (e.target.showPicker) {
                                try {
                                  e.target.showPicker();
                                } catch (err) {
                                  e.target.click();
                                }
                              } else {
                                e.target.click();
                              }
                            }, 100);
                          }}
                          className="w-full px-3 py-2 text-xs text-gray-900 bg-white border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer"
                          autoFocus
                        >
                          <option value="">Selecione...</option>
                          {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      ) : (
                        <div className="hover:bg-blue-50/30 rounded-xl px-2 py-1.5 -mx-2 transition-colors">
                          {ingredient.category ? (
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold border backdrop-blur-sm shadow-soft ${categoryColors[ingredient.category] || categoryColors['Outros']}`}>
                              {ingredient.category}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">Sem categoria</span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Location */}
                    <div 
                      className="col-span-2 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isEditing) {
                          console.log('Clique no local');
                          handleCellClick(ingredient, 'location');
                        }
                      }}
                    >
                      {isEditing && editingField === 'location' ? (
                        <select
                          value={data.location}
                          onChange={(e) => {
                            const selectedValue = e.target.value;
                            const updatedData = { ...editingData, location: selectedValue };
                            setEditingData(updatedData);
                            // Passar os dados atualizados diretamente
                            handleSaveEdit(ingredient, updatedData);
                          }}
                          onFocus={(e) => {
                            // Forçar abertura do dropdown no foco
                            setTimeout(() => {
                              if (e.target.showPicker) {
                                try {
                                  e.target.showPicker();
                                } catch (err) {
                                  // Fallback para navegadores que não suportam showPicker
                                  e.target.click();
                                }
                              } else {
                                e.target.click();
                              }
                            }, 100);
                          }}
                          className="w-full px-3 py-2 text-xs text-gray-900 bg-white border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer"
                          autoFocus
                        >
                          <option value="">Selecione...</option>
                          {locationOptions.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                      ) : (
                        <div className="hover:bg-blue-50/30 rounded-xl px-2 py-1.5 -mx-2 transition-colors">
                          {ingredient.location ? (
                            <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-100/80 text-gray-800 border border-gray-200/50 backdrop-blur-sm shadow-soft">
                              <span className="mr-1.5">{locationIcons[ingredient.location] || '📦'}</span>
                              {ingredient.location}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">Sem local</span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Expiry Date */}
                    <div 
                      className="col-span-2 cursor-text"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isEditing) {
                          console.log('Clique na validade');
                          handleCellClick(ingredient, 'expiry_date');
                        }
                      }}
                    >
                      {isEditing && editingField === 'expiry_date' ? (
                        <input
                          type="date"
                          value={data.expiry_date || ''}
                          onChange={(e) => updateEditingField('expiry_date', e.target.value)}
                          onBlur={() => handleSaveEdit(ingredient)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(ingredient);
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                          className="w-full px-3 py-2 text-xs bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                          autoFocus
                        />
                      ) : (
                        <div className="hover:bg-blue-50/30 rounded-xl px-2 py-1.5 -mx-2 transition-colors">
                          {ingredient.expiry_date ? (
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-gray-600 font-medium">
                                {new Date(ingredient.expiry_date).toLocaleDateString('pt-BR')}
                              </span>
                              {getStatusBadge(ingredient)}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">Sem validade</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Novo Ingrediente Button - Bottom */}
      {filteredIngredients.length > 0 && !isAddingNew && (
        <div className="flex justify-center mt-8">
          <button 
            onClick={handleAdd}
            className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold rounded-2xl text-white bg-gradient-to-br from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-500/30 shadow-soft-md hover:shadow-soft-lg transition-all duration-300 active:scale-[0.98] group"
          >
            <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            Novo Ingrediente
          </button>
        </div>
      )}

      {/* Zero Quantity Ingredients Section */}
      {zeroQuantityIngredients.length > 0 && (
        <div className="mt-12 space-y-4">
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6 text-gray-400" />
            <h2 className="text-2xl font-bold text-gray-600">
              Ingredientes sem Estoque
            </h2>
            <span className="px-3 py-1 text-sm font-semibold rounded-full bg-gray-100 text-gray-600">
              {zeroQuantityIngredients.length}
            </span>
          </div>
          
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-soft border-2 border-dashed border-gray-300/50 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-br from-gray-50/80 to-gray-100/30 backdrop-blur-sm border-b border-gray-200/50 px-6 py-4">
              <div className="grid grid-cols-12 gap-4 text-xs font-bold text-gray-600 uppercase tracking-wide items-center">
                <div className="col-span-1 flex items-center">
                  <input
                    type="checkbox"
                    checked={false}
                    disabled
                    className="w-4 h-4 text-primary-600 bg-white border-gray-300 rounded focus:ring-primary-500 cursor-not-allowed opacity-50"
                  />
                </div>
                <div className="col-span-2 flex items-center">
                  Nome
                  <ArrowUpDown className="w-3.5 h-3.5 ml-2 opacity-30" />
                </div>
                <div className="col-span-2 flex items-center">
                  Quantidade
                  <ArrowUpDown className="w-3.5 h-3.5 ml-2 opacity-30" />
                </div>
                <div className="col-span-1 flex items-center">
                  Medida
                  <ArrowUpDown className="w-3.5 h-3.5 ml-2 opacity-30" />
                </div>
                <div className="col-span-2 flex items-center">
                  Categoria
                  <ArrowUpDown className="w-3.5 h-3.5 ml-2 opacity-30" />
                </div>
                <div className="col-span-2 flex items-center">
                  Local
                  <ArrowUpDown className="w-3.5 h-3.5 ml-2 opacity-30" />
                </div>
                <div className="col-span-2">Validade</div>
              </div>
            </div>
            
            {/* Rows */}
            <div className="divide-y divide-gray-100/50">
              {zeroQuantityIngredients.map((ingredient, index) => {
                const isEditing = editingId === ingredient.id;
                const data = isEditing ? editingData : ingredient;
                const isSelected = selectedIds.includes(ingredient.id);
                
                return (
                  <div
                    key={ingredient.id}
                    className={`px-6 py-4 transition-all duration-200 ${
                      isSelected ? 'bg-primary-50/20' : ''
                    } ${
                      isEditing 
                        ? 'bg-blue-50/30 border-l-4 border-blue-500' 
                        : 'hover:bg-gray-50/50'
                    }`}
                    style={{
                      animation: `fadeIn 0.4s ease-out ${index * 0.03}s both`
                    }}
                  >
                    <div className="grid grid-cols-12 gap-4 items-center">
                      {/* Checkbox */}
                      <div className="col-span-1">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(ingredient.id)}
                          className="w-4 h-4 text-primary-600 bg-white border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      
                      {/* Name */}
                      <div 
                        className="col-span-2 cursor-text"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isEditing) {
                            handleCellClick(ingredient, 'name');
                          }
                        }}
                      >
                        {isEditing && editingField === 'name' ? (
                          <input
                            type="text"
                            value={data.name}
                            onChange={(e) => updateEditingField('name', e.target.value)}
                            onBlur={() => handleSaveEdit(ingredient)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveEdit(ingredient);
                              if (e.key === 'Escape') handleCancelEdit();
                            }}
                            className="w-full px-3 py-2 text-sm text-gray-900 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                            autoFocus
                          />
                        ) : (
                          <div className="flex items-center space-x-3 hover:bg-blue-50/30 rounded-xl px-2 py-1.5 -mx-2 transition-colors">
                            <div className="relative">
                              <div 
                                data-emoji-button
                                className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200/50 rounded-2xl flex items-center justify-center text-2xl shadow-soft transition-all duration-200 cursor-pointer hover:scale-110 hover:shadow-soft-md"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowEmojiPicker(showEmojiPicker === ingredient.id ? null : ingredient.id);
                                }}
                                title="Clique para mudar o emoji"
                              >
                                {getIngredientEmoji(ingredient)}
                              </div>
                              
                              {/* Emoji Picker */}
                              {showEmojiPicker === ingredient.id && (
                                <div 
                                  data-emoji-picker
                                  className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[9999] bg-white/95 backdrop-blur-xl rounded-2xl shadow-soft-lg border border-gray-200/50 p-4 w-72"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs font-semibold text-gray-700">Escolha um emoji</p>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setShowEmojiPicker(null);
                                      }}
                                      className="text-gray-400 hover:text-gray-600"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                  <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto">
                                    {commonEmojis.map((emoji) => (
                                      <button
                                        key={emoji}
                                        onClick={async () => {
                                          await ingredientsAPI.update(ingredient.id, { emoji });
                                          await loadIngredients();
                                          await loadFilters();
                                          setShowEmojiPicker(null);
                                        }}
                                        className="text-2xl hover:bg-gray-100 rounded-lg p-2 transition-colors"
                                      >
                                        {emoji}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            <span className="text-sm font-semibold text-gray-800">{ingredient.name}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Quantity */}
                      <div
                        className="col-span-2 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCellClick(ingredient, 'quantity');
                        }}
                      >
                        {isEditing && editingField === 'quantity' ? (
                          <input
                            type="number"
                            step="0.01"
                            value={data.quantity}
                            onChange={(e) => updateEditingField('quantity', parseFloat(e.target.value) || 0)}
                            onBlur={() => handleSaveEdit(ingredient)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveEdit(ingredient);
                              if (e.key === 'Escape') handleCancelEdit();
                            }}
                            className="w-full px-3 py-2 text-sm text-gray-900 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                            autoFocus
                          />
                        ) : (
                          <div className="hover:bg-blue-50/30 rounded-xl px-2 py-1.5 -mx-2 transition-colors">
                            <span className="text-sm text-gray-600 font-medium">{ingredient.quantity}</span>
                          </div>
                        )}
                      </div>

                      {/* Unit */}
                      <div
                        className="col-span-1 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCellClick(ingredient, 'unit');
                        }}
                      >
                        {isEditing && editingField === 'unit' ? (
                          <select
                            value={data.unit}
                            onChange={(e) => {
                              const selectedValue = e.target.value;
                              const updatedData = { ...editingData, unit: selectedValue };
                              setEditingData(updatedData);
                              handleSaveEdit(ingredient, updatedData);
                            }}
                            onFocus={(e) => {
                              setTimeout(() => {
                                if (e.target.showPicker) {
                                  try { e.target.showPicker(); } catch (err) { e.target.click(); }
                                } else {
                                  e.target.click();
                                }
                              }, 100);
                            }}
                            className="w-full px-3 py-2 text-xs text-gray-900 bg-white border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer"
                            autoFocus
                          >
                            <option value="">Selecione...</option>
                            {units.map(u => <option key={u} value={u}>{u}</option>)}
                          </select>
                        ) : (
                          <div className="hover:bg-blue-50/30 rounded-xl px-2 py-1.5 -mx-2 transition-colors">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600 border border-blue-100">
                              {ingredient.unit || '-'}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Category */}
                      <div
                        className="col-span-2 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCellClick(ingredient, 'category');
                        }}
                      >
                        {isEditing && editingField === 'category' ? (
                          <select
                            value={data.category}
                            onChange={(e) => {
                              const selectedValue = e.target.value;
                              const updatedData = { ...editingData, category: selectedValue };
                              setEditingData(updatedData);
                              handleSaveEdit(ingredient, updatedData);
                            }}
                            onFocus={(e) => {
                              setTimeout(() => {
                                if (e.target.showPicker) {
                                  try { e.target.showPicker(); } catch (err) { e.target.click(); }
                                } else {
                                  e.target.click();
                                }
                              }, 100);
                            }}
                            className="w-full px-3 py-2 text-xs text-gray-900 bg-white border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer"
                            autoFocus
                          >
                            <option value="">Selecione...</option>
                            {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        ) : (
                          <div className="hover:bg-blue-50/30 rounded-xl px-2 py-1.5 -mx-2 transition-colors">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-600 border border-purple-100">
                              {ingredient.category || 'Sem categoria'}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Location */}
                      <div
                        className="col-span-2 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCellClick(ingredient, 'location');
                        }}
                      >
                        {isEditing && editingField === 'location' ? (
                          <select
                            value={data.location}
                            onChange={(e) => {
                              const selectedValue = e.target.value;
                              const updatedData = { ...editingData, location: selectedValue };
                              setEditingData(updatedData);
                              handleSaveEdit(ingredient, updatedData);
                            }}
                            onFocus={(e) => {
                              setTimeout(() => {
                                if (e.target.showPicker) {
                                  try { e.target.showPicker(); } catch (err) { e.target.click(); }
                                } else {
                                  e.target.click();
                                }
                              }, 100);
                            }}
                            className="w-full px-3 py-2 text-xs text-gray-900 bg-white border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer"
                            autoFocus
                          >
                            <option value="">Selecione...</option>
                            {locationOptions.map(l => <option key={l} value={l}>{l}</option>)}
                          </select>
                        ) : (
                          <div className="hover:bg-blue-50/30 rounded-xl px-2 py-1.5 -mx-2 transition-colors">
                            <span className="text-xs text-gray-600 font-medium">📍 {ingredient.location || 'Sem local'}</span>
                          </div>
                        )}
                      </div>

                      {/* Expiry Date */}
                      <div
                        className="col-span-2 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isEditing) {
                            handleCellClick(ingredient, 'expiry_date');
                          }
                        }}
                      >
                        {isEditing && editingField === 'expiry_date' ? (
                          <input
                            type="date"
                            value={data.expiry_date || ''}
                            onChange={(e) => updateEditingField('expiry_date', e.target.value)}
                            onBlur={() => handleSaveEdit(ingredient)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveEdit(ingredient);
                              if (e.key === 'Escape') handleCancelEdit();
                            }}
                            className="w-full px-3 py-2 text-xs text-gray-900 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                            autoFocus
                          />
                        ) : (
                          <div className="hover:bg-blue-50/30 rounded-xl px-2 py-1.5 -mx-2 transition-colors">
                            {ingredient.expiry_date ? (
                              <div className="flex flex-col gap-1">
                                <span className="text-xs text-gray-600 font-medium">
                                  {new Date(ingredient.expiry_date).toLocaleDateString('pt-BR')}
                                </span>
                                {getStatusBadge(ingredient)}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">Sem validade</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="px-6 py-4 bg-gradient-to-br from-gray-50/50 to-gray-100/20 border-t border-gray-200/50">
              <p className="text-xs text-gray-500 text-center font-medium">
                💡 Clique em qualquer campo para editar • Adicione estoque para mover para a lista principal
              </p>
            </div>
          </div>
        </div>
      )}
      
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Ingredients;
