import React from 'react';
import { XCircle, ArrowLeft, RefreshCw, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CheckoutCancel = () => {
  const navigate = useNavigate();

  const handleReturnToStore = () => {
    navigate('/');
  };

  const handleTryAgain = () => {
    // Clear any session data and return to cart
    sessionStorage.removeItem('checkout_session_id');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-center py-2 px-4">
        <p className="text-sm font-bold">
          💰 StatusXSmoakland - Payment Cancelled 💰
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-8">
          
          {/* Cancel Header */}
          <div className="text-center mb-8">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">Payment Cancelled</h1>
            <p className="text-gray-300">
              Your payment has been cancelled. No charges were made to your account.
            </p>
          </div>

          {/* Information Section */}
          <div className="bg-red-900/20 border border-red-600 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-red-400 mb-3">What Happened?</h3>
            <div className="space-y-2 text-gray-300">
              <p>• You cancelled the payment process</p>
              <p>• Your payment session has been terminated</p>
              <p>• No charges were made to your payment method</p>
              <p>• Your cart items are still available</p>
            </div>
          </div>

          {/* Options Section */}
          <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-blue-400 mb-3 flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2" />
              Continue Shopping
            </h3>
            <div className="space-y-2 text-gray-300">
              <p>✓ Browse our premium cannabis products</p>
              <p>✓ Check out today's daily deals</p>
              <p>✓ Explore our comprehensive Health-Aid</p>
              <p>✓ Try the payment process again when ready</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleReturnToStore}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Return to Store
            </button>
            
            <button
              onClick={handleTryAgain}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Try Payment Again
            </button>
          </div>

          {/* Help Section */}
          <div className="mt-8 pt-6 border-t border-gray-700 text-center">
            <h4 className="text-lg font-semibold text-white mb-3">Need Help?</h4>
            <p className="text-gray-400 mb-4">
              If you're having trouble with the payment process, we're here to help.
            </p>
            
            <div className="space-y-2 text-sm">
              <p className="text-gray-300">
                📧 Email: <span className="text-green-400">support@statusxsmoakland.com</span>
              </p>
              <p className="text-gray-300">
                📱 Follow us: 
                <a 
                  href="https://www.instagram.com/smoaklandnycbx" 
                  className="text-pink-400 hover:text-pink-300 ml-2"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  @smoaklandnycbx
                </a>
              </p>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-6 bg-gray-800 rounded-lg p-4">
            <p className="text-xs text-gray-400 text-center">
              🔒 Your payment information is secure. We use industry-standard encryption 
              to protect your data. No payment details are stored on our servers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutCancel;