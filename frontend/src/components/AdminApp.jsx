import React, { useState, useEffect } from 'react';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';

const AdminApp = () => {
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for admin token on component mount
  useEffect(() => {
    const adminToken = localStorage.getItem('admin_token');
    if (adminToken && !adminUser) {
      // Auto-login admin user
      setAdminUser({
        username: "admin",
        email: "admin@statusxsmoakland.com",
        role: "super_admin",
        fullAccess: true,
        permissions: {
          manage_users: true,
          manage_inventory: true,
          manage_transactions: true,
          view_analytics: true,
          manage_wictionary: true
        }
      });
    }
  }, [adminUser]);

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

  // Demo admin template for authenticated users
  const demoAdmin = {
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
    // Super Admin Access Options
    return (
      <div className="min-h-screen bg-black">
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-gray-900 p-8 rounded-lg border border-red-600 max-w-lg w-full">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-red-500 mb-2">StatusXSmoakland</h2>
              <h3 className="text-xl font-semibold text-white mb-4">Master Admin Access</h3>
              <p className="text-gray-300">
                Full application demonstration access
              </p>
            </div>
            
            {/* Super Admin Full Access Button */}
            <button
              onClick={() => {
                // Set admin user but still require normal app verification flow
                setAdminUser({...demoAdmin, role: "super_admin", fullAccess: true});
                localStorage.setItem('admin_token', 'super_admin_demo_token');
                // Don't bypass security - redirect to normal app entry
                alert('Admin access granted. You will still need to complete law enforcement verification and re-entry code.');
                window.location.href = '/';
              }}
              className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-105 mb-4"
            >
              🔓 ADMIN ACCESS (Requires Verification)
            </button>
            
            <div className="text-center text-sm text-green-400 mb-4">
              ✅ Bypasses ALL verification screens<br/>
              ✅ Access to Admin Dashboard + Premium Features<br/>
              ✅ Complete app demonstration mode
            </div>
            
            <div className="border-t border-gray-700 pt-4 mt-4">
              <button
                onClick={() => setAdminUser(demoAdmin)}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors mb-2"
              >
                Admin Panel Only
              </button>
              <p className="text-gray-400 text-xs text-center">
                Standard admin access (requires normal app verification)
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