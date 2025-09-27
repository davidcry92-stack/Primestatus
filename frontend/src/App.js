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

// Mock data (temporary) - Updated to show unverified user
import { mockUserProfile } from "./data/mock";

const MainApp = () => {
  const [user, setUser] = useState({
    ...mockUserProfile,
    is_verified: true, // Set to true to show verified user experience
    verification_status: 'approved',
    requires_medical: false,
    age_verified: 25
  });
  const [cartItems, setCartItems] = useState([]);

  // If user is not verified, show verification pending screen
  if (!user.is_verified) {
    return <VerificationPending user={user} />;
  }

  return (
    <div className="min-h-screen bg-black">
      <Header user={user} cartItems={cartItems} />
      <main>
        <HeroSection />
        <ProductSelection />
        <DailyDeals user={user} />
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
    
    return <MainApp />;
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
