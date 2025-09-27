import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

const AdminRatingStats = () => {
  const [ratingStats, setRatingStats] = useState([]);
  const [userRatingHistory, setUserRatingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products');
  const { apiCall } = useContext(AuthContext);

  useEffect(() => {
    loadRatingData();
  }, []);

  const loadRatingData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      
      // Load product rating stats
      const statsResponse = await apiCall('/api/admin/ratings/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (statsResponse.ok) {
        const stats = await statsResponse.json();
        setRatingStats(stats);
      }

      // Load user rating history
      const userResponse = await apiCall('/api/admin/ratings/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (userResponse.ok) {
        const users = await userResponse.json();
        setUserRatingHistory(users);
      }

    } catch (error) {
      console.error('Failed to load rating data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStars = (rating) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-sm ${
              star <= rating ? 'text-yellow-400' : 'text-gray-500'
            }`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const renderRatingDistribution = (distribution) => {
    const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);
    
    return (
      <div className="space-y-1">
        {[5, 4, 3, 2, 1].map((stars) => {
          const count = distribution[stars] || 0;
          const percentage = total > 0 ? (count / total) * 100 : 0;
          
          return (
            <div key={stars} className="flex items-center space-x-2 text-sm">
              <span className="w-8 text-gray-400">{stars}★</span>
              <div className="flex-1 bg-gray-700 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <span className="w-8 text-gray-400 text-xs">{count}</span>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Rating Statistics</h2>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-2 px-1 border-b-2 transition-colors ${
            activeTab === 'products'
              ? 'border-red-500 text-red-400'
              : 'border-transparent text-gray-400 hover:text-gray-300'
          }`}
        >
          Product Ratings
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-2 px-1 border-b-2 transition-colors ${
            activeTab === 'users'
              ? 'border-red-500 text-red-400'
              : 'border-transparent text-gray-400 hover:text-gray-300'
          }`}
        >
          User Activity
        </button>
      </div>

      {/* Product Ratings Tab */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          {ratingStats.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No product ratings yet
            </div>
          ) : (
            ratingStats.map((product) => (
              <div key={product.product_id} className="bg-gray-900 p-6 rounded-lg border border-gray-700">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">{product.product_name}</h3>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {renderStars(Math.round(product.average_rating))}
                        <span className="text-white font-medium">
                          {product.average_rating}/5
                        </span>
                      </div>
                      <span className="text-gray-400 text-sm">
                        ({product.total_ratings} {product.total_ratings === 1 ? 'rating' : 'ratings'})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Rating Distribution */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-3">Rating Distribution</h4>
                    {renderRatingDistribution(product.rating_distribution)}
                  </div>

                  {/* Recent Reviews */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-3">Recent Reviews</h4>
                    {product.recent_reviews.length === 0 ? (
                      <p className="text-gray-500 text-sm">No reviews with text yet</p>
                    ) : (
                      <div className="space-y-3">
                        {product.recent_reviews.slice(0, 3).map((review, index) => (
                          <div key={index} className="bg-gray-800 p-3 rounded text-sm">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center space-x-2">
                                {renderStars(review.rating)}
                                <span className="text-gray-400">by {review.username}</span>
                              </div>
                              <span className="text-xs text-gray-500">
                                {formatDate(review.created_at)}
                              </span>
                            </div>
                            {review.experience && (
                              <div className="mb-2">
                                <strong className="text-gray-300">Experience:</strong>
                                <p className="text-gray-400 mt-1">{review.experience}</p>
                              </div>
                            )}
                            {review.review && (
                              <div>
                                <strong className="text-gray-300">Review:</strong>
                                <p className="text-gray-400 mt-1">{review.review}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* User Activity Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {userRatingHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No user rating activity yet
            </div>
          ) : (
            <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Total Ratings
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Avg Rating Given
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Recent Activity
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {userRatingHistory.map((user) => (
                      <tr key={user.user_id} className="hover:bg-gray-800 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">{user.username}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">{user.total_ratings_given}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {renderStars(Math.round(user.average_rating_given))}
                            <span className="text-sm text-white">
                              {user.average_rating_given}/5
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            {user.recent_ratings.slice(0, 2).map((rating, index) => (
                              <div key={index} className="text-xs text-gray-400">
                                {renderStars(rating.rating)} {rating.product_name}
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminRatingStats;