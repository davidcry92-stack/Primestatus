import axios from 'axios';

// Get backend URL - use environment variable or infer from current location
const getBackendUrl = () => {
  if (process.env.REACT_APP_BACKEND_URL) {
    return process.env.REACT_APP_BACKEND_URL;
  }
  
  // In deployment, use relative URL. In local dev, use localhost
  if (typeof window !== 'undefined') {
    return window.location.hostname === 'localhost' ? 'http://localhost:8001' : '';
  }
  
  return '';
};

const BACKEND_URL = getBackendUrl();
const API_BASE = `${BACKEND_URL}/api`;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_data');
      
      // Only redirect if we're not already on the home page to avoid redirect loops
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (updates) => api.put('/auth/profile', updates),
  logout: () => api.post('/auth/logout'),
};

// Products API
export const productsAPI = {
  getAll: (params = {}) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
};

// Daily Deals API
export const dealsAPI = {
  getDaily: () => api.get('/deals/daily'),
  getStats: () => api.get('/deals/stats'),
};

// Cart API
export const cartAPI = {
  get: () => api.get('/cart'),
  add: (item) => api.post('/cart/add', item),
  update: (productId, quantity) => api.put(`/cart/${productId}`, { quantity }),
  remove: (productId) => api.delete(`/cart/${productId}`),
  clear: () => api.delete('/cart'),
  getSummary: () => api.get('/cart/summary'),
};

// Orders API
export const ordersAPI = {
  create: (orderData) => api.post('/orders', orderData),
  getAll: (params = {}) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
};

// Wictionary API
export const wictionaryAPI = {
  getTerms: (params = {}) => api.get('/wictionary', { params }),
  search: (query) => api.get('/wictionary/search', { params: { q: query } }),
  suggest: (suggestion) => api.post('/wictionary/suggest', suggestion),
  getCategories: () => api.get('/wictionary/categories'),
  getStats: () => api.get('/wictionary/stats'),
};

// Health check
export const healthAPI = {
  check: () => api.get('/health'),
};

export default api;