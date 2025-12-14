import axios from 'axios';

// Usar variável de ambiente em produção, fallback para localhost em desenvolvimento
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para lidar com erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Ingredientes
export const ingredientsAPI = {
  getAll: (filters = {}) => api.get('/ingredients', { params: filters }),
  getById: (id) => api.get(`/ingredients/${id}`),
  create: (data) => api.post('/ingredients', data),
  update: (id, data) => api.put(`/ingredients/${id}`, data),
  delete: (id) => api.delete(`/ingredients/${id}`),
  getExpiring: () => api.get('/ingredients/expiring'),
  getCategories: () => api.get('/ingredients/categories'),
  getLocations: () => api.get('/ingredients/locations'),
};

// Receitas
export const recipesAPI = {
  getAll: () => api.get('/recipes'),
  getById: (id) => api.get(`/recipes/${id}`),
  create: (data) => api.post('/recipes', data),
  update: (id, data) => api.put(`/recipes/${id}`, data),
  delete: (id) => api.delete(`/recipes/${id}`),
  canMake: (id, servings) => api.get(`/recipes/${id}/can-make`, { params: { servings } }),
  cook: (id, data) => api.post(`/recipes/${id}/cook`, data),
  getAvailable: () => api.get('/recipes/can-make-now'),
};

// Lista de Compras
export const shoppingAPI = {
  getAll: (purchased) => api.get('/shopping-list', { params: { purchased } }),
  getById: (id) => api.get(`/shopping-list/${id}`),
  add: (data) => api.post('/shopping-list', data),
  markPurchased: (id, data) => api.post(`/shopping-list/${id}/purchase`, data),
  delete: (id) => api.delete(`/shopping-list/${id}`),
  checkLowStock: () => api.post('/shopping-list/check-low-stock'),
  clearPurchased: () => api.delete('/shopping-list/clear-purchased'),
  getStats: () => api.get('/shopping-list/stats'),
};

// Histórico
export const historyAPI = {
  getAll: (filters = {}) => api.get('/history', { params: filters }),
  getById: (id) => api.get(`/history/${id}`),
  update: (id, data) => api.put(`/history/${id}`, data),
  delete: (id) => api.delete(`/history/${id}`),
  getStats: () => api.get('/history/stats'),
  getRecent: () => api.get('/history/recent'),
  getByRecipe: (recipeId) => api.get(`/history/recipe/${recipeId}`),
};

// Refeições Congeladas
export const frozenMealsAPI = {
  getAll: (status, expiredOnly) => api.get('/frozen-meals', { params: { status, expired_only: expiredOnly } }),
  getById: (id) => api.get(`/frozen-meals/${id}`),
  create: (data) => api.post('/frozen-meals', data),
  update: (id, data) => api.put(`/frozen-meals/${id}`, data),
  delete: (id) => api.delete(`/frozen-meals/${id}`),
  consume: (id, portions) => api.post(`/frozen-meals/${id}/consume`, { portions }),
  getStats: () => api.get('/frozen-meals/stats'),
};

export default api;
