import React, { useState, useEffect } from 'react';
import { ShoppingCart as ShoppingCartIcon, Plus, Minus, X, CreditCard, Package } from 'lucide-react';
import SquareCheckout from './SquareCheckout';
import ApplePayCheckout from './ApplePayCheckout';
import GooglePayCheckout from './GooglePayCheckout';

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

  const handleDigitalWalletSuccess = (paymentResult) => {
    console.log('Digital wallet payment successful:', paymentResult);
    
    const paymentMethodName = paymentResult.paymentMethod === 'apple-pay' ? 'Apple Pay' : 'Google Pay';
    alert(`🎉 ${paymentMethodName} payment successful! Your order has been processed.\n\nPayment Code: ${paymentResult.paymentCode}`);
    
    // Clear cart after successful payment
    setCartItems([]);
    setShowCheckout(false);
    setShowPaymentSelection(false);
    setIsOpen(false);
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
                {/* Apple Pay Option */}
                <button
                  onClick={() => handlePaymentMethodSelect('apple-pay')}
                  className="w-full p-4 bg-black hover:bg-gray-800 text-white rounded-lg border-2 border-gray-600 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <div className="h-6 w-6 mr-3 flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                      </svg>
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">Apple Pay</div>
                      <div className="text-sm text-gray-300">Quick and secure with Touch/Face ID</div>
                    </div>
                  </div>
                  <span className="text-xl">🍎</span>
                </button>

                {/* Google Pay Option */}
                <button
                  onClick={() => handlePaymentMethodSelect('google-pay')}
                  className="w-full p-4 bg-white hover:bg-gray-100 text-black rounded-lg border-2 border-gray-300 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <div className="h-6 w-6 mr-3 flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="w-6 h-6">
                        <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">Google Pay</div>
                      <div className="text-sm text-gray-600">Pay with your Google account</div>
                    </div>
                  </div>
                  <span className="text-xl">📱</span>
                </button>

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

      {/* Apple Pay Checkout Modal */}
      {showCheckout && selectedPaymentMethod === 'apple-pay' && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="max-w-lg w-full mx-4">
            <ApplePayCheckout
              cartItems={cartItems}
              totalAmount={getTotalPrice()}
              onSuccess={handleDigitalWalletSuccess}
              onCancel={handlePaymentCancel}
              user={user}
            />
          </div>
        </div>
      )}

      {/* Google Pay Checkout Modal */}
      {showCheckout && selectedPaymentMethod === 'google-pay' && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="max-w-lg w-full mx-4">
            <GooglePayCheckout
              cartItems={cartItems}
              totalAmount={getTotalPrice()}
              onSuccess={handleDigitalWalletSuccess}
              onCancel={handlePaymentCancel}
              user={user}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingCart;