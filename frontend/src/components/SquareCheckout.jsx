import React, { useState, useContext, useEffect } from 'react';
import { PaymentForm, CreditCard } from 'react-square-web-payments-sdk';
import { AuthContext } from '../contexts/AuthContext';

const SquareCheckout = ({ cartItems, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pickupNotes, setPickupNotes] = useState('');
  const [saveToProfile, setSaveToProfile] = useState(false);
  const [squareLoaded, setSquareLoaded] = useState(false);
  const { user, apiCall } = useContext(AuthContext);

  const SQUARE_APPLICATION_ID = process.env.REACT_APP_SQUARE_APPLICATION_ID || import.meta.env.VITE_SQUARE_APPLICATION_ID;
  const SQUARE_LOCATION_ID = process.env.REACT_APP_SQUARE_LOCATION_ID || import.meta.env.VITE_SQUARE_LOCATION_ID;

  // Check if Square SDK is loaded
  useEffect(() => {
    const checkSquareSDK = () => {
      if (typeof window !== 'undefined' && window.Square) {
        setSquareLoaded(true);
        setError(null);
      } else {
        // Retry after a short delay
        setTimeout(checkSquareSDK, 100);
      }
    };
    checkSquareSDK();
  }, []);

  // Create payment request for Square
  const createPaymentRequest = () => {
    return {
      countryCode: 'US',
      currencyCode: 'USD',
      total: {
        amount: Math.round(calculateTotal() * 100).toString(), // Convert to cents
        label: 'StatusXSmoakland Order',
      },
    };
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };

  const calculateTotalCents = () => {
    return Math.round(calculateTotal() * 100);
  };

  const handlePayment = async (token, verifiedBuyer) => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Token is already provided by the PaymentForm component
      
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

      {/* Square Payment Form */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Payment Information
        </label>
        {squareLoaded ? (
          <PaymentForm
            applicationId={SQUARE_APPLICATION_ID}
            locationId={SQUARE_LOCATION_ID}
            cardTokenizeResponseReceived={handlePayment}
            createPaymentRequest={createPaymentRequest}
            environment="sandbox"
          >
            <CreditCard
              includeInputLabels={true}
              postalCode={true}
              style={{
                input: {
                  color: '#FFFFFF',
                  backgroundColor: '#1f2937',
                  fontSize: '16px',
                  fontFamily: 'Arial, sans-serif'
                },
                'input::placeholder': {
                  color: '#9CA3AF'
                },
                '.input-container': {
                  borderColor: '#6B7280',
                  borderRadius: '8px',
                  backgroundColor: '#1f2937'
                },
                '.input-container.is-focus': {
                  borderColor: '#10B981'
                },
                '.input-container.is-error': {
                  borderColor: '#EF4444'
                }
              }}
            />
          </PaymentForm>
        ) : (
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <div className="text-gray-300">Loading payment form...</div>
          </div>
        )}
        
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
        <div className="flex-1 text-center text-gray-300 py-3">
          {loading ? 'Processing payment...' : 'Fill out payment form above to complete purchase'}
        </div>
      </div>

      {/* Payment Info */}
      <div className="text-xs text-gray-400 text-center">
        <p>🔒 Secure payment powered by Square</p>
        <p>Your payment information is encrypted and secure</p>
      </div>

      {/* Styling is now handled by the PaymentForm component */}
    </div>
  );
};

export default SquareCheckout;