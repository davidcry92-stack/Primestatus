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

  const handleAuthClick = () => {
    setShowAuthModal(true);
  };

  const handleCloseAuth = () => {
    setShowAuthModal(false);
  };

  // If user is authenticated but not verified, show verification pending screen
  if (isAuthenticated && user && !user.is_verified) {
    return <VerificationPending user={user} />;
  }

  return (
    <div className="min-h-screen bg-black">
      <Header 
        user={isAuthenticated ? user : null} 
        cartItems={cartItems} 
        onAuthClick={handleAuthClick}
      />
      <main>
        <HeroSection onAuthClick={handleAuthClick} />
        {/* TEMPORARY: Show all features for demonstration */}
        <ProductSelection user={isAuthenticated ? user : {
          username: "DemoUser",
          membership_tier: "premium",
          membershipTier: "premium",
          is_verified: true
        }} />
        <DailyDeals user={isAuthenticated ? user : {
          username: "DemoUser",
          membership_tier: "premium",
          membershipTier: "premium",
          is_verified: true
        }} />
        <Wictionary user={isAuthenticated ? user : {
          username: "DemoUser",
          membership_tier: "premium",
          membershipTier: "premium",
          is_verified: true
        }} />
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

  // Check for super admin mode on load
  useEffect(() => {
    const adminToken = localStorage.getItem('admin_token');
    const superAdminBypass = localStorage.getItem('super_admin_bypass');
    
    if (adminToken || superAdminBypass === 'true') {
      setIsSuperAdminMode(true);
      setIsLawEnforcementVerified(true);
      setIsReEntryCodeVerified(true);
    }

    // Only require re-entry verification if the app was completely closed
    // Check if this is a fresh session (no verification states stored)
    const wasAppClosed = !sessionStorage.getItem('app_session_active');
    
    if (wasAppClosed) {
      sessionStorage.setItem('app_session_active', 'true');
      // Keep current verification requirements for fresh sessions
    } else {
      // App was just navigating, bypass re-entry requirements
      setIsLawEnforcementVerified(true);
      setIsReEntryCodeVerified(true);
    }
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
