import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

const ProductRating = ({ productId, productName, currentRating = 0, onRatingSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [experience, setExperience] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [userRating, setUserRating] = useState(null);
  const { user, apiCall } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      loadUserRating();
    }
  }, [productId, user]);

  const loadUserRating = async () => {
    try {
      const response = await apiCall('/api/ratings/user/my-ratings');
      if (response.ok) {
        const ratings = await response.json();
        const existingRating = ratings.find(r => r.product_id === productId);
        if (existingRating) {
          setUserRating(existingRating);
          setRating(existingRating.rating);
          setReview(existingRating.review || '');
          setExperience(existingRating.experience || '');
        }
      }
    } catch (error) {
      console.error('Failed to load user rating:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in to rate products');
      return;
    }

    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    setLoading(true);

    try {
      const response = await apiCall('/api/ratings/', {
        method: 'POST',
        body: JSON.stringify({
          product_id: productId,
          rating: rating,
          review: review.trim() || null,
          experience: experience.trim() || null
        })
      });

      if (response.ok) {
        const newRating = await response.json();
        setUserRating(newRating);
        setShowForm(false);
        
        if (onRatingSubmitted) {
          onRatingSubmitted(newRating);
        }
        
        alert('Thank you for your rating!');
      } else {
        const errorData = await response.json();
        alert(`Failed to submit rating: ${errorData.detail}`);
      }
    } catch (error) {
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStarClick = (starRating) => {
    setRating(starRating);
  };

  const handleStarHover = (starRating) => {
    setHoverRating(starRating);
  };

  const handleStarLeave = () => {
    setHoverRating(0);
  };

  const renderStars = (interactive = false) => {
    const displayRating = interactive ? (hoverRating || rating) : currentRating;
    
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : undefined}
            disabled={!interactive}
            className={`text-2xl transition-colors ${
              interactive ? 'hover:scale-110 cursor-pointer' : 'cursor-default'
            } ${
              star <= displayRating
                ? 'text-yellow-400'
                : 'text-gray-400'
            }`}
            onClick={interactive ? () => handleStarClick(star) : undefined}
            onMouseEnter={interactive ? () => handleStarHover(star) : undefined}
            onMouseLeave={interactive ? handleStarLeave : undefined}
          >
            ★
          </button>
        ))}
        {!interactive && (
          <span className="ml-2 text-sm text-gray-400">
            ({currentRating}/5)
          </span>
        )}
      </div>
    );
  };

  if (!user) {
    return (
      <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
        <div className="text-center">
          <div className="mb-3">{renderStars(false)}</div>
          <p className="text-gray-400 text-sm">Please log in to rate this product</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">Rate This Product</h3>
        {userRating ? (
          <span className="text-sm text-green-400">✓ You rated this product</span>
        ) : (
          <span className="text-sm text-gray-400">Share your experience</span>
        )}
      </div>

      {!showForm ? (
        <div className="text-center">
          <div className="mb-4">{renderStars(false)}</div>
          
          {userRating ? (
            <div className="mb-4">
              <div className="mb-2">{renderStars(false)}</div>
              <div className="text-sm text-gray-300 mb-2">Your rating: {userRating.rating}/5 stars</div>
              {userRating.experience && (
                <div className="bg-gray-800 p-3 rounded text-sm text-gray-300 mb-2">
                  <strong>Your experience:</strong> {userRating.experience}
                </div>
              )}
              {userRating.review && (
                <div className="bg-gray-800 p-3 rounded text-sm text-gray-300">
                  <strong>Your review:</strong> {userRating.review}
                </div>
              )}
              <button
                onClick={() => setShowForm(true)}
                className="mt-3 text-red-400 hover:text-red-300 text-sm underline"
              >
                Update your rating
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
            >
              Rate This Product
            </button>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Rate {productName}
            </label>
            <div className="mb-2">{renderStars(true)}</div>
            <p className="text-xs text-gray-400">
              Click the stars to rate from 1 (poor) to 5 (excellent)
            </p>
          </div>

          {/* Experience Field */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              What's your experience? <span className="text-gray-500">(Optional)</span>
            </label>
            <textarea
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              rows={4}
              maxLength={500}
              placeholder="Share your experience with this product... How did it make you feel? What effects did you notice? Would you recommend it?"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
            />
            <div className="text-xs text-gray-400 mt-1">
              {experience.length}/500 characters
            </div>
          </div>

          {/* Review Field */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Additional Review <span className="text-gray-500">(Optional)</span>
            </label>
            <textarea
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              rows={3}
              maxLength={500}
              placeholder="Any additional thoughts about this product..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
            />
            <div className="text-xs text-gray-400 mt-1">
              {review.length}/500 characters
            </div>
          </div>

          {/* Buttons */}
          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={loading || rating === 0}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition-colors"
            >
              {loading ? 'Submitting...' : userRating ? 'Update Rating' : 'Submit Rating'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                if (userRating) {
                  setRating(userRating.rating);
                  setReview(userRating.review || '');
                  setExperience(userRating.experience || '');
                } else {
                  setRating(0);
                  setReview('');
                  setExperience('');
                }
              }}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ProductRating;