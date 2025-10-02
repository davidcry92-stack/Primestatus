import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import MembersManagement from './MembersManagement';
import PickupVerification from './PickupVerification';
import InventoryManagement from './InventoryManagement';
import AdminRatingStats from './AdminRatingStats';
import WellnessCenter from './Wictionary';
import ProductGrid from './ProductGrid';
import ProductSelection from './ProductSelection';
import DailyDeals from './DailyDeals';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Admin Dashboard Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-900/20 border border-red-600 rounded-lg p-4">
          <h3 className="text-red-400 font-semibold mb-2">⚠️ Component Error</h3>
          <p className="text-red-300 text-sm">
            This component encountered an error. Please refresh the page or contact support.
          </p>
          <button 
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

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
    { id: 'ratings', label: 'Rating Stats', icon: '⭐' },
    { id: 'verification', label: 'ID Verification', icon: '🆔' },
    { id: 'health-aid', label: 'Health-Aid (Premium)', icon: '📖' },
    { id: 'member-preview', label: 'Member Experience', icon: '👁️' },
    { id: 'product-catalog', label: 'Full Catalog View', icon: '🌿' }
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
          {activeTab === 'ratings' && (
            <AdminRatingStats />
          )}
          {activeTab === 'verification' && (
            <IDVerification />
          )}
          {activeTab === 'health-aid' && (
            <div className="bg-gray-900 p-6 rounded-lg">
                <h3 className="text-green-400 font-semibold mb-2">🔓 Admin View: Premium Health-Aid Access</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Viewing Health-Aid as a premium member would see it. This includes all {' '}
                  wellness and cannabis education content.
                </p>
              <ErrorBoundary>
                <WellnessCenter user={{
                  username: "AdminPreview",
                  membership_tier: "premium", 
                  membershipTier: "premium",
                  is_verified: true,
                  verification_status: "approved",
                  role: "member"
                }} />
              </ErrorBoundary>
            </div>
          )}
          {activeTab === 'member-preview' && (
            <MemberExperiencePreview adminUser={adminUser} />
          )}
          {activeTab === 'product-catalog' && (
            <div className="bg-gray-900 p-6 rounded-lg">
              <div className="mb-4 p-4 bg-blue-900/30 border border-blue-600 rounded-lg">
                <h3 className="text-blue-400 font-semibold mb-2">🔓 Admin View: Complete Product Catalog</h3>
                <p className="text-blue-300 text-sm">
                  Full product catalog view with all cannabis bud images, pricing tiers (Za/Deps/Lows), 
                  and member-exclusive content.
                </p>
              </div>
              <ErrorBoundary>
                <ProductSelection user={{
                  username: "AdminDemo",
                  membership_tier: "premium", 
                  membershipTier: "premium",
                  is_verified: true,
                  verification_status: "approved",
                  role: "admin"
                }} />
              </ErrorBoundary>
            </div>
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

// Placeholder component for ID verification
const IDVerification = () => <div>ID Verification - Coming Soon</div>;

const MemberExperiencePreview = ({ adminUser }) => {
  const [previewMode, setPreviewMode] = useState('premium');
  
  const memberModes = [
    { id: 'premium', label: 'Premium Member', tier: 'premium', color: 'gold' },
    { id: 'basic', label: 'Basic Member', tier: 'basic', color: 'blue' },
    { id: 'unverified', label: 'Unverified User', tier: 'basic', verified: false, color: 'gray' }
  ];

  const getMockUser = (mode) => {
    const base = {
      username: `Demo${mode.label.replace(' ', '')}`,
      membership_tier: mode.tier,
      membershipTier: mode.tier,
      is_verified: mode.verified !== false,
      verification_status: mode.verified !== false ? 'approved' : 'pending', // Add verification status
      role: 'member'
    };
    return base;
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Member Experience Preview</h2>
        <div className="p-4 bg-purple-900/30 border border-purple-600 rounded-lg mb-6">
          <h3 className="text-purple-400 font-semibold mb-2">🎭 Admin Demo Mode</h3>
          <p className="text-purple-300 text-sm mb-4">
            Experience StatusXSmoakland exactly as different member types would see it. 
            Switch between membership tiers to see feature access differences.
          </p>
          
          <div className="flex space-x-3">
            {memberModes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setPreviewMode(mode.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  previewMode === mode.id
                    ? `bg-${mode.color}-600 text-white` 
                    : `bg-gray-700 text-gray-300 hover:bg-gray-600`
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Product Selection as Member */}
        <div className="bg-gray-900 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            🌿 Product Selection 
            <span className={`ml-2 px-2 py-1 rounded text-xs ${
              previewMode === 'premium' ? 'bg-yellow-600 text-yellow-100' :
              previewMode === 'basic' ? 'bg-blue-600 text-blue-100' :
              'bg-gray-600 text-gray-100'
            }`}>
              {memberModes.find(m => m.id === previewMode)?.label}
            </span>
          </h3>
          <ErrorBoundary>
            <ProductSelection user={getMockUser(memberModes.find(m => m.id === previewMode))} />
          </ErrorBoundary>
        </div>

        {/* Daily Deals */}
        <div className="bg-gray-900 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">🔥 Daily Deals</h3>
          <ErrorBoundary>
            <DailyDeals user={getMockUser(memberModes.find(m => m.id === previewMode))} />
          </ErrorBoundary>
        </div>

        {/* Wellness Center Access */}
        {previewMode === 'premium' ? (
          <div className="bg-gray-900 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              📖 Wellness Center 
              <span className="ml-2 px-2 py-1 bg-green-600 text-green-100 rounded text-xs">
                PREMIUM ACCESS
              </span>
            </h3>
            <ErrorBoundary>
              <WellnessCenter user={getMockUser(memberModes.find(m => m.id === previewMode))} />
            </ErrorBoundary>
          </div>
        ) : (
          <div className="bg-gray-900 p-6 rounded-lg border-2 border-yellow-600">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              📖 Wellness Center 
              <span className="ml-2 px-2 py-1 bg-red-600 text-red-100 rounded text-xs">
                PREMIUM REQUIRED
              </span>
            </h3>
            <div className="text-center py-12 text-gray-400">
              <div className="text-6xl mb-4">🔒</div>
              <p className="text-xl mb-2">Premium Feature</p>
              <p>Upgrade to Premium to access the comprehensive Wellness Center</p>
              <button className="mt-4 bg-yellow-600 hover:bg-yellow-700 text-black font-bold py-2 px-6 rounded-lg">
                Upgrade to Premium
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;