import React, { useState, useEffect } from 'react';
import { PaymentForm, GooglePay } from 'react-square-web-payments-sdk';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

const GooglePayCheckout = ({ 
  cartItems, 
  totalAmount, 
  onSuccess, 
  onCancel, 
  user 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [squareLoaded, setSquareLoaded] = useState(false);

  const backendUrl = process.env.REACT_APP_BACKEND_URL || import.meta.env.VITE_BACKEND_URL;

  // Check if Square SDK is loaded
  useEffect(() => {
    const checkSquareSDK = () => {
      if (typeof window !== 'undefined' && window.Square) {
        setSquareLoaded(true);
        setError('');
      } else {
        // Retry after a short delay
        setTimeout(checkSquareSDK, 100);
      }
    };
    checkSquareSDK();
  }, []);

  const handleGooglePaySuccess = async (token, buyer) => {
    setIsProcessing(true);
    setError('');
    
    try {
      console.log('📱 Google Pay token received:', token);
      
      const response = await fetch(`${backendUrl}/api/payments/google-pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          token: token.token,
          amount: Math.round(totalAmount * 100), // Convert to cents
          currency: 'USD',
          items: cartItems,
          buyer_details: buyer,
          user_email: user?.email
        })
      });

      const result = await response.json();

      if (response.ok) {
        console.log('📱 Google Pay payment successful:', result);
        setSuccess(true);
        
        setTimeout(() => {
          onSuccess({
            paymentMethod: 'google-pay',
            transactionId: result.payment_id,
            amount: totalAmount,
            paymentCode: result.payment_code || result.payment_id
          });
        }, 2000);
      } else {
        throw new Error(result.detail || 'Google Pay payment failed');
      }
    } catch (error) {
      console.error('Google Pay payment error:', error);
      setError(error.message || 'Google Pay payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGooglePayError = (errors) => {
    console.error('Google Pay tokenization error:', errors);
    setError('Google Pay setup failed. Please try a different payment method.');
    setIsProcessing(false);
  };

  const createPaymentRequest = () => ({
    countryCode: "US",
    currencyCode: "USD",
    total: {
      amount: totalAmount.toFixed(2),
      label: "StatusXSmoakland",
    },
    lineItems: cartItems.map(item => ({
      amount: (item.price * item.quantity).toFixed(2),
      label: `${item.name} x${item.quantity}`
    }))
  });

  if (success) {
    return (
      <div className="bg-gray-900 border border-green-400 rounded-lg p-8 max-w-md mx-auto text-center">
        <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
        <p className="text-gray-300 mb-4">
          Your Google Pay payment has been processed successfully.
        </p>
        <div className="text-sm text-gray-400">
          Redirecting to confirmation...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-600 rounded-lg p-8 max-w-md mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-8 h-8">
              <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white">Google Pay</h2>
        </div>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-white"
        >
          <X size={24} />
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900 border border-red-600 rounded-lg p-4 mb-4 flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
          <div>
            <div className="font-semibold text-red-200">Payment Error</div>
            <div className="text-red-300 text-sm">{error}</div>
          </div>
        </div>
      )}

      {/* Order Summary */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <h3 className="text-white font-semibold mb-3">Order Summary</h3>
        {cartItems.map(item => (
          <div key={item.id} className="flex justify-between text-gray-300 text-sm mb-2">
            <span>{item.name} x{item.quantity}</span>
            <span>${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="border-t border-gray-600 pt-2 mt-3">
          <div className="flex justify-between text-white font-bold">
            <span>Total</span>
            <span>${totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Google Pay Payment Form */}
      <div className="mb-6">
        <PaymentForm
          applicationId={process.env.REACT_APP_SQUARE_APPLICATION_ID || import.meta.env.VITE_SQUARE_APPLICATION_ID}
          locationId={process.env.REACT_APP_SQUARE_LOCATION_ID || import.meta.env.VITE_SQUARE_LOCATION_ID}
          cardTokenizeResponseReceived={handleGooglePaySuccess}
          createPaymentRequest={createPaymentRequest}
        >
          <div className="w-full">
            <GooglePay
              buttonColor="default"
              buttonType="pay"
              buttonWidth={undefined}
              buttonHeight="48px"
              onError={handleGooglePayError}
            />
          </div>
        </PaymentForm>
      </div>

      {/* Processing Indicator */}
      {isProcessing && (
        <div className="text-center py-4">
          <div className="inline-flex items-center space-x-2 text-white">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Processing Google Pay payment...</span>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="text-center text-xs text-gray-400 mt-4">
        <p>🔒 Secure payment powered by Square</p>
        <p>Your payment information is encrypted and secure</p>
      </div>
    </div>
  );
};

export default GooglePayCheckout;