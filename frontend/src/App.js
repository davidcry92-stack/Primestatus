import React, { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";

// Components
import ScreenshotProtection from "./components/ScreenshotProtection";
import LawEnforcementScreen from "./components/LawEnforcementScreen";
import ReEntryCodeScreen from "./components/ReEntryCodeScreen";
import VerificationPending from "./components/VerificationPending";
import SimpleHeader from "./components/SimpleHeader";
import HeroSection from "./components/HeroSection";
import ProductGrid from "./components/ProductGrid";
import ProductSelection from "./components/ProductSelection";
import Footer from "./components/Footer";
import CheckoutSuccess from "./components/CheckoutSuccess";
import CheckoutCancel from "./components/CheckoutCancel";
import AdminApp from "./components/AdminApp";
import AuthModal from "./components/AuthModal";
import DeliveryComingSoon from "./components/DeliveryComingSoon";
import DailyUpdates from "./components/DailyUpdates";

// Auth Context
import { AuthProvider, useAuth } from "./contexts/AuthContext";

const AdminOnlyApp = () => {
  const { user, isAuthenticated, loading } = useAuth();
  
  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }
  
  // Check if user is authenticated and is admin
  // Also check for admin_token for separate admin authentication
  const adminToken = localStorage.getItem('admin_token');
  const adminUser = localStorage.getItem('admin_user');
  
  const isAdmin = (isAuthenticated && user && (
    user.email === 'admin@statusxsmoakland.com' || 
    user.role === 'super_admin'
  )) || (adminToken && adminUser);
  
  if (!isAuthenticated || !user) {
    // Check if there's a separate admin token
    if (adminToken && adminUser) {
      // Admin is logged in through separate admin system
      return <AdminApp />;
    }
    
    // Not authenticated - redirect to main app for login
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-gray-900 border border-red-600 rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">🛡️</div>
            <h2 className="text-2xl font-bold text-white mb-4">Admin Login Required</h2>
            <p className="text-gray-300 mb-6">
              You must be logged in as an administrator to access this area.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Go to Main App
              </button>
              <p className="text-gray-400 text-sm">
                Login as admin: admin@statusxsmoakland.com
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!isAdmin) {
    // Authenticated but not admin
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-gray-900 border border-orange-600 rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
            <p className="text-gray-300 mb-6">
              You don't have administrator privileges to access this area.
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Return to Main App
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // User is authenticated admin - show admin dashboard
  return <AdminApp />;
};

const LoginOnlyApp = () => {
  const { user, isAuthenticated, loading, login } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [openCartCallback, setOpenCartCallback] = useState(null);

  const handleAuthClick = () => {
    console.log('Auth button clicked!'); // Debug log
    setShowAuthModal(true);
  };

  const handleCloseAuth = () => {
    setShowAuthModal(false);
  };

  const handleOpenCart = () => {
    if (openCartCallback) {
      openCartCallback();
    }
  };

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // STRICT VERIFICATION REQUIRED - NO CONTENT FOR UNVERIFIED USERS
  if (isAuthenticated && user && (!user.is_verified || user.verification_status !== 'approved')) {
    return <VerificationPending user={user} />;
  }

  // STRICT AUTHENTICATION REQUIRED - NO CONTENT WITHOUT LOGIN
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-gray-900 border border-red-600 rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-white mb-4">Login Required</h2>
            <p className="text-gray-300 mb-6">
              You must log in to access StatusXSmoakland content.
            </p>
            <button
              onClick={handleAuthClick}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Login to Continue
            </button>
          </div>
        </div>
        
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
            <div className="bg-gray-900 border border-red-600 rounded-lg p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Login to StatusXSmoakland</h2>
                <button
                  onClick={handleCloseAuth}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const email = formData.get('email');
                const password = formData.get('password');
                
                console.log('Attempting login with:', email); // Debug log
                
                try {
                  const result = await login({ email, password });
                  console.log('Login successful:', result);
                  handleCloseAuth();
                } catch (error) {
                  console.error('Login error:', error);
                  const errorMessage = error?.response?.data?.detail || error?.message || 'Network error - please check connection';
                  alert('Login failed: ' + errorMessage);
                }
              }} className="space-y-4">
                
                <div>
                  <label className="block text-white mb-2">Email:</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    className="w-full px-4 py-2 bg-black border border-gray-600 rounded text-white focus:border-green-400 focus:outline-none"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-white mb-2">Password:</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    className="w-full px-4 py-2 bg-black border border-gray-600 rounded text-white focus:border-green-400 focus:outline-none"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  Sign In
                </button>
                
                <div className="text-center space-y-2 pt-4 border-t border-gray-700">
                  <p className="text-gray-400 text-sm">Demo Credentials:</p>
                  <p className="text-green-400 text-xs">Admin: admin@statusxsmoakland.com / Admin123!</p>
                  <p className="text-yellow-400 text-xs">Premium: premium@demo.com / Premium123!</p>
                  <p className="text-blue-400 text-xs">Basic: basic@demo.com / Basic123!</p>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ONLY AUTHENTICATED USERS SEE THIS CONTENT
  return (
    <div className="min-h-screen bg-black">
      <SimpleHeader 
        user={user} 
        cartItems={cartItems} 
        setCartItems={setCartItems}
        onAuthClick={handleAuthClick}
        onOpenCart={handleOpenCart}
        setOpenCartCallback={setOpenCartCallback}
      />
      {/* System Instructions Banner */}
      <div className="bg-gradient-to-r from-orange-900/30 to-blue-900/30 border-b border-orange-600/50 px-4 py-3">
        <div className="container mx-auto">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="bg-orange-600 text-white rounded-full p-2">
                💡
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-orange-400 font-semibold text-lg mb-2">📋 System Instructions - StatusXSmoakland</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-black/20 rounded-lg p-3 border border-orange-500/30">
                  <h4 className="text-white font-medium mb-2">💳 Payment & Pickup System</h4>
                  <div className="text-orange-200 space-y-1">
                    <p>• <strong>Credit/Debit:</strong> Generates <strong>P-codes</strong> (e.g., P123456) - Pre-paid orders</p>
                    <p>• <strong>Cash Pickup:</strong> Generates <strong>C-codes</strong> (e.g., C123456) - Pay on pickup</p>
                    <p>• Both methods provide pickup codes for order collection</p>
                  </div>
                </div>
                <div className="bg-black/20 rounded-lg p-3 border border-blue-500/30">
                  <h4 className="text-white font-medium mb-2">🛠️ Admin Code Management</h4>
                  <div className="text-blue-200 space-y-1">
                    <p>• <strong>P-codes:</strong> Use "Pre-paid Lookup Verification" tab</p>
                    <p>• <strong>C-codes:</strong> Use "Cash Pickup Lookup" tab</p>
                    <p>• Admin dashboard accessible via ⚙️ button (admin users)</p>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center space-x-4 text-xs text-gray-400">
                <span>🔒 Members-only platform</span>
                <span>📍 Pickup only service</span>
                <span>💰 Cash accepted</span>
                <span>🆔 ID verification required</span>
              </div>
            </div>
            <button 
              onClick={() => {
                const banner = document.querySelector('[data-instruction-banner]');
                if (banner) banner.style.display = 'none';
                localStorage.setItem('instruction_banner_dismissed', 'true');
              }}
              className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      <main>
        <HeroSection 
          onAuthClick={handleAuthClick} 
          cartItems={cartItems}
          setCartItems={setCartItems}
          user={user}
        />
        <DeliveryComingSoon />
        <div className="container mx-auto px-4 py-8">
          <DailyUpdates />
        </div>
        <ProductSelection 
          user={user} 
          cartItems={cartItems}
          setCartItems={setCartItems}
          onOpenCart={handleOpenCart}
        />
      </main>
      <Footer />
      <Toaster />
      
      {showAuthModal && (
        <AuthModal onClose={handleCloseAuth} />
      )}
    </div>
  );
};

