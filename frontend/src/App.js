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
  const [cartItems, setCartItems] = useState([]);
  
  // TEMPORARY: Mock premium user for feature demonstration
  const mockPremiumUser = {
    id: "demo-user-123",
    username: "DemoUser",
    email: "demo@smoakland.com",
    full_name: "Demo Premium User",
    membership_tier: "premium",
    membershipTier: "premium", // Also add camelCase version for compatibility
    is_verified: true,
    wictionary_access: true,
    preferences: {
      categories: ["flower", "edibles", "vapes"],
      price_range: [20, 150]
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Header 
        user={mockPremiumUser} 
        cartItems={cartItems} 
        onAuthClick={() => {}} // No-op since we're showing as logged in
      />
      <main>
        <HeroSection onAuthClick={() => {}} />
        <ProductSelection />
        <DailyDeals user={mockPremiumUser} />
        <Wictionary />
      </main>
      <Footer />
      <Toaster />
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
