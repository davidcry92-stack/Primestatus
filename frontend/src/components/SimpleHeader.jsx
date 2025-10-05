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
          
          {/* Hamburger Menu Button */}
          <button onClick={toggleMobileMenu} className="text-white hover:text-gray-300">
            {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu Dropdown */}
      {showMobileMenu && (
        <div className="absolute top-full right-0 w-64 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-50 m-4">
          <div className="p-4">
            {user && (
              <div className="border-b border-gray-600 pb-4 mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">{user.full_name || user.username}</div>
                    <div className="text-sm text-gray-400">{user.email}</div>
                    <div className="text-xs text-blue-400 capitalize">{user.membership_tier} Member</div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              {user && (
                <button
                  onClick={() => {
                    setShowMobileMenu(false);
                    onShowProfile && onShowProfile();
                  }}
                  className="w-full text-left px-3 py-2 text-white hover:bg-gray-800 rounded-lg flex items-center space-x-3"
                >
                  <User className="h-4 w-4" />
                  <span>My Profile</span>
                </button>
              )}
              
              {user ? (
                <button
                  onClick={() => {
                    setShowMobileMenu(false);
                    onLogout && onLogout();
                  }}
                  className="w-full text-left px-3 py-2 text-red-400 hover:bg-gray-800 rounded-lg flex items-center space-x-3"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setShowMobileMenu(false);
                    onAuthClick && onAuthClick();
                  }}
                  className="w-full text-left px-3 py-2 text-white hover:bg-gray-800 rounded-lg flex items-center space-x-3"
                >
                  <User className="h-4 w-4" />
                  <span>Login</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
    </div>
  );
};

export default SimpleHeader;