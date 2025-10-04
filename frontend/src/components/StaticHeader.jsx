import React, { useState } from 'react';
import { Menu, X, Instagram, Music } from 'lucide-react';
import { Button } from './ui/button';
import SimpleCart from './SimpleCart';

const StaticHeader = ({ user, cartItems = [], setCartItems, onAuthClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      {/* Top banner - ALWAYS SAME */}
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-center py-2 px-4">
        <p className="text-sm font-bold">
          🔥 NYC EXCLUSIVE - StatusXSmoakland - Members Only 🔥
        </p>
      </div>

      <header className="bg-black/95 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* LEFT: Logo + Cart - ALWAYS SAME */}
            <div className="flex items-center space-x-4">
              <img 
                src="https://customer-assets.emergentagent.com/job_herbal-memberhub/artifacts/g7wqgiz2_Logo.png" 
                alt="StatusXSmoakland Logo" 
                className="h-12 w-auto"
              />
              <div className="text-2xl font-bold text-white">
                <span className="text-green-400">Status</span>
                <span className="text-yellow-400">X</span>
                <span className="text-green-400">Smoakland</span>
              </div>
              
              <SimpleCart 
                cartItems={cartItems} 
                setCartItems={setCartItems} 
                user={user} 
              />
            </div>
            
            {/* CENTER: Navigation - ALWAYS SAME */}
            <nav className="hidden md:flex items-center space-x-8 flex-1 justify-center">
              <a href="#products" className="text-gray-300 hover:text-white transition-colors">
                Products
              </a>
              <a href="#wellness-center" className="text-purple-400 hover:text-purple-300 transition-colors flex items-center space-x-1">
                <span>📖</span>
                <span>Wellness Center</span>
              </a>
              <a href="#health-aid" className="text-emerald-400 hover:text-emerald-300 transition-colors flex items-center space-x-1">
                <span>💊</span>
                <span>Health-Aid</span>
              </a>
            </nav>

            {/* RIGHT: Social + Menu - ALWAYS SAME */}
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2">
                <a 
                  href="https://www.instagram.com/smoaklandnycbx" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-pink-400 transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a 
                  href="https://www.tiktok.com/@smoaklandnycbx" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Music className="h-5 w-5" />
                </a>
              </div>

              {/* Fixed width space for admin stuff */}
              <div style={{ minWidth: '150px', textAlign: 'right' }}>
                {user?.email === 'admin@statusxsmoakland.com' && (
                  <Button
                    onClick={() => window.location.href = '/admin'}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1 text-xs"
                  >
                    Admin
                  </Button>
                )}
              </div>

              <Button
                variant="ghost"
                className="text-white"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation - ALWAYS SAME */}
        {isMenuOpen && (
          <div className="md:hidden bg-black/95 border-t border-gray-800">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="#products" className="block text-gray-300 hover:text-white transition-colors px-3 py-2">
                Products
              </a>
              <a href="#wellness-center" className="block text-purple-400 hover:text-purple-300 transition-colors px-3 py-2">
                📖 Wellness Center
              </a>
              <a href="#health-aid" className="block text-emerald-400 hover:text-emerald-300 transition-colors px-3 py-2">
                💊 Health-Aid
              </a>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default StaticHeader;