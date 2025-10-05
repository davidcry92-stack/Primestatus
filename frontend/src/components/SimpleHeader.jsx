import React, { useState } from 'react';
import { Menu, User, X, LogOut } from 'lucide-react';
import ShoppingCart from './ShoppingCart';

const SimpleHeader = ({ user, cartItems = [], setCartItems, onAuthClick, onOpenCart, setOpenCartCallback, onShowProfile, onLogout }) => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  return (
    <div className="relative">{/* Add wrapper for positioning */}
    <header className="bg-black text-white p-4">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-4">
          <img 
            src="https://customer-assets.emergentagent.com/job_herbal-memberhub/artifacts/g7wqgiz2_Logo.png" 
            alt="StatusXSmoakland Logo" 
            className="h-10 w-auto"
          />
          <div className="text-xl font-bold">
            <span className="text-green-400">Status</span>
            <span className="text-yellow-400">X</span>
            <span className="text-green-400">Smoakland</span>
          </div>
        </div>
        
        {/* Right side - Cart, Admin Button, and Menu */}
        <div className="flex items-center space-x-4">
          {/* Admin Dashboard Button - only show for admin users */}
          {user && (user.email === 'admin@statusxsmoakland.com' || user.role === 'super_admin') && (
            <button
              onClick={() => window.location.href = '/admin'}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 font-bold border-2 border-red-500"
            >
              <span className="text-lg">⚙️</span>
              <span>Admin Dashboard</span>
            </button>
          )}
          
          {/* DEBUG: Show if we have user data */}
          {user && console.log('SimpleHeader user:', user.email, user.role)}
          
          <ShoppingCart 
            cartItems={cartItems}
            setCartItems={setCartItems}
            user={user}
            setOpenCartCallback={setOpenCartCallback}
          />
          <Menu className="h-6 w-6" />
        </div>
      </div>
    </header>
  );
};

export default SimpleHeader;