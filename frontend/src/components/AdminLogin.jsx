import React, { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

const AdminLogin = ({ onLoginSuccess }) => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { apiCall } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiCall('/api/admin-auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('admin_token', data.access_token);
        localStorage.setItem('admin_user', JSON.stringify(data.admin));
        onLoginSuccess(data.admin);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="bg-gray-900 p-8 rounded-lg shadow-xl w-full max-w-md border border-red-600">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-red-500 mb-2">Admin Portal</h1>
          <p className="text-gray-400">StatusXSmoakland Administration</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Admin Email
            </label>
            <input
              type="email"
              required
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              value={credentials.email}
              onChange={(e) => setCredentials({...credentials, email: e.target.value})}
              placeholder="admin@statusxsmoakland.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              required
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              value={credentials.password}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              placeholder="Enter admin password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded-md transition-colors"
          >
            {loading ? 'Signing In...' : 'Sign In to Admin Portal'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          Authorized personnel only
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;