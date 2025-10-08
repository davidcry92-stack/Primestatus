import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

const ApplePayCheckout = ({ 
  cartItems, 
  totalAmount, 
  onSuccess, 
  onCancel, 
  user 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [applePayButton, setApplePayButton] = useState(null);
  const [isApplePaySupported, setIsApplePaySupported] = useState(false);

  const backendUrl = process.env.REACT_APP_BACKEND_URL || import.meta.env.VITE_BACKEND_URL;
  const SQUARE_APPLICATION_ID = process.env.REACT_APP_SQUARE_APPLICATION_ID || import.meta.env.VITE_SQUARE_APPLICATION_ID;
  const SQUARE_LOCATION_ID = process.env.REACT_APP_SQUARE_LOCATION_ID || import.meta.env.VITE_SQUARE_LOCATION_ID;

  useEffect(() => {
    initApplePay();
  }, []);

  const initApplePay = async () => {
    try {
      // Load Square SDK if not already loaded
      if (!window.Square) {
        const script = document.createElement('script');
        script.src = 'https://web.squarecdn.com/v1/square.js';
        script.async = true;
        script.onload = () => {
          setupApplePay();
        };
        document.head.appendChild(script);
      } else {
        setupApplePay();
      }
    } catch (error) {
      console.error('Error loading Square SDK for Apple Pay:', error);
      setError('Apple Pay not available');
    }
  };

  const setupApplePay = async () => {
    try {
      const payments = window.Square.payments(SQUARE_APPLICATION_ID, SQUARE_LOCATION_ID);
      
      // Check if Apple Pay is supported
      const paymentRequest = payments.paymentRequest({
        countryCode: 'US',
        currencyCode: 'USD',
        total: {
          amount: Math.round(totalAmount * 100).toString(), // Convert to cents
          label: 'StatusXSmoakland Order',
        },
      });

      const applePay = await payments.applePay(paymentRequest);
      setApplePayButton(applePay);
      setIsApplePaySupported(true);
      
      // Attach Apple Pay button
      const applePayContainer = document.getElementById('apple-pay-button');
      if (applePayContainer) {
        await applePay.attach('#apple-pay-button');
      }
      
    } catch (error) {
      console.error('Apple Pay setup error:', error);
      setError('Apple Pay not supported on this device');
      setIsApplePaySupported(false);
    }
  };

  const handleApplePaySuccess = async (token, buyer) => {
    setIsProcessing(true);
    setError('');
    
    try {
      console.log('🍎 Apple Pay token received:', token);
      
      const response = await fetch(`${backendUrl}/api/payments/apple-pay`, {
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
        console.log('🍎 Apple Pay payment successful:', result);
        setSuccess(true);
        
        setTimeout(() => {
          onSuccess({
            paymentMethod: 'apple-pay',
            transactionId: result.payment_id,
            amount: totalAmount,
            paymentCode: result.payment_code || result.payment_id
          });
        }, 2000);
      } else {
        throw new Error(result.detail || 'Apple Pay payment failed');
      }
    } catch (error) {
      console.error('Apple Pay payment error:', error);
      setError(error.message || 'Apple Pay payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplePayError = (errors) => {
    console.error('Apple Pay tokenization error:', errors);
    setError('Apple Pay setup failed. Please try a different payment method.');
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
          Your Apple Pay payment has been processed successfully.
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
            <svg viewBox="0 0 24 24" className="w-8 h-8 fill-white">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white">Apple Pay</h2>
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

      {/* Apple Pay Payment Form */}
      <div className="mb-6">
        <PaymentForm
          applicationId={process.env.REACT_APP_SQUARE_APPLICATION_ID || import.meta.env.VITE_SQUARE_APPLICATION_ID}
          locationId={process.env.REACT_APP_SQUARE_LOCATION_ID || import.meta.env.VITE_SQUARE_LOCATION_ID}
          cardTokenizeResponseReceived={handleApplePaySuccess}
          createPaymentRequest={createPaymentRequest}
        >
          <div className="w-full">
            <ApplePay
              buttonColor="black"
              buttonType="pay"
              buttonWidth={undefined}
              buttonHeight="48px"
              onError={handleApplePayError}
            />
          </div>
        </PaymentForm>
      </div>

      {/* Processing Indicator */}
      {isProcessing && (
        <div className="text-center py-4">
          <div className="inline-flex items-center space-x-2 text-white">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Processing Apple Pay payment...</span>
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

export default ApplePayCheckout;