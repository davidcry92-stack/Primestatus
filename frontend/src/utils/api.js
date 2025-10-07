// API Utility for handling backend URL in different environments
export const getBackendUrl = () => {
  // First check environment variables
  if (process.env.REACT_APP_BACKEND_URL) {
    return process.env.REACT_APP_BACKEND_URL;
  }
  
  if (import.meta.env && import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL;
  }
  
  // In deployment, use relative URL. In local dev, use localhost
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost') {
      return 'http://localhost:8001';
    }
    
    // For deployed apps, use the current origin with API prefix
    // This handles the Emergent deployment pattern
    return window.location.origin;
  }
  
  return '';
};

// Unified API utility
export const apiRequest = async (endpoint, options = {}) => {
  const backendUrl = getBackendUrl();
  const url = `${backendUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  // Add auth token if available
  const token = localStorage.getItem('access_token');
  if (token) {
    defaultOptions.headers.Authorization = `Bearer ${token}`;
  }
  
  const finalOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };
  
  try {
    const response = await fetch(url, finalOptions);
    
    // Handle auth errors
    if (response.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_data');
      // Don't redirect here - let components handle it
    }
    
    return response;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};