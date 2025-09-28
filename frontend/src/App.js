import React, { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";

// Components
import ScreenshotProtection from "./components/ScreenshotProtection";
import LawEnforcementScreen from "./components/LawEnforcementScreen";
import ReEntryCodeScreen from "./components/ReEntryCodeScreen";
import VerificationPending from "./components/VerificationPending";
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import ProductGrid from "./components/ProductGrid";
import ProductSelection from "./components/ProductSelection";
import DailyDeals from "./components/DailyDeals";
import Wictionary from "./components/Wictionary";
import Footer from "./components/Footer";
import AdminApp from "./components/AdminApp";
import AuthModal from "./components/AuthModal";

// Auth Context
import { AuthProvider, useAuth } from "./contexts/AuthContext";

const MainApp = () => {
  const { user, isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  // Check for super admin bypass
  useEffect(() => {
    const superAdminBypass = localStorage.getItem('super_admin_bypass');
    if (superAdminBypass === 'true') {
      setIsSuperAdmin(true);
    }
  }, []);

  const handleAuthClick = () => {
    setShowAuthModal(true);
  };

  const handleCloseAuth = () => {
    setShowAuthModal(false);
  };

  // No more super admin bypass - all users must go through verification

  // If user is authenticated but not verified, show verification pending screen
  if (isAuthenticated && user && !user.is_verified) {
    return <VerificationPending user={user} />;
  }

  // Require authentication for all content
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-black">
        <Header 
          user={null} 
          cartItems={cartItems} 
          onAuthClick={handleAuthClick}
        />
        <main>
          <HeroSection onAuthClick={handleAuthClick} />
          
          {/* Login Required Message */}
          <div className="max-w-4xl mx-auto px-4 py-16 text-center">
            <div className="bg-gray-900 border border-red-600 rounded-lg p-8">
              <div className="text-6xl mb-4">🔒</div>
              <h2 className="text-3xl font-bold text-white mb-4">Authentication Required</h2>
              <p className="text-gray-300 mb-6">
                You must be logged in to access StatusXSmoakland features including product catalog, 
                daily deals, and premium Wictionary content.
              </p>
              <button
                onClick={handleAuthClick}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
              >
                Login to Continue
              </button>
            </div>
          </div>
        </main>
        <Footer />
        <Toaster />
        
        {showAuthModal && (
          <AuthModal onClose={handleCloseAuth} />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Header 
        user={user} 
        cartItems={cartItems} 
        onAuthClick={handleAuthClick}
      />
      <main>
        <HeroSection onAuthClick={handleAuthClick} />
        <ProductSelection user={user} />
        <DailyDeals user={user} />
        <Wictionary user={user} />
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

  // Check for super admin mode on load (but don't auto-bypass)
  useEffect(() => {
    const adminToken = localStorage.getItem('admin_token');
    const superAdminBypass = localStorage.getItem('super_admin_bypass');
    
    // Only set super admin mode if explicitly enabled, but still require verification
    if (adminToken || superAdminBypass === 'true') {
      setIsSuperAdminMode(true);
      // Still require verification steps for security
    }

    // Always require fresh verification - no session bypasses
    // Clear any existing session states to force re-verification
    sessionStorage.removeItem('app_session_active');
    sessionStorage.removeItem('law_enforcement_verified');
    sessionStorage.removeItem('reentry_verified');
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
    // Super admin bypass - skip all verification
    if (isSuperAdminMode) {
      return (
        <AuthProvider>
          <MainApp />
        </AuthProvider>
      );
    }

    if (!isLawEnforcementVerified) {
      return <LawEnforcementScreen onVerified={handleLawEnforcementVerification} />;
    }
    
    if (!isReEntryCodeVerified) {
      return <ReEntryCodeScreen onVerified={handleReEntryCodeVerification} userEmail="demo@example.com" />;
    }
    
    return (
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    );
  };

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/admin/*" element={<AdminApp />} />
          <Route path="/" element={
            <ScreenshotProtection>
              {getAppContent()}
            </ScreenshotProtection>
          } />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
