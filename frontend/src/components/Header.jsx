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
import ShoppingCartComponent from './ShoppingCart';

const Header = ({ user, cartItems = [], setCartItems, onAuthClick }) => {
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
            {/* Logo */}
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
              {/* Sign In Button or NYC EXCLUSIVE Badge */}
              {!user ? (
                <Button 
                  onClick={onAuthClick}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 text-sm"
                >
                  Sign In
                </Button>
              ) : (
                <Badge className="bg-yellow-500 text-black font-bold text-xs">
                  NYC EXCLUSIVE
                </Badge>
              )}
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#products" className="text-gray-300 hover:text-white transition-colors">
                Products
              </a>
              {/* Daily Deals removed per admin request */}
              {user?.membershipTier === 'premium' && (
                <a href="#wellness-center" className="text-purple-400 hover:text-purple-300 transition-colors flex items-center space-x-1">
                  <Crown className="h-4 w-4" />
                  <span>Health-Aid</span>
                </a>
              )}
            </nav>

            {/* Right side */}
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

              {/* Cart */}
              <ShoppingCartComponent 
                cartItems={cartItems} 
                setCartItems={setCartItems} 
                user={user} 
              />

              {/* Admin Dashboard Button */}
              {user && user.email === 'admin@statusxsmoakland.com' && (
                <Button
                  onClick={() => {
                    // Navigate to admin dashboard - authenticated users only can reach this
                    window.location.href = '/admin';
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-2 text-sm"
                >
                  🛡️ Admin Dashboard
                </Button>
              )}

              {/* User Profile */}
              {user && (
                <div className="flex items-center space-x-2">
                  <div className="hidden sm:block text-right">
                    <p className="text-white text-sm font-medium">{user.username}</p>
                    <div className="flex items-center space-x-1">
                      {user.membershipTier === 'premium' && (
                        <Crown className="h-3 w-3 text-yellow-400" />
                      )}
                      <p className="text-xs text-gray-400 capitalize">
                        {user.membershipTier || user.role} {user.role === 'super_admin' ? 'Admin' : 'Member'}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" className="text-white hover:text-green-400">
                    <User className="h-5 w-5" />
                  </Button>
                </div>
              )}

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
                  <Crown className="h-4 w-4" />
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