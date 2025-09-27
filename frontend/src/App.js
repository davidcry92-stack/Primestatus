import React, { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";

// Components
import ScreenshotProtection from "./components/ScreenshotProtection";
import LawEnforcementScreen from "./components/LawEnforcementScreen";
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import ProductGrid from "./components/ProductGrid";
import DailyDeals from "./components/DailyDeals";
import Wictionary from "./components/Wictionary";
import Footer from "./components/Footer";
import AuthModal from "./components/AuthModal";

// Context
import { AuthProvider, useAuth } from "./contexts/AuthContext";

const MainApp = () => {
  const { user, loading } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [showAuthModal, setShowAuthModal] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Header 
        user={user} 
        cartItems={cartItems} 
        onAuthClick={() => setShowAuthModal(true)}
      />
      <main>
        <HeroSection onAuthClick={() => setShowAuthModal(true)} />
        <ProductGrid />
        <DailyDeals />
        <Wictionary />
      </main>
      <Footer />
      
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
      
      <Toaster />
    </div>
  );
};

function App() {
  const [isVerified, setIsVerified] = useState(false);

  const handleVerification = () => {
    setIsVerified(true);
  };

  return (
    <ScreenshotProtection>
      <AuthProvider>
        <div className="App">
          <BrowserRouter>
            <Routes>
              <Route 
                path="/" 
                element={
                  isVerified ? (
                    <MainApp />
                  ) : (
                    <LawEnforcementScreen onVerified={handleVerification} />
                  )
                } 
              />
            </Routes>
          </BrowserRouter>
        </div>
      </AuthProvider>
    </ScreenshotProtection>
  );
}

export default App;