function App() {
  const [isLawEnforcementVerified, setIsLawEnforcementVerified] = useState(false);
  const [isReEntryCodeVerified, setIsReEntryCodeVerified] = useState(false);
  const [isSuperAdminMode, setIsSuperAdminMode] = useState(false);

  // Check verification states on load - STRICT SECURITY MODE
  useEffect(() => {
    // Check if user is already authenticated as admin
    const accessToken = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user_data');
    const adminToken = localStorage.getItem('admin_token');
    
    let isAuthenticatedAdmin = false;
    
    if (accessToken && userData) {
      try {
        const user = JSON.parse(userData);
        if (user.email === 'admin@statusxsmoakland.com' || user.role === 'super_admin') {
          isAuthenticatedAdmin = true;
        }
      } catch (error) {
        console.log('Error parsing user data:', error);
      }
    }
    
    if (adminToken) {
      isAuthenticatedAdmin = true;
    }
    
    // If user is authenticated admin, skip verification for admin routes
    if (isAuthenticatedAdmin && window.location.pathname === '/admin') {
      setIsLawEnforcementVerified(true);
      setIsReEntryCodeVerified(true);
      return;
    }
    
    // SECURITY FIX: Clear bypass mechanisms but preserve legitimate auth tokens
    const bypassKeys = [
      'super_admin_bypass', 
      'super_admin_demo_token',
      'demo_admin_token'
      // NOTE: Preserved admin_token, access_token and user_data to allow session persistence
    ];
    
    bypassKeys.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    
    // For non-admin users or main app, require fresh verification
    if (!isAuthenticatedAdmin || window.location.pathname === '/') {
      sessionStorage.removeItem('law_enforcement_verified');
      sessionStorage.removeItem('reentry_verified');
      sessionStorage.removeItem('app_session_active');
      
      // Always start with verification screens
      setIsLawEnforcementVerified(false);
      setIsReEntryCodeVerified(false);
    }
    
    // Verification states cleared, authentication required
    
    console.log('App useEffect - Verification states:', { 
      isLawEnforcementVerified, 
      isReEntryCodeVerified,
      hasToken: !!localStorage.getItem('access_token'),
      hasUserData: !!localStorage.getItem('user_data')
    });
    
    setIsSuperAdminMode(false); // No super admin bypasses allowed
  }, []);

  const handleLawEnforcementVerification = () => {
    setIsLawEnforcementVerified(true);
    sessionStorage.setItem('law_enforcement_verified', 'true');
  };

  const handleReEntryCodeVerification = () => {
    setIsReEntryCodeVerified(true);
    sessionStorage.setItem('reentry_verified', 'true');
  };

  const getAppContent = () => {
    if (!isLawEnforcementVerified) {
      return <LawEnforcementScreen onVerified={handleLawEnforcementVerification} />;
    }
    
    if (!isReEntryCodeVerified) {
      return <ReEntryCodeScreen onVerified={handleReEntryCodeVerification} userEmail="demo@example.com" />;
    }
    
    // After verification, show login-only access
    return <LoginOnlyApp />;
  };

  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={
              <ScreenshotProtection>
                {getAppContent()}
              </ScreenshotProtection>
            } />
            <Route path="/checkout/success" element={<CheckoutSuccess />} />
            <Route path="/checkout/cancel" element={<CheckoutCancel />} />
            <Route path="/admin" element={
              <ScreenshotProtection>
                <AdminOnlyApp />
              </ScreenshotProtection>
            } />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
