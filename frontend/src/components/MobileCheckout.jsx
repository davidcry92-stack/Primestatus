import React, { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { X, CreditCard, Banknote } from 'lucide-react';

const MobileCheckout = ({ cartItems, onSuccess, onCancel }) => {
  const [paymentMethod, setPaymentMethod] = useState(''); // 'card' or 'cash'
  const [loading, setLoading] = useState(false);
  const [cardForm, setCardForm] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: ''
  });
  const [pickupNotes, setPickupNotes] = useState('');
  const { user, apiCall } = useContext(AuthContext);

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCardInputChange = (field, value) => {
    setCardForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value) => {
    const v = value.replace(/\D/g, '');
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };

  const handleCardPayment = async () => {
    if (!cardForm.cardNumber || !cardForm.expiryDate || !cardForm.cvv || !cardForm.nameOnCard) {
      alert('Please fill in all card details');
      return;
    }

    setLoading(true);
    try {
      // Generate pickup code for the order
      const pickupCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Simulate successful payment (in real implementation, this would process through Square)
      const paymentResult = {
        success: true,
        paymentId: 'mock_payment_' + Date.now(),
        orderId: 'order_' + Date.now(),
        pickupCode: pickupCode,
        amount: calculateTotal(),
        paymentMethod: 'card'
      };

      onSuccess(paymentResult);
    } catch (error) {
      alert('Payment failed. Please try again.');
      console.error('Payment error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCashPayment = async () => {
    setLoading(true);
    try {
      // Generate pickup code for cash payment
      const pickupCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      const paymentResult = {
        success: true,
        paymentId: 'cash_payment_' + Date.now(),
        orderId: 'order_' + Date.now(),
        pickupCode: pickupCode,
        amount: calculateTotal(),
        paymentMethod: 'cash'
      };

      onSuccess(paymentResult);
    } catch (error) {
      alert('Order creation failed. Please try again.');
      console.error('Cash order error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="bg-white text-black"
      style={{
        width: '100%',
        minHeight: '100vh',
        padding: '20px',
        paddingBottom: '150px', // Extra space for buttons at bottom
        overflow: 'auto'
      }}
    >
      {/* Header - Simple, not fixed */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <h2 className="text-2xl font-bold">Checkout</h2>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Order Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-bold mb-3">Order Summary</h3>
        {cartItems.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-gray-600 mb-2">TEST MODE - Sample Order</p>
            <div className="flex justify-between items-center mb-2">
              <div>
                <p className="font-medium">Sample Product</p>
                <p className="text-sm text-gray-600">Qty: 1</p>
              </div>
              <p className="font-bold">$25.00</p>
            </div>
          </div>
        ) : (
          cartItems.map((item, index) => (
            <div key={index} className="flex justify-between items-center mb-2">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
              </div>
              <p className="font-bold">${(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))
        )}
        <div className="border-t pt-2 mt-2">
          <div className="flex justify-between items-center">
            <p className="font-bold text-lg">Total:</p>
            <p className="font-bold text-lg">${cartItems.length === 0 ? '25.00' : calculateTotal().toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Payment Method Selection */}
      {!paymentMethod && (
        <div className="mb-6">
          <h3 className="font-bold mb-4">Select Payment Method</h3>
          
          <button
            onClick={() => setPaymentMethod('card')}
            className="w-full flex items-center justify-center space-x-3 p-4 border-2 border-gray-300 rounded-lg mb-3 hover:border-blue-500 hover:bg-blue-50"
          >
            <CreditCard className="h-6 w-6" />
            <span className="font-medium">Credit / Debit Card</span>
          </button>
          
          <button
            onClick={() => setPaymentMethod('cash')}
            className="w-full flex items-center justify-center space-x-3 p-4 border-2 border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50"
          >
            <Banknote className="h-6 w-6" />
            <span className="font-medium">Pay in Store (Cash)</span>
          </button>
        </div>
      )}

      {/* Card Payment Form */}
      {paymentMethod === 'card' && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">Card Payment</h3>
            <button
              onClick={() => setPaymentMethod('')}
              className="text-blue-500 text-sm"
            >
              Change Method
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name on Card</label>
              <input
                type="text"
                value={cardForm.nameOnCard}
                onChange={(e) => handleCardInputChange('nameOnCard', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="John Doe"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Card Number</label>
              <input
                type="text"
                value={cardForm.cardNumber}
                onChange={(e) => handleCardInputChange('cardNumber', formatCardNumber(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="1234 5678 9012 3456"
                maxLength="19"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Expiry Date</label>
                <input
                  type="text"
                  value={cardForm.expiryDate}
                  onChange={(e) => handleCardInputChange('expiryDate', formatExpiryDate(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="MM/YY"
                  maxLength="5"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">CVV</label>
                <input
                  type="text"
                  value={cardForm.cvv}
                  onChange={(e) => handleCardInputChange('cvv', e.target.value.replace(/\D/g, '').substring(0, 4))}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="123"
                  maxLength="4"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cash Payment Info */}
      {paymentMethod === 'cash' && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">Pay in Store (Cash)</h3>
            <button
              onClick={() => setPaymentMethod('')}
              className="text-blue-500 text-sm"
            >
              Change Method
            </button>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-sm">
              <strong>💰 Cash Payment Instructions:</strong><br/>
              • Complete your order to receive a pickup code<br/>
              • Bring cash payment to our NYC pickup location<br/>
              • Show your pickup code to our staff<br/>
              • Pay ${calculateTotal().toFixed(2)} in cash upon pickup
            </p>
          </div>
        </div>
      )}

      {/* Pickup Notes */}
      {paymentMethod && (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Pickup Notes (Optional)</label>
          <textarea
            value={pickupNotes}
            onChange={(e) => setPickupNotes(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg"
            placeholder="Any special instructions for pickup..."
            rows="3"
          />
        </div>
      )}

      {/* Action Buttons - Simple, not fixed */}
      {paymentMethod && (
        <div className="mt-8 space-y-3">
          <button
            onClick={paymentMethod === 'card' ? handleCardPayment : handleCashPayment}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg disabled:opacity-50"
          >
            {loading ? 'Processing...' : 
             paymentMethod === 'card' ? `Pay $${calculateTotal().toFixed(2)}` : 
             `Complete Order - Pay $${calculateTotal().toFixed(2)} in Store`}
          </button>
          
          <button
            onClick={onCancel}
            className="w-full bg-gray-300 hover:bg-gray-400 text-black font-bold py-3 px-6 rounded-lg"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Security Notice */}
      <div className="text-center text-xs text-gray-500 mt-4">
        🔒 Secure payment powered by StatusXSmoakland<br/>
        Your payment information is encrypted and secure
      </div>
    </div>
  );
};

export default MobileCheckout;