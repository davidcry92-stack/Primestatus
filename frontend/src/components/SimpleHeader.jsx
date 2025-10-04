import React from 'react';
import { Menu } from 'lucide-react';
import ShoppingCart from './ShoppingCart';

const SimpleHeader = ({ user, cartItems = [], setCartItems, onAuthClick, onOpenCart, setOpenCartCallback }) => {
  return (
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
        
        {/* Right side - Cart and Menu */}
        <div className="flex items-center space-x-4">
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