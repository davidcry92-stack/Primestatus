import React, { useState } from 'react';
import { ShoppingCart as ShoppingCartIcon } from 'lucide-react';
import CheckoutPage from './CheckoutPage';

const SimpleCart = ({ cartItems = [], setCartItems, user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCartClick = () => {
    if (!user) {
      alert('Please login to access your cart');
      return;
    }
    console.log('SimpleCart: Cart button clicked');
    setIsOpen(!isOpen);
  };

  return (
    <div>
      {/* Cart Button - Always visible to prevent layout shift */}
      <button
        onClick={handleCartClick}
        style={{
          backgroundColor: '#059669',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '6px',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          minWidth: '100px' // Fixed width to prevent shifting
        }}
      >
        <ShoppingCartIcon size={20} />
        Cart ({getTotalItems()})
      </button>

      {/* Cart Modal - Mobile Responsive */}
      {isOpen && user && (
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
            alignItems: 'center',
            padding: '10px'
          }}
          onClick={() => setIsOpen(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '10px',
              width: '100%',
              maxWidth: '500px',
              maxHeight: '90vh',
              overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{color: 'black', marginBottom: '20px', textAlign: 'center', fontSize: '24px'}}>
              🛒 YOUR CART
            </h2>

            {cartItems.length === 0 ? (
              <div style={{textAlign: 'center', padding: '40px'}}>
                <p style={{color: 'black', fontSize: '18px'}}>Your cart is empty</p>
                <p style={{color: 'gray', marginTop: '10px'}}>Add some items to get started!</p>
                
                {/* TEST CHECKOUT BUTTON - For testing layout */}
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setShowCheckout(true);
                  }}
                  style={{
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    padding: '15px 30px',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    marginTop: '20px'
                  }}
                >
                  🧪 TEST CHECKOUT LAYOUT
                </button>
              </div>
            ) : (
              <div>
                {cartItems.map((item, index) => (
                  <div key={index} style={{
                    border: '2px solid #ddd',
                    padding: '15px',
                    margin: '10px 0',
                    borderRadius: '8px',
                    backgroundColor: '#f9f9f9'
                  }}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                      <div>
                        <h3 style={{color: 'black', fontWeight: 'bold', fontSize: '18px'}}>{item.name}</h3>
                        <p style={{color: 'black'}}>Quantity: {item.quantity}</p>
                        <p style={{color: 'black'}}>Price: ${item.price} each</p>
                        <p style={{color: 'black', fontWeight: 'bold'}}>
                          Subtotal: ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          const newCartItems = cartItems.filter((_, i) => i !== index);
                          setCartItems(newCartItems);
                        }}
                        style={{
                          backgroundColor: '#f44336',
                          color: 'white',
                          padding: '8px 12px',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}

                <div style={{
                  borderTop: '2px solid #ddd',
                  paddingTop: '20px',
                  marginTop: '20px',
                  textAlign: 'center'
                }}>
                  <h3 style={{color: 'black', fontSize: '20px', marginBottom: '20px'}}>
                    Total: ${calculateTotal().toFixed(2)}
                  </h3>

                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setShowCheckout(true);
                    }}
                    style={{
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      padding: '15px 40px',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      width: '100%',
                      marginBottom: '10px'
                    }}
                  >
                    🚀 PROCEED TO CHECKOUT
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={() => setIsOpen(false)}
              style={{
                backgroundColor: '#666',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                width: '100%',
                marginTop: '10px'
              }}
            >
              Close Cart
            </button>
          </div>
        </div>
      )}

      {/* Simple Checkout - NO POSITIONING TRICKS */}
      {showCheckout && (
        <CheckoutPage
          cartItems={cartItems}
          onBack={() => setShowCheckout(false)}
          onSuccess={(paymentResult) => {
            // Clear cart and close checkout
            setCartItems([]);
            setShowCheckout(false);
            
            // Show success message with pickup code
            if (paymentResult.paymentMethod === 'cash') {
              alert(`🎉 Order Confirmed!\n\n📋 Your Pickup Code: ${paymentResult.pickupCode}\n\n💰 Amount to Pay in Store: $${paymentResult.amount.toFixed(2)}\n📍 Bring cash payment to our NYC pickup location\n💳 Order ID: ${paymentResult.orderId}\n\n⏰ Show your pickup code to staff when you arrive.`);
            } else {
              alert(`🎉 Payment Successful!\n\n📋 Your Pickup Code: ${paymentResult.pickupCode}\n\n📍 Show this code at our NYC pickup location\n💳 Order ID: ${paymentResult.orderId}\n💰 Amount: $${paymentResult.amount.toFixed(2)}\n\n📧 Receipt sent to your email\n\n⏰ Admin will verify this code when you pickup your order.`);
            }
          }}
        />
      )}
    </div>
  );
};

export default SimpleCart;