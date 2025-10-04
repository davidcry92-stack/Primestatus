import { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  User, 
  ShoppingCart, 
  Menu, 
  X, 
  Crown, 
  Instagram, 
  Music 
} from 'lucide-react';
import { mockUserProfile } from '../data/actual-inventory';
import SimpleCart from './SimpleCart';

const Header = ({ user, cartItems = [], setCartItems, onAuthClick, onOpenCart, setOpenCartCallback }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <>
      {/* Top banner */}
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-center py-2 px-4">
        <p className="text-sm font-bold">
          🔥 NYC EXCLUSIVE - StatusXSmoakland - Members Only 🔥
        </p>
      </div>

      <header className="bg-black/95 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo back in header */}
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
              
              {/* Cart right next to logo */}
              <SimpleCart 
                cartItems={cartItems} 
                setCartItems={setCartItems} 
                user={user} 
              />
            </div>
            
            {/* Center Navigation */}
            <nav className="hidden md:flex items-center space-x-8 flex-1 justify-center">
              <a href="#products" className="text-gray-300 hover:text-white transition-colors">
                Products
              </a>
              {user?.membershipTier === 'premium' && (
                <>
                  <a href="#wellness-center" className="text-purple-400 hover:text-purple-300 transition-colors flex items-center space-x-1">
                    <span>📖</span>
                    <span>Wellness Center</span>
                  </a>
                  <a href="#health-aid" className="text-emerald-400 hover:text-emerald-300 transition-colors flex items-center space-x-1">
                    <span>💊</span>
                    <span>Health-Aid</span>
                  </a>
                </>
              )}
            </nav>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              {/* Sign In Button - Keep consistent width */}
              <div style={{ minWidth: '80px' }}>
                {!user ? (
                  <Button 
                    onClick={onAuthClick}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 text-sm"
                  >
                    Sign In
                  </Button>
                ) : (
                  // Empty space for non-admin users to prevent layout shift
                  user.email === 'admin@statusxsmoakland.com' ? (
                    <Badge className="bg-yellow-500 text-black font-bold text-xs">
                      ADMIN
                    </Badge>
                  ) : null
                )}
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#products" className="text-gray-300 hover:text-white transition-colors">
                Products
              </a>
              {/* Daily Deals removed per admin request */}
              {user?.membershipTier === 'premium' && (
                <>
                  <a href="#wellness-center" className="text-purple-400 hover:text-purple-300 transition-colors flex items-center space-x-1">
                    <span>📖</span>
                    <span>Wellness Center</span>
                  </a>
                  <a href="#health-aid" className="text-emerald-400 hover:text-emerald-300 transition-colors flex items-center space-x-1">
                    <span>💊</span>
                    <span>Health-Aid</span>
                  </a>
                </>
              )}
            </nav>

            {/* Right side - Fixed layout to prevent shifting */}
            <div className="flex items-center space-x-4">
              {/* Social Media Links */}
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

              {/* Cart moved to be next to hamburger menu */}

              {/* Fixed space for admin elements to prevent layout shift */}
              <div style={{ minWidth: '200px' }}>
                {user && user.email === 'admin@statusxsmoakland.com' && (
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => {
                        window.location.href = '/admin';
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-2 text-sm"
                    >
                      🛡️ Admin
                    </Button>
                    <Button variant="ghost" className="text-white hover:text-green-400">
                      <User className="h-5 w-5" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                className="md:hidden text-white"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-black/95 border-t border-gray-800">
            <div className="px-4 py-4 space-y-4">
              <a href="#products" className="block text-gray-300 hover:text-white transition-colors">
                Products
              </a>
              {/* Daily Deals removed per admin request */}
              {user?.membershipTier === 'premium' && (
                <a href="#wellness-center" className="block text-purple-400 hover:text-purple-300 transition-colors flex items-center space-x-1">
                  <span>📖</span>
                  <span>Wellness Center</span>
                </a>
              )}
              {user?.membershipTier === 'premium' && (
                <a href="#health-aid" className="block text-emerald-400 hover:text-emerald-300 transition-colors flex items-center space-x-1">
                  <span>💊</span>
                  <span>Health-Aid</span>
                </a>
              )}
              
              {/* Social Links Mobile */}
              <div className="flex items-center space-x-4 pt-4 border-t border-gray-800">
                <a 
                  href="https://www.instagram.com/smoaklandnycbx" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-pink-400 transition-colors flex items-center space-x-2"
                >
                  <Instagram className="h-5 w-5" />
                  <span>@smoaklandnycbx</span>
                </a>
                <a 
                  href="https://www.tiktok.com/@smoaklandnycbx" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2"
                >
                  <Music className="h-5 w-5" />
                  <span>@smoaklandnycbx</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;