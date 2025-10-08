import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Simple API call helper
const apiCall = async (url, options = {}) => {
  // Handle backend URL for different environments
  let backendUrl = process.env.REACT_APP_BACKEND_URL;
  
  // If no backend URL specified, use smart detection
  if (!backendUrl || backendUrl === '') {
    if (window.location.hostname === 'localhost') {
      backendUrl = 'http://localhost:8001';
    } else {
      // In Emergent deployment, use current origin for API calls
      backendUrl = window.location.origin;
    }
  }
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const token = localStorage.getItem('access_token');
  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${backendUrl}${url}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  return response;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount - but only if valid for current session
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user_data');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        // Restore authentication for current session
        setUser(parsedUser);
        console.log('Authentication restored for current session');
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_data');
      }
    }
    
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      // Determine if this is an admin login
      const isAdminLogin = credentials.email === 'admin@statusxsmoakland.com';
      const loginEndpoint = isAdminLogin ? '/api/admin-auth/login' : '/api/auth/login';
      
      const response = await apiCall(loginEndpoint, {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const data = await response.json();
      const { access_token, user: userData } = data;
      
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('user_data', JSON.stringify(userData));
      setUser(userData);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    try {
      const formData = new FormData();
      
      // Add all form fields
      Object.keys(userData).forEach(key => {
        if (userData[key] !== null && userData[key] !== undefined) {
          formData.append(key, userData[key]);
        }
      });

      const response = await apiCall('/api/auth/register', {
        method: 'POST',
        body: formData,
        headers: {}, // Let browser set Content-Type for FormData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registration failed');
      }

      const data = await response.json();
      const { access_token, user: newUser } = data;
      
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('user_data', JSON.stringify(newUser));
      setUser(newUser);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await apiCall('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API error:', error);
    }
    
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');
    setUser(null);
  };

  const updateProfile = async (updates) => {
    try {
      const response = await apiCall('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Profile update failed');
      }

      const updatedUser = await response.json();
      
      localStorage.setItem('user_data', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user,
    apiCall, // Expose apiCall for other components
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };