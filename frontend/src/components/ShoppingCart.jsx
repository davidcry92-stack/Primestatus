import React, { useState, useEffect } from 'react';
import { ShoppingCart as ShoppingCartIcon, Plus, Minus, X, CreditCard, Package } from 'lucide-react';
import SquareCheckout from './SquareCheckout';

const ShoppingCart = ({ cartItems, setCartItems, user, setOpenCartCallback }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  // Fetch available payment packages
  useEffect(() => {
    fetchPackages();
  }, []);

  // Register cart opening function with parent
  useEffect(() => {
    if (setOpenCartCallback) {
      setOpenCartCallback(() => () => {
        console.log('ShoppingCart: Opening cart modal, setting isOpen to true');
        setIsOpen(true);
      });
    }
  }, [setOpenCartCallback]);

  const fetchPackages = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      const response = await fetch(`${backendUrl}/api/payments/packages`);
      const data = await response.json();
      setPackages(data.packages || []);
    } catch (error) {
      console.error('Error fetching packages:', error);
    }
  };

  const addToCart = (product, quantity = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevItems, { ...product, quantity }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === productId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const selectPackage = (packageData) => {
    // Clear cart and add package as virtual item
    setCartItems([{
      id: `package-${packageData.id}`,
      name: packageData.name,
      price: packageData.amount,
      quantity: 1,
      isPackage: true,
      packageId: packageData.id,
      description: packageData.description
    }]);
  };

  const handleCheckout = async () => {
    if (!user) {
      alert('Please log in to checkout');
      return;
    }

    if (cartItems.length === 0) {
      alert('Your cart is empty');
      return;
    }

    // Show Square checkout form
    setShowCheckout(true);
  };

  const handlePaymentSuccess = (paymentResult) => {
    // Clear cart and close modals
    setCartItems([]);
    setShowCheckout(false);
    setIsOpen(false);
    
    // Show success message with pickup code
    alert(`🎉 Payment Successful!\n\n📋 Your Pickup Code: ${paymentResult.pickupCode}\n\n📍 Show this code at our NYC pickup location\n💳 Order ID: ${paymentResult.orderId}\n💰 Amount: $${paymentResult.amount.toFixed(2)}\n\n📧 Receipt sent to your email\n\n⏰ Admin will verify this code when you pickup your order.`);
  };

  const handlePaymentCancel = () => {
    setShowCheckout(false);
  };

  return (
    <div className="relative">
      {/* Cart Toggle Button */}
      <button
        data-cart-button="true"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('Cart button clicked - current isOpen:', isOpen);
          console.log('Setting isOpen to true');
          setIsOpen(true);
          console.log('Cart should now be open');
        }}
        className="relative p-2 text-white hover:text-green-400 transition-colors"
      >
        <ShoppingCartIcon className="h-6 w-6" />
        {getTotalItems() > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {getTotalItems()}
          </span>
        )}
      </button>

      {/* DEBUG: Show when cart should be open */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          top: '10px',
          left: '10px',
          background: 'red',
          color: 'white',
          padding: '10px',
          zIndex: 999999,
          fontSize: '20px'
        }}>
          CART IS OPEN
        </div>
      )}

      {/* Cart Sidebar - SIMPLIFIED */}
      {isOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            zIndex: 99999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
          onClick={() => setIsOpen(false)}
        >
          <div 
            style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '10px',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{color: 'black', marginBottom: '20px', textAlign: 'center'}}>
              🛒 YOUR CART ({getTotalItems()} items)
            </h2>
            
            {/* Cart Items */}
            {cartItems.length === 0 ? (
              <p style={{color: 'black', textAlign: 'center'}}>Your cart is empty</p>
            ) : (
              <div>
                {cartItems.map((item, index) => (
                  <div key={index} style={{
                    border: '1px solid #ccc',
                    padding: '10px',
                    margin: '10px 0',
                    borderRadius: '5px',
                    backgroundColor: '#f9f9f9'
                  }}>
                    <p style={{color: 'black', fontWeight: 'bold'}}>{item.name}</p>
                    <p style={{color: 'black'}}>Quantity: {item.quantity}</p>
                    <p style={{color: 'black'}}>Price: ${item.price}</p>
                  </div>
                ))}
              </div>
            )}
            
            {/* Checkout Button */}
            {cartItems.length > 0 && (
              <button
                onClick={handleCheckout}
                style={{
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  padding: '15px 30px',
                  border: 'none',
                  borderRadius: '5px',
                  fontSize: '16px',
                  width: '100%',
                  marginTop: '20px',
                  cursor: 'pointer'
                }}
              >
                🚀 PROCEED TO CHECKOUT
              </button>
            )}
            
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              style={{
                backgroundColor: '#f44336',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '5px',
                marginTop: '10px',
                width: '100%',
                cursor: 'pointer'
              }}
            >
              ✖ Close Cart
            </button>
          </div>
        </div>
      ) : null}

      {/* OLD COMPLEX MODAL - COMMENTED OUT */}
      {/* {isOpen ? (
        <div 
          className="fixed inset-0 overflow-hidden"
          style={{
            zIndex: 99999,
            display: 'block',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)'
          }}
        >
          <div 
            className="absolute inset-0 bg-black bg-opacity-50" 
            onClick={() => setIsOpen(false)} 
          />
          
          <div 
            className="absolute right-0 top-0 h-full w-full max-w-md bg-gray-900 shadow-xl"
            style={{
              position: 'fixed',
              right: 0,
              top: 0,
              height: '100vh',
              maxWidth: '400px',
              backgroundColor: '#111827',
              zIndex: 100000
            }}
          >
            {/* OLD MODAL CONTENT - COMMENTED OUT
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <ShoppingCartIcon className="h-5 w-5 mr-2" />
                  Cart ({getTotalItems()})
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {cartItems.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    <ShoppingCartIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Your cart is empty</p>
                    <p className="text-sm">Select a package below to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="bg-gray-800 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-white">{item.name}</h3>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        
                        {item.description && (
                          <p className="text-sm text-gray-400 mb-2">{item.description}</p>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {!item.isPackage && (
                              <>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="p-1 rounded bg-gray-700 hover:bg-gray-600 text-white"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="text-white w-8 text-center">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="p-1 rounded bg-gray-700 hover:bg-gray-600 text-white"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </>
                            )}
                          </div>
                          <span className="font-bold text-green-400">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Payment Packages */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    Payment Packages
                  </h3>
                  <div className="grid gap-3">
                    {packages.map((pkg) => (
                      <div
                        key={pkg.id}
                        className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-green-500 transition-colors cursor-pointer"
                        onClick={() => selectPackage(pkg)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-white">{pkg.name}</h4>
                            <p className="text-sm text-gray-400">{pkg.description}</p>
                          </div>
                          <span className="font-bold text-green-400">${pkg.amount}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              {cartItems.length > 0 && (
                <div className="border-t border-gray-700 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-semibold text-white">Total:</span>
                    <span className="text-xl font-bold text-green-400">
                      ${getTotalPrice().toFixed(2)}
                    </span>
                  </div>
                  
                  <button
                    onClick={handleCheckout}
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                  >
                    {loading ? (
                      'Processing...'
                    ) : (
                      <>
                        <CreditCard className="h-5 w-5 mr-2" />
                        Proceed to Checkout
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      END OF OLD MODAL COMMENT */ }

      {/* Square Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <SquareCheckout
              cartItems={cartItems}
              onSuccess={handlePaymentSuccess}
              onCancel={handlePaymentCancel}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingCart;