import React, { useState } from 'react';

const DeliveryComingSoon = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/delivery-signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        setIsSubscribed(true);
        setEmail('');
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to subscribe for delivery notifications');
      }
    } catch (error) {
      console.error('Delivery signup error:', error);
      alert('Failed to subscribe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isSubscribed) {
    return (
      <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white py-4 px-6 mx-4 mt-4 rounded-lg shadow-lg animate-pulse">
        <div className="flex items-center justify-center space-x-3">
          <span className="text-2xl">✅</span>
          <div className="text-center">
            <p className="font-bold text-lg">You're on the list!</p>
            <p className="text-sm">We'll notify you when delivery launches in NYC</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white py-8 px-6 mx-0 mt-0 shadow-2xl border-b-4 border-yellow-400">
      <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0 max-w-7xl mx-auto">
        {/* Left side - Message with bike icon */}
        <div className="flex items-center space-x-6">
          <div className="text-5xl animate-pulse">
            🚴‍♂️
          </div>
          <div>
            <h2 className="text-4xl lg:text-5xl font-black text-white tracking-wide mb-2">
              NYC PICK-UP
            </h2>
            <div className="text-3xl lg:text-4xl font-extrabold mb-3 transform animate-pulse">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-pink-400 drop-shadow-2xl">
                DELIVERY COMING SOON
              </span>
            </div>
            <p className="text-base lg:text-lg text-yellow-200 font-medium">
              Currently pickup only at our NYC location
            </p>
          </div>
        </div>

        {/* Right side - Email signup */}
        <div className="flex-shrink-0">
          <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email for updates"
              className="px-4 py-2 rounded-md text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-300 min-w-0 flex-1"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !email}
              className="bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-400 text-gray-900 font-bold px-6 py-2 rounded-md transition-colors whitespace-nowrap"
            >
              {loading ? '...' : 'Notify Me! 📧'}
            </button>
          </form>
        </div>
      </div>

      {/* Bottom decorative elements */}
      <div className="flex justify-center mt-4 space-x-6 text-2xl">
        <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>🚴</span>
        <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>📦</span>
        <span className="animate-bounce" style={{ animationDelay: '0.3s' }}>🏠</span>
        <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>✨</span>
      </div>
    </div>
  );
};

export default DeliveryComingSoon;