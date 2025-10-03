import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

const DailyUpdates = ({ selectedCategory = null }) => {
  const [dailyDeals, setDailyDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, apiCall } = useContext(AuthContext);

  useEffect(() => {
    loadDailyDeals();
  }, []);

  const loadDailyDeals = async () => {
    try {
      const response = await apiCall('/api/daily-deals');

      if (response.ok) {
        const data = await response.json();
        setDailyDeals(data.deals || []);
      }
    } catch (error) {
      console.error('Failed to load daily deals:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (categoryId) => {
    const icons = {
      'lows': '💰',
      'deps': '🌿',
      'za': '⭐',
      'edibles': '🍪',
      'vapes': '💨',
      'pre-rolls': '🚬',
      'concentrates': '🫧',
      'suppositories': '💊'
    };
    return icons[categoryId] || '📱';
  };

  const getCategoryName = (categoryId) => {
    const names = {
      'lows': 'Lows (Affordable)',
      'deps': 'Deps (Regular)',
      'za': 'Za (Premium)',
      'edibles': 'Edibles',
      'vapes': 'Vapes',
      'pre-rolls': 'Pre-rolls',
      'concentrates': 'Concentrates',
      'suppositories': 'Wellness'
    };
    return names[categoryId] || categoryId;
  };

  const formatTimeRemaining = (expiresAt) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry - now;
    
    if (diff <= 0) return null; // Don't show expired deals
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m left`;
    } else {
      return `${minutes}m left`;
    }
  };

  // Filter deals based on selected category if provided
  const filteredDeals = selectedCategory 
    ? dailyDeals.filter(deal => deal.category === selectedCategory)
    : dailyDeals;

  // Remove expired deals
  const activeDeals = filteredDeals.filter(deal => {
    const expiry = new Date(deal.expires_at);
    return expiry > new Date();
  });

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded mb-4 w-1/3"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (activeDeals.length === 0) {
    if (selectedCategory) {
      return null; // Don't show anything if no deals for specific category
    }
    
    return (
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-700 text-center">
        <div className="text-4xl mb-3">📱</div>
        <h3 className="text-xl font-semibold text-white mb-2">No Active Deals</h3>
        <p className="text-gray-400">Check back soon for daily updates and special offers!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!selectedCategory && (
        <h3 className="text-2xl font-bold text-white flex items-center space-x-2">
          <span>📱</span>
          <span>Daily Updates</span>
        </h3>
      )}
      
      {activeDeals.map(deal => (
        <div key={deal.id} className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg p-6 border border-emerald-500/30 shadow-lg">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{getCategoryIcon(deal.category)}</span>
              <div>
                <h4 className="text-xl font-bold text-white">{deal.title}</h4>
                <p className="text-sm text-emerald-400 capitalize font-medium">
                  {getCategoryName(deal.category)}
                </p>
              </div>
            </div>
            
            {/* Time remaining badge */}
            <div className="bg-red-600 text-white text-xs px-3 py-1 rounded-full animate-pulse">
              ⏰ {formatTimeRemaining(deal.expires_at)}
            </div>
          </div>

          {/* Message */}
          <div className="mb-4">
            <p className="text-gray-200 leading-relaxed">{deal.message}</p>
          </div>

          {/* Video */}
          {deal.video_url && (
            <div className="mb-4">
              <video
                src={deal.video_url}
                controls
                className="w-full rounded-lg shadow-md"
                style={{ maxHeight: '300px' }}
                poster="" // You can add a poster image if needed
              />
            </div>
          )}

          {/* Structured Deals */}
          {deal.structured_deals && deal.structured_deals.length > 0 && (
            <div className="bg-gray-800/50 rounded-lg p-4 border border-emerald-500/20">
              <h5 className="text-emerald-400 font-semibold mb-3 flex items-center">
                <span className="mr-2">🛍️</span>
                Featured Deals
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {deal.structured_deals.map((structDeal, index) => (
                  <div key={index} className="bg-gray-700/50 rounded-md p-3 border border-gray-600">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h6 className="text-white font-medium text-sm">{structDeal.product_name}</h6>
                        {structDeal.deal_description && (
                          <p className="text-gray-400 text-xs mt-1">{structDeal.deal_description}</p>
                        )}
                      </div>
                      <div className="text-right ml-2">
                        <div className="bg-red-600 text-white text-xs px-2 py-1 rounded font-bold">
                          {structDeal.discount_percentage}% OFF
                        </div>
                        {structDeal.original_price > 0 && (
                          <div className="text-gray-400 text-xs mt-1">
                            <span className="line-through">${structDeal.original_price}</span>
                            <span className="text-emerald-400 ml-1">
                              ${(structDeal.original_price * (1 - structDeal.discount_percentage / 100)).toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Member tier access check */}
          {user && (user.membership_tier === 'basic' && deal.category === 'za') && (
            <div className="mt-4 bg-yellow-900/20 border border-yellow-600 rounded-md p-3">
              <p className="text-yellow-400 text-sm flex items-center">
                <span className="mr-2">🔒</span>
                Upgrade to Premium to access Za deals!
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-4 pt-3 border-t border-gray-700 flex justify-between items-center text-xs text-gray-400">
            <span>Posted: {new Date(deal.created_at).toLocaleDateString()}</span>
            <span className="flex items-center">
              <span className="mr-1">🔥</span>
              Limited time offer
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DailyUpdates;