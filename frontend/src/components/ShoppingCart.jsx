import React, { useState, useEffect } from 'react';
import { ShoppingCart as ShoppingCartIcon, Plus, Minus, X, CreditCard, Package } from 'lucide-react';
import SquareCheckout from './SquareCheckout';

const ShoppingCart = ({ cartItems, setCartItems, user, setOpenCartCallback }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showPaymentSelection, setShowPaymentSelection] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);

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

    // Close the cart modal first
    setIsOpen(false);
    
    // Then show payment method selection
    setShowPaymentSelection(true);
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
    setShowPaymentSelection(false);
    setSelectedPaymentMethod(null);
  };

  const handlePaymentMethodSelect = (paymentMethod) => {
    setSelectedPaymentMethod(paymentMethod);
    setShowPaymentSelection(false);
    
    if (paymentMethod === 'card') {
      // Use Square for credit/debit card payments
      setShowCheckout(true);
    } else if (paymentMethod === 'cash') {
      // Handle cash in-person pickup
      handleCashPickup();
    }
  };

  const handleCashPickup = async () => {
    try {
      const pickupCode = 'C' + Math.floor(100000 + Math.random() * 900000).toString();
      const orderId = 'CASH-' + Date.now();
      
      // Store cash pickup order in backend
      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      const orderData = {
        user_id: user.id,
        user_email: user.email,
        pickup_code: pickupCode,
        order_id: orderId,
        items: cartItems,
        total_amount: getTotalPrice(),
        payment_method: 'cash_pickup',
        status: 'pending_pickup',
        created_at: new Date().toISOString()
      };

      const response = await fetch(`${backendUrl}/api/admin/cash-pickups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        setCartItems([]);
        setIsOpen(false);
        
        alert(`✅ Cash Pickup Order Reserved!\n\n📋 Your Pickup Code: ${pickupCode}\n\n💵 PAYMENT PROCESS:\n• Bring exact cash amount: $${getTotalPrice()}\n• Present this pickup code to our staff\n• Staff will verify your code and process payment\n• You'll receive your order after payment\n\n📍 Pickup Location: [Your Location]\n💼 Order ID: ${orderId}\n\n⏰ Orders held for 24 hours\n📧 Confirmation sent to ${user.email}`);
      } else {
        throw new Error('Failed to create cash pickup order');
      }
    } catch (error) {
      console.error('Error creating cash pickup order:', error);
      alert('Error creating cash pickup order. Please try again.');
    }
  };

  const handleSquarePaymentSuccess = (paymentResult) => {
    // Clear cart and close modals  
    setCartItems([]);
    setShowCheckout(false);
    setIsOpen(false);
    
    // Show success message with pickup code
    alert(`🎉 Credit/Debit Payment Successful!\n\n📋 Your Pickup Code: ${paymentResult.pickupCode}\n\n💳 Payment processed via Square\n📍 Show this code at our pickup location\n💼 Order ID: ${paymentResult.orderId}\n💰 Amount: $${paymentResult.amount.toFixed(2)}\n\n📧 Receipt sent to your email\n\n⏰ Present this code when you arrive for pickup.`);
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
              backgroundColor: '#1f2937',
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
                    padding: '15px',
                    margin: '10px 0',
                    borderRadius: '8px',
                    backgroundColor: '#f9f9f9'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <p style={{color: 'black', fontWeight: 'bold', margin: '0 0 8px 0'}}>{item.name}</p>
                        <p style={{color: 'black', margin: '0 0 4px 0'}}>Price: ${item.price}</p>
                        <p style={{color: 'black', margin: '0 0 8px 0'}}>Total: ${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                      
                      {/* Remove button */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        style={{
                          backgroundColor: '#ff4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '30px',
                          height: '30px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '16px',
                          marginLeft: '10px'
                        }}
                        title="Remove from cart"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    
                    {/* Quantity controls */}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      marginTop: '10px',
                      padding: '8px',
                      backgroundColor: '#ffffff',
                      borderRadius: '4px',
                      border: '1px solid #ddd'
                    }}>
                      <span style={{ color: 'black', fontWeight: '500' }}>Quantity:</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          style={{
                            backgroundColor: '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            width: '32px',
                            height: '32px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          title="Decrease quantity"
                        >
                          <Minus size={16} />
                        </button>
                        
                        <span style={{ 
                          color: 'black', 
                          fontWeight: 'bold',
                          minWidth: '30px',
                          textAlign: 'center'
                        }}>
                          {item.quantity}
                        </span>
                        
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          style={{
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            width: '32px',
                            height: '32px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          title="Increase quantity"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Clear Cart Button */}
            {cartItems.length > 0 && (
              <div style={{ textAlign: 'center', margin: '15px 0' }}>
                <button
                  onClick={() => setCartItems([])}
                  style={{
                    backgroundColor: '#dc3545',
                    color: 'white',
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                  title="Clear all items from cart"
                >
                  Clear Cart
                </button>
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
      )}

      {/* Commented section removed to fix syntax error */}

      {/* Payment Method Selection Modal */}
      {showPaymentSelection && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="max-w-md w-full mx-4">
            <div className="bg-gray-900 border border-green-400 rounded-lg p-8 relative">
              {/* Close button */}
              <button
                onClick={() => {
                  setShowPaymentSelection(false);
                  setIsOpen(true); // Reopen cart if user cancels
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
              
              <h2 className="text-2xl font-bold text-white text-center mb-6">Choose Payment Method</h2>
              
              {/* Order Summary */}
              <div className="bg-gray-800 rounded-lg p-4 mb-6">
                <h3 className="text-white font-semibold mb-2">Order Summary</h3>
                {cartItems.map(item => (
                  <div key={item.id} className="flex justify-between text-gray-300 text-sm mb-1">
                    <span>{item.name} x{item.quantity}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t border-gray-600 pt-2 mt-2">
                  <div className="flex justify-between text-white font-bold">
                    <span>Total</span>
                    <span>${getTotalPrice()}</span>
                  </div>
                </div>
              </div>

              {/* Payment Options */}
              <div className="space-y-4">
                {/* Credit/Debit Card Option */}
                <button
                  onClick={() => handlePaymentMethodSelect('card')}
                  className="w-full p-4 bg-green-600 hover:bg-green-700 text-white rounded-lg border-2 border-green-400 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <CreditCard className="h-6 w-6 mr-3" />
                    <div className="text-left">
                      <div className="font-semibold">Credit/Debit Card</div>
                      <div className="text-sm text-green-100">Pay online with card</div>
                    </div>
                  </div>
                  <span className="text-xl">💳</span>
                </button>

                {/* Cash In-Person Pickup Option */}
                <button
                  onClick={() => handlePaymentMethodSelect('cash')}
                  className="w-full p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg border-2 border-blue-400 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <Package className="h-6 w-6 mr-3" />
                    <div className="text-left">
                      <div className="font-semibold">Cash In-Person Pick-Up</div>
                      <div className="text-sm text-blue-100">Reserve order • Get pickup code • Pay cash at location</div>
                    </div>
                  </div>
                  <span className="text-xl">💵</span>
                </button>
              </div>

              {/* Cancel Button */}
              <button
                onClick={handlePaymentCancel}
                className="w-full mt-6 p-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Square Checkout Modal */}
      {showCheckout && selectedPaymentMethod === 'card' && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <SquareCheckout
              cartItems={cartItems}
              onSuccess={handleSquarePaymentSuccess}
              onCancel={handlePaymentCancel}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingCart;