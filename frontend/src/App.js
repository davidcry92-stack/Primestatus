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
        {isAuthenticated ? (
          <>
            <ProductSelection />
            <DailyDeals user={user} />
            <Wictionary />
          </>
        ) : (
          <div className="min-h-[50vh] flex items-center justify-center">
            <div className="text-center text-white">
              <h2 className="text-2xl font-bold mb-4">Welcome to StatusXSmoakland</h2>
              <p className="text-gray-400 mb-6">Please sign in or register to access our premium cannabis marketplace</p>
              <button
                onClick={handleAuthClick}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold"
              >
                Join Now
              </button>
            </div>
          </div>
        )}
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

  const handleLawEnforcementVerification = () => {
    setIsLawEnforcementVerified(true);
  };

  const handleReEntryCodeVerification = () => {
    setIsReEntryCodeVerified(true);
  };

  const getAppContent = () => {
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
