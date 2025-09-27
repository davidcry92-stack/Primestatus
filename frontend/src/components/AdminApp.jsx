import React, { useState, useEffect } from 'react';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';

const AdminApp = () => {
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if admin is already logged in
    const token = localStorage.getItem('admin_token');
    const storedAdmin = localStorage.getItem('admin_user');
    
    if (token && storedAdmin) {
      try {
        const adminData = JSON.parse(storedAdmin);
        setAdminUser(adminData);
      } catch (error) {
        console.error('Failed to parse stored admin data:', error);
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
      }
    }
    
    setLoading(false);
  }, []);

  const handleLoginSuccess = (admin) => {
    setAdminUser(admin);
  };

  const handleLogout = () => {
    setAdminUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-white">Loading admin portal...</p>
        </div>
      </div>
    );
  }

  // TEMPORARY: Bypass admin login for demonstration
  const demoAdmin = adminUser || {
    username: "admin",
    email: "admin@smoakland.com",
    role: "super_admin",
    permissions: {
      manage_users: true,
      manage_inventory: true,
      manage_transactions: true,
      view_analytics: true,
      manage_wictionary: true
    }
  };

  if (!adminUser) {
    // Show admin login but with bypass option
    return (
      <div className="min-h-screen bg-black">
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-gray-900 p-8 rounded-lg border border-red-600 max-w-md w-full">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Admin Access</h2>
            <p className="text-gray-300 mb-6 text-center">
              DEMO MODE: Click below to access the admin panel
            </p>
            <button
              onClick={() => setAdminUser(demoAdmin)}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
              Access Admin Panel (Demo)
            </button>
            <div className="mt-4 pt-4 border-t border-gray-700">
              <p className="text-gray-400 text-sm text-center">
                Or use: admin@smoakland.com / admin123
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <AdminDashboard adminUser={adminUser} onLogout={handleLogout} />;
};

export default AdminApp;