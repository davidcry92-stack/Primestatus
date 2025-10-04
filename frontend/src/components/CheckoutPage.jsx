import React, { useState } from 'react';
import { ArrowLeft, CreditCard, Banknote } from 'lucide-react';

const CheckoutPage = ({ cartItems, onBack, onSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [cardForm, setCardForm] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: ''
  });
  const [loading, setLoading] = useState(false);

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCardPayment = async () => {
    setLoading(true);
    setTimeout(() => {
      const pickupCode = Math.floor(100000 + Math.random() * 900000).toString();
      onSuccess({
        success: true,
        pickupCode: pickupCode,
        orderId: 'order_' + Date.now(),
        amount: calculateTotal(),
        paymentMethod: 'card'
      });
      setLoading(false);
    }, 2000);
  };

  const handleCashPayment = async () => {
    setLoading(true);
    setTimeout(() => {
      const pickupCode = Math.floor(100000 + Math.random() * 900000).toString();
      onSuccess({
        success: true,
        pickupCode: pickupCode,
        orderId: 'order_' + Date.now(),
        amount: calculateTotal(),
        paymentMethod: 'cash'
      });
      setLoading(false);
    }, 1000);
  };

  return (
    <div style={{ 
      width: '100%', 
      minHeight: '100vh', 
      backgroundColor: 'white', 
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      
      {/* Back Button */}
      <button
        onClick={onBack}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'none',
          border: 'none',
          fontSize: '16px',
          color: '#374151',
          marginBottom: '20px',
          cursor: 'pointer'
        }}
      >
        <ArrowLeft size={20} />
        Back to Cart
      </button>

      {/* Title */}
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '30px' }}>
        Checkout
      </h1>

      {/* Order Summary */}
      <div style={{ 
        backgroundColor: '#f9fafb', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '30px',
        border: '1px solid #e5e7eb'
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>
          Order Summary
        </h2>
        
        {cartItems.map((item, index) => (
          <div key={index} style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '10px',
            paddingBottom: '10px',
            borderBottom: index < cartItems.length - 1 ? '1px solid #e5e7eb' : 'none'
          }}>
            <div>
              <p style={{ fontWeight: '500', marginBottom: '5px' }}>{item.name}</p>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>Qty: {item.quantity}</p>
            </div>
            <p style={{ fontWeight: 'bold' }}>${(item.price * item.quantity).toFixed(2)}</p>
          </div>
        ))}
        
        <div style={{ 
          borderTop: '2px solid #374151', 
          paddingTop: '15px', 
          marginTop: '15px' 
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: '20px', fontWeight: 'bold' }}>Total:</p>
            <p style={{ fontSize: '20px', fontWeight: 'bold' }}>${calculateTotal().toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Payment Method Selection */}
      {!paymentMethod && (
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>
            Select Payment Method
          </h3>
          
          <button
            onClick={() => setPaymentMethod('card')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              padding: '20px',
              border: '2px solid #d1d5db',
              borderRadius: '8px',
              backgroundColor: 'white',
              marginBottom: '15px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500'
            }}
          >
            <CreditCard size={24} />
            Credit / Debit Card
          </button>
          
          <button
            onClick={() => setPaymentMethod('cash')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              padding: '20px',
              border: '2px solid #d1d5db',
              borderRadius: '8px',
              backgroundColor: 'white',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500'
            }}
          >
            <Banknote size={24} />
            Pay in Store (Cash)
          </button>
        </div>
      )}

      {/* Card Payment Form */}
      {paymentMethod === 'card' && (
        <div style={{ marginBottom: '30px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '20px' 
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>Card Details</h3>
            <button 
              onClick={() => setPaymentMethod('')}
              style={{ 
                color: '#3b82f6', 
                background: 'none', 
                border: 'none', 
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Change Method
            </button>
          </div>
          
          <div style={{ display: 'grid', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px' }}>
                Name on Card
              </label>
              <input
                type="text"
                value={cardForm.nameOnCard}
                onChange={(e) => setCardForm({...cardForm, nameOnCard: e.target.value})}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
                placeholder="John Doe"
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px' }}>
                Card Number
              </label>
              <input
                type="text"
                value={cardForm.cardNumber}
                onChange={(e) => setCardForm({...cardForm, cardNumber: e.target.value})}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
                placeholder="1234 5678 9012 3456"
              />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px' }}>
                  Expiry
                </label>
                <input
                  type="text"
                  value={cardForm.expiryDate}
                  onChange={(e) => setCardForm({...cardForm, expiryDate: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '16px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="MM/YY"
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px' }}>
                  CVV
                </label>
                <input
                  type="text"
                  value={cardForm.cvv}
                  onChange={(e) => setCardForm({...cardForm, cvv: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '16px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="123"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cash Payment Info */}
      {paymentMethod === 'cash' && (
        <div style={{ marginBottom: '30px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '20px' 
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>Pay in Store</h3>
            <button 
              onClick={() => setPaymentMethod('')}
              style={{ 
                color: '#3b82f6', 
                background: 'none', 
                border: 'none', 
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Change Method
            </button>
          </div>
          
          <div style={{
            backgroundColor: '#fef3c7',
            border: '1px solid #f59e0b',
            borderRadius: '8px',
            padding: '15px'
          }}>
            <p style={{ fontSize: '14px', lineHeight: '1.5', margin: 0 }}>
              <strong>💰 Cash Payment Instructions:</strong><br/>
              • Complete your order to receive a pickup code<br/>
              • Bring ${calculateTotal().toFixed(2)} cash to our NYC location<br/>
              • Show your pickup code to our staff<br/>
              • Pay in cash when you arrive for pickup
            </p>
          </div>
        </div>
      )}

      {/* Payment Button */}
      {paymentMethod && (
        <button
          onClick={paymentMethod === 'card' ? handleCardPayment : handleCashPayment}
          disabled={loading}
          style={{
            width: '100%',
            backgroundColor: loading ? '#9ca3af' : '#059669',
            color: 'white',
            fontSize: '18px',
            fontWeight: 'bold',
            padding: '16px',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: '20px'
          }}
        >
          {loading ? 'Processing...' : 
           paymentMethod === 'card' ? `Pay $${calculateTotal().toFixed(2)}` : 
           `Complete Order - Pay $${calculateTotal().toFixed(2)} in Store`}
        </button>
      )}

    </div>
  );
};

export default CheckoutPage;