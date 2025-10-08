import React, { useState, useContext } from 'react';
import { PaymentForm, CreditCard } from 'react-square-web-payments-sdk';
import { AuthContext } from '../contexts/AuthContext';

const SquareCheckout = ({ cartItems, onSuccess, onCancel }) => {
  const [paymentForm, setPaymentForm] = useState(null);
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pickupNotes, setPickupNotes] = useState('');
  const [saveToProfile, setSaveToProfile] = useState(false);
  const { user, apiCall } = useContext(AuthContext);

  const SQUARE_APPLICATION_ID = process.env.REACT_APP_SQUARE_APPLICATION_ID || import.meta.env.VITE_SQUARE_APPLICATION_ID;
  const SQUARE_LOCATION_ID = process.env.REACT_APP_SQUARE_LOCATION_ID || import.meta.env.VITE_SQUARE_LOCATION_ID;

  useEffect(() => {
    initSquarePaymentForm();
    
    // Cleanup function to prevent multiple initializations
    return () => {
      if (card) {
        try {
          card.destroy();
        } catch (error) {
          console.log('Card cleanup error:', error);
        }
      }
    };
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
      console.log('Initializing Square form...');
      console.log('SQUARE_APPLICATION_ID:', SQUARE_APPLICATION_ID);
      console.log('SQUARE_LOCATION_ID:', SQUARE_LOCATION_ID);
      
      if (!SQUARE_APPLICATION_ID || !SQUARE_LOCATION_ID) {
        throw new Error('Square configuration missing');
      }
      
      if (!window.Square) {
        throw new Error('Square SDK not loaded');
      }

      // Clear any existing card container content
      const cardContainer = document.getElementById('card-container');
      if (cardContainer) {
        cardContainer.innerHTML = '';
      }

      const payments = window.Square.payments(SQUARE_APPLICATION_ID, SQUARE_LOCATION_ID);
      
      setPaymentForm(payments);

      // Initialize card payment form with custom styling
      const cardForm = await payments.card({
        style: {
          '.input-container': {
            borderColor: '#6B7280',
            borderRadius: '6px',
            backgroundColor: '#111827',
            color: '#FFFFFF',
          },
          '.input-container.is-focus': {
            borderColor: '#10B981',
          },
          '.input-container.is-error': {
            borderColor: '#EF4444',
          },
          'input': {
            color: '#FFFFFF',
            backgroundColor: '#111827',
          }
        }
      });
      
      // Ensure only one attachment
      if (cardContainer && !cardContainer.hasChildNodes()) {
        await cardForm.attach('#card-container');
        setCard(cardForm);
        console.log('Square card form attached successfully');
        setError(null); // Clear any previous errors
      }

    } catch (error) {
      console.error('Square initialization error:', error);
      setError(`Failed to initialize payment form: ${error.message}`);
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
          save_payment_method: saveToProfile,
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
          className="bg-gray-900 border border-gray-600 rounded-md p-4"
          style={{ minHeight: '120px', backgroundColor: '#1f2937' }}
        />
        
        {/* Save to Profile Option */}
        <div className="mt-3 flex items-center">
          <input
            type="checkbox"
            id="save-to-profile"
            checked={saveToProfile}
            onChange={(e) => setSaveToProfile(e.target.checked)}
            className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
          />
          <label htmlFor="save-to-profile" className="ml-2 block text-sm text-gray-300">
            💳 Save payment method to my profile for faster checkout
          </label>
        </div>
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

      {/* Custom CSS to prevent Square field duplication and force dark theme */}
      <style jsx>{`
        #card-container .sq-input {
          margin-bottom: 0 !important;
          background-color: #1f2937 !important;
          color: white !important;
        }
        #card-container iframe {
          max-height: 100px !important;
          background-color: #1f2937 !important;
        }
        #card-container input {
          background-color: #374151 !important;
          color: white !important;
          border: 1px solid #6b7280 !important;
        }
        /* Ensure no duplicate containers */
        #card-container > div:nth-child(n+2) {
          display: none !important;
        }
        /* Force dark theme on all Square elements */
        #card-container * {
          background-color: #1f2937 !important;
          color: white !important;
        }
      `}</style>
    </div>
  );
};

export default SquareCheckout;