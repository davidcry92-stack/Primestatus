import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

const SquareCheckout = ({ cartItems, onSuccess, onCancel }) => {
  const [paymentForm, setPaymentForm] = useState(null);
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pickupNotes, setPickupNotes] = useState('');
  const { user, apiCall } = useContext(AuthContext);

  const SQUARE_APPLICATION_ID = 'sq0idp-A8bi8F9_FRdPQiCQVCa5dg';
  const SQUARE_LOCATION_ID = 'L9JFNQSBZAW4Y';

  useEffect(() => {
    initSquarePaymentForm();
  }, []);

  const initSquarePaymentForm = async () => {
    try {
      // Load Square Web Payments SDK
      if (!window.Square) {
        const script = document.createElement('script');
        script.src = 'https://web.squarecdn.com/v1/square.js';
        script.async = true;
        script.onload = () => {
          initializeSquareForm();
        };
        document.head.appendChild(script);
      } else {
        initializeSquareForm();
      }
    } catch (error) {
      console.error('Error loading Square SDK:', error);
      setError('Failed to load payment system');
    }
  };

  const initializeSquareForm = async () => {
    try {
      const payments = window.Square.payments(SQUARE_APPLICATION_ID, SQUARE_LOCATION_ID);
      
      const paymentRequest = payments.paymentRequest({
        countryCode: 'US',
        currencyCode: 'USD',
        total: {
          amount: calculateTotal().toString(),
          label: 'StatusXSmoakland Order',
        },
      });

      setPaymentForm(payments);

      // Initialize card payment form
      const cardForm = await payments.card();
      await cardForm.attach('#card-container');
      setCard(cardForm);

    } catch (error) {
      console.error('Square initialization error:', error);
      setError('Failed to initialize payment form');
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };

  const calculateTotalCents = () => {
    return Math.round(calculateTotal() * 100);
  };

  const handlePayment = async () => {
    if (!card || !user) {
      setError('Payment form not ready or user not authenticated');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Tokenize card information
      const result = await card.tokenize();
      
      if (result.status === 'OK') {
        const token = result.token;
        
        // Prepare order data
        const orderData = {
          payment_source_id: token,
          user_email: user.email,
          user_name: user.full_name || user.email,
          pickup_notes: pickupNotes,
          items: cartItems.map(item => ({
            product_id: item.id,
            product_name: item.name,
            quantity: item.quantity,
            unit_price: Math.round(item.price * 100), // Convert to cents
            total_price: Math.round(item.price * item.quantity * 100) // Convert to cents
          }))
        };

        // Process payment through backend
        const response = await apiCall('/api/square/create-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          },
          body: JSON.stringify(orderData)
        });

        const paymentResult = await response.json();

        if (response.ok && paymentResult.success) {
          // Payment successful
          onSuccess({
            paymentId: paymentResult.payment_id,
            orderId: paymentResult.order_id,
            receiptUrl: paymentResult.receipt_url,
            pickupCode: paymentResult.pickup_code,
            amount: calculateTotal()
          });
        } else {
          setError(paymentResult.error_message || 'Payment failed');
        }
      } else {
        setError(result.errors?.[0]?.message || 'Payment tokenization failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError('Payment processing failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-red-900/20 border border-red-600 rounded-lg p-6 text-center">
        <p className="text-red-400">Please log in to complete your purchase</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg p-6 space-y-6">
      <h2 className="text-2xl font-bold text-white mb-4">Checkout</h2>
      
      {/* Order Summary */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-3">Order Summary</h3>
        {cartItems.map(item => (
          <div key={item.id} className="flex justify-between items-center py-2">
            <span className="text-gray-300">
              {item.name} × {item.quantity}
            </span>
            <span className="text-white font-semibold">
              ${(item.price * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
        <div className="border-t border-gray-700 mt-3 pt-3">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-white">Total:</span>
            <span className="text-lg font-bold text-green-400">
              ${calculateTotal().toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Pickup Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Pickup Notes (Optional)
        </label>
        <textarea
          value={pickupNotes}
          onChange={(e) => setPickupNotes(e.target.value)}
          placeholder="Any special instructions for pickup..."
          className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:border-emerald-500 focus:outline-none"
          rows="3"
        />
      </div>

      {/* Square Card Form */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Payment Information
        </label>
        <div 
          id="card-container" 
          className="bg-white rounded-md p-4 border border-gray-600"
          style={{ minHeight: '100px' }}
        />
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/20 border border-red-600 rounded-md p-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={onCancel}
          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-md transition-colors"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          onClick={handlePayment}
          disabled={loading || !card}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-md transition-colors"
        >
          {loading ? 'Processing...' : `Pay $${calculateTotal().toFixed(2)}`}
        </button>
      </div>

      {/* Payment Info */}
      <div className="text-xs text-gray-400 text-center">
        <p>🔒 Secure payment powered by Square</p>
        <p>Your payment information is encrypted and secure</p>
      </div>
    </div>
  );
};

export default SquareCheckout;