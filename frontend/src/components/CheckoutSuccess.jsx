import React, { useEffect, useState } from 'react';
import { CheckCircle, ArrowRight, Package, CreditCard } from 'lucide-react';

const CheckoutSuccess = () => {
  const [paymentStatus, setPaymentStatus] = useState('checking');
  const [paymentData, setPaymentData] = useState(null);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    // Get session ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    
    if (sessionId) {
      pollPaymentStatus(sessionId);
    } else {
      setPaymentStatus('error');
    }
  }, []);

  const pollPaymentStatus = async (sessionId, currentAttempt = 0) => {
    const maxAttempts = 10;
    const pollInterval = 2000; // 2 seconds

    if (currentAttempt >= maxAttempts) {
      setPaymentStatus('timeout');
      return;
    }

    try {
      const response = await fetch(`/api/payments/checkout/status/${sessionId}`);
      
      if (!response.ok) {
        throw new Error('Failed to check payment status');
      }

      const data = await response.json();
      setPaymentData(data);
      
      if (data.payment_status === 'paid') {
        setPaymentStatus('success');
        // Clear cart from localStorage/sessionStorage if used
        sessionStorage.removeItem('checkout_session_id');
        return;
      } else if (data.status === 'expired') {
        setPaymentStatus('expired');
        return;
      }

      // If payment is still pending, continue polling
      setPaymentStatus('processing');
      setAttempts(currentAttempt + 1);
      
      setTimeout(() => {
        pollPaymentStatus(sessionId, currentAttempt + 1);
      }, pollInterval);
      
    } catch (error) {
      console.error('Error checking payment status:', error);
      setPaymentStatus('error');
    }
  };

  const getStatusDisplay = () => {
    switch (paymentStatus) {
      case 'checking':
        return {
          icon: <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500"></div>,
          title: 'Verifying Payment...',
          message: 'Please wait while we confirm your payment.',
          color: 'text-blue-400'
        };
      
      case 'processing':
        return {
          icon: <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500"></div>,
          title: 'Processing Payment...',
          message: `Checking payment status... (Attempt ${attempts}/${10})`,
          color: 'text-yellow-400'
        };
      
      case 'success':
        return {
          icon: <CheckCircle className="h-16 w-16 text-green-500" />,
          title: 'Payment Successful!',
          message: 'Thank you for your purchase. Your payment has been processed successfully.',
          color: 'text-green-400'
        };
      
      case 'expired':
        return {
          icon: <Package className="h-16 w-16 text-red-500" />,
          title: 'Payment Session Expired',
          message: 'Your payment session has expired. Please try again.',
          color: 'text-red-400'
        };
      
      case 'timeout':
        return {
          icon: <CreditCard className="h-16 w-16 text-orange-500" />,
          title: 'Payment Verification Timeout',
          message: 'We\'re still processing your payment. Please check your email for confirmation or contact support.',
          color: 'text-orange-400'
        };
      
      default:
        return {
          icon: <Package className="h-16 w-16 text-red-500" />,
          title: 'Payment Verification Failed',
          message: 'There was an error verifying your payment. Please contact support if you believe this is a mistake.',
          color: 'text-red-400'
        };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-900 rounded-lg shadow-xl p-8 text-center border border-gray-700">
        
        {/* Status Icon */}
        <div className="flex justify-center mb-6">
          {statusDisplay.icon}
        </div>
        
        {/* Status Title */}
        <h1 className={`text-2xl font-bold mb-4 ${statusDisplay.color}`}>
          {statusDisplay.title}
        </h1>
        
        {/* Status Message */}
        <p className="text-gray-300 mb-6">
          {statusDisplay.message}
        </p>
        
        {/* Payment Details */}
        {paymentData && paymentStatus === 'success' && (
          <div className="bg-gray-800 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-white mb-3">Payment Details:</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Amount:</span>
                <span className="text-white font-medium">
                  ${paymentData.amount_total.toFixed(2)} {paymentData.currency.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className="text-green-400 font-medium capitalize">
                  {paymentData.payment_status}
                </span>
              </div>
              {paymentData.metadata?.package_name && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Package:</span>
                  <span className="text-white font-medium">
                    {paymentData.metadata.package_name}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="space-y-3">
          {paymentStatus === 'success' && (
            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
            >
              Continue Shopping
              <ArrowRight className="h-5 w-5 ml-2" />
            </button>
          )}
          
          {(paymentStatus === 'error' || paymentStatus === 'expired' || paymentStatus === 'timeout') && (
            <>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Return to Store
              </button>
              {paymentStatus !== 'timeout' && (
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  Try Again
                </button>
              )}
            </>
          )}
        </div>
        
        {/* Support Link */}
        <div className="mt-6 pt-4 border-t border-gray-700">
          <p className="text-sm text-gray-400">
            Having issues? Contact support at{' '}
            <a href="mailto:support@statusxsmoakland.com" className="text-green-400 hover:text-green-300">
              support@statusxsmoakland.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;