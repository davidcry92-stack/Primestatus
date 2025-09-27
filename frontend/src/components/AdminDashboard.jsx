import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import MembersManagement from './MembersManagement';
import PickupVerification from './PickupVerification';
import InventoryManagement from './InventoryManagement';

const AdminDashboard = ({ adminUser, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { apiCall } = useContext(AuthContext);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await apiCall('/api/admin/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    onLogout();
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'members', label: 'Members', icon: '👥' },
    { id: 'pickup', label: 'Pickup Verification', icon: '📦' },
    { id: 'inventory', label: 'Inventory', icon: '📦' },
    { id: 'verification', label: 'ID Verification', icon: '🆔' }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-red-600 p-4">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-red-500">StatusXSmoakland Admin</h1>
            <span className="text-gray-400">|</span>
            <span className="text-sm text-gray-300">Welcome, {adminUser.full_name}</span>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="flex max-w-7xl mx-auto">
        {/* Sidebar */}
        <div className="w-64 bg-gray-900 min-h-screen p-4">
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-red-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {activeTab === 'dashboard' && (
            <DashboardOverview stats={stats} loading={loading} />
          )}
          {activeTab === 'members' && (
            <MembersManagement />
          )}
          {activeTab === 'pickup' && (
            <PickupVerification />
          )}
          {activeTab === 'inventory' && (
            <InventoryManagement />
          )}
          {activeTab === 'verification' && (
            <IDVerification />
          )}
        </div>
      </div>
    </div>
  );
};

const DashboardOverview = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center text-gray-400 mt-8">
        Failed to load dashboard statistics
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Members</p>
              <p className="text-3xl font-bold text-white">{stats.users?.total || 0}</p>
            </div>
            <div className="text-2xl">👥</div>
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Verified Members</p>
              <p className="text-3xl font-bold text-green-400">{stats.users?.verified || 0}</p>
            </div>
            <div className="text-2xl">✅</div>
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Pending Pickups</p>
              <p className="text-3xl font-bold text-yellow-400">{stats.transactions?.pending_pickups || 0}</p>
            </div>
            <div className="text-2xl">📦</div>
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Monthly Revenue</p>
              <p className="text-3xl font-bold text-green-400">${stats.revenue?.monthly || 0}</p>
            </div>
            <div className="text-2xl">💰</div>
          </div>
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
        <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-red-600/20 border border-red-600 p-4 rounded-lg">
            <h4 className="font-semibold text-red-400 mb-2">Pending Verifications</h4>
            <p className="text-2xl font-bold">{stats.users?.pending_verification || 0}</p>
            <p className="text-sm text-gray-400 mt-2">Members awaiting ID verification</p>
          </div>
          <div className="bg-yellow-600/20 border border-yellow-600 p-4 rounded-lg">
            <h4 className="font-semibold text-yellow-400 mb-2">Out of Stock</h4>
            <p className="text-2xl font-bold">{stats.inventory?.out_of_stock || 0}</p>
            <p className="text-sm text-gray-400 mt-2">Products needing restock</p>
          </div>
          <div className="bg-blue-600/20 border border-blue-600 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-400 mb-2">Total Products</h4>
            <p className="text-2xl font-bold">{stats.inventory?.total_products || 0}</p>
            <p className="text-sm text-gray-400 mt-2">Items in inventory</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Placeholder components for other tabs
const MembersManagement = () => <div>Members Management - Coming Soon</div>;
const PickupVerification = () => <div>Pickup Verification - Coming Soon</div>;
const InventoryManagement = () => <div>Inventory Management - Coming Soon</div>;
const IDVerification = () => <div>ID Verification - Coming Soon</div>;

export default AdminDashboard;