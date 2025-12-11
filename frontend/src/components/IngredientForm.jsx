import { useState, useEffect } from 'react';

const IngredientForm = ({ ingredient, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    quantity: 0,
    unit: 'g',
    category: '',
    location: '',
    emoji: '',
    vegan: false,
    expiry_date: '',
    minimum_quantity: 0,
  });
  
  useEffect(() => {
    if (ingredient) {
      setFormData({
        name: ingredient.name || '',
        quantity: ingredient.quantity || 0,
        unit: ingredient.unit || 'g',
        category: ingredient.category || '',
        location: ingredient.location || '',
        emoji: ingredient.emoji || '',
        vegan: ingredient.vegan || false,
        expiry_date: ingredient.expiry_date || '',
        minimum_quantity: ingredient.minimum_quantity || 0,
      });
    }
  }, [ingredient]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  const units = ['g', 'kg', 'ml', 'L', 'unidades', 'xícaras', 'colheres'];
  const categories = ['Vegetais', 'Frutas', 'Laticínios', 'Carnes', 'Grãos', 'Temperos', 'Bebidas', 'Congelados', 'Outros'];
  const locations = ['Geladeira', 'Freezer', 'Despensa', 'Bancada'];
  
  const emojis = [
    '🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍒', '🍑',
    '🥭', '🍍', '🥥', '🥝', '🍅', '🥑', '🥦', '🥬', '🥒', '🌶️',
    '🫑', '🌽', '🥕', '🧄', '🧅', '🥔', '🍠', '🥐', '🥖', '🍞',
    '🥨', '🧀', '🥚', '🍳', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭',
    '🍔', '🍟', '🍕', '🥪', '🥙', '🧆', '🌮', '🌯', '🫔', '🥗',
    '🥘', '🫕', '🥫', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟',
    '🦐', '🍤', '🦞', '🦀', '🐟', '🥠', '🥮', '🍢', '🍡', '🍧',
    '🍨', '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫',
    '🍿', '🍩', '🍪', '🌰', '🥜', '🫘', '🍯', '🥛', '🍼', '🫖',
    '☕', '🧃', '🧋', '🍵', '🥤', '🧊', '🍶', '🍺', '🍻', '🥂',
    '🍷', '🥃', '🍸', '🍹', '🧉', '🍾', '🥄', '🍴', '🥢', '🌾',
    '🌿', '🧂', '🧈', '🥯', '🫓', '🍽️', '📦', '🥥'
  ];
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Nome *</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="input"
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Quantidade *</label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            className="input"
            min="0"
            step="0.01"
            required
          />
        </div>
        
        <div>
          <label className="label">Unidade *</label>
          <select
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            className="input"
            required
          >
            {units.map(unit => (
              <option key={unit} value={unit}>{unit}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div>
        <label className="label">Quantidade Mínima</label>
        <input
          type="number"
          name="minimum_quantity"
          value={formData.minimum_quantity}
          onChange={handleChange}
          className="input"
          min="0"
          step="0.01"
        />
        <p className="text-xs text-gray-500 mt-2 font-medium leading-relaxed">
          Quando a quantidade ficar abaixo deste valor, o item será adicionado à lista de compras
        </p>
      </div>
      
      <div>
        <label className="label">Emoji</label>
        <div className="grid grid-cols-10 gap-2 p-4 border border-gray-200/50 rounded-2xl bg-gray-50/50 backdrop-blur-sm max-h-48 overflow-y-auto shadow-soft">
          {emojis.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, emoji }))}
              className={`text-2xl p-2.5 rounded-xl hover:bg-white transition-all duration-200 active:scale-95 ${
                formData.emoji === emoji ? 'bg-primary-50 ring-2 ring-primary-500/50 shadow-soft' : 'bg-white/80 hover:shadow-soft'
              }`}
              title={emoji}
            >
              {emoji}
            </button>
          ))}
        </div>
        {formData.emoji && (
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, emoji: '' }))}
            className="text-sm text-gray-500 hover:text-gray-700 mt-3 font-medium hover:bg-gray-100 px-3 py-1.5 rounded-xl transition-all active:scale-95"
          >
            Limpar emoji
          </button>
        )}
      </div>
      
      <div className="flex items-center space-x-3 p-5 bg-green-50/80 border border-green-200/50 rounded-2xl backdrop-blur-sm shadow-soft">
        <input
          type="checkbox"
          id="vegan"
          name="vegan"
          checked={formData.vegan}
          onChange={handleChange}
          className="w-5 h-5 text-green-600 bg-white border-gray-300 rounded-lg focus:ring-green-500/30 focus:ring-2 cursor-pointer transition-all"
        />
        <label htmlFor="vegan" className="flex items-center cursor-pointer">
          <span className="text-3xl mr-3">🌱</span>
          <div>
            <span className="font-semibold text-gray-900">Ingrediente Vegano</span>
            <p className="text-xs text-gray-600 font-medium mt-0.5">Marque se este ingrediente é 100% vegano</p>
          </div>
        </label>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Categoria</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="input"
          >
            <option value="">Selecione...</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="label">Local</label>
          <select
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="input"
          >
            <option value="">Selecione...</option>
            {locations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div>
        <label className="label">Data de Validade</label>
        <input
          type="date"
          name="expiry_date"
          value={formData.expiry_date}
          onChange={handleChange}
          className="input"
        />
      </div>
      
      <div className="flex space-x-3 pt-6">
        <button type="submit" className="btn-primary flex-1 shadow-soft-md hover:shadow-soft-lg">
          {ingredient ? 'Atualizar' : 'Adicionar'} Ingrediente
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary px-8">
          Cancelar
        </button>
      </div>
    </form>
  );
};

export default IngredientForm;
