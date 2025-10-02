import React, { useState } from 'react';
import ProductGrid from './ProductGrid';
import WellnessCenter from './Wictionary';

const ProductSelection = ({ onCategorySelect, user }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Block access for unverified users
  if (!user?.is_verified || user?.verification_status !== 'approved') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold mb-4">Verification Required</h2>
          <p className="text-gray-400">You must be verified to access products.</p>
        </div>
      </div>
    );
  }

  const handleCategoryClick = (category, tier = null) => {
    console.log('Category clicked:', category, 'Tier:', tier);
    setSelectedCategory({ category, tier });
    if (onCategorySelect) {
      onCategorySelect({ category, tier });
    }
  };

  const handleBackToSelection = () => {
    setSelectedCategory(null);
  };

  if (selectedCategory) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 py-8">
          <button
            onClick={handleBackToSelection}
            className="mb-6 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
          >
            ← Back to Categories
          </button>
          <ProductGrid 
            category={selectedCategory.category} 
            tier={selectedCategory.tier}
            user={user}
            showTitle={true}
          />
        </div>
      </div>
    );
  }

  return (
    <section className="py-20 bg-black" id="products">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-white mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-purple-600">
              Choose Your Experience
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Select from our curated categories of premium cannabis products
          </p>
        </div>

        {/* Top-Level Category Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <button 
            onClick={() => handleCategoryClick('all')}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-full transition-colors"
          >
            All Products
          </button>
          <button 
            onClick={() => handleCategoryClick('flower', 'lows')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full transition-colors"
          >
            Lows (Affordable)
          </button>
          <button 
            onClick={() => handleCategoryClick('flower', 'deps')}
            className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-6 rounded-full transition-colors"
          >
            Deps (Regular)
          </button>
          <button 
            onClick={() => handleCategoryClick('flower', 'za')}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-full transition-colors"
          >
            Za (Premium)
          </button>
          <button 
            onClick={() => {
              if (user?.membershipTier === 'premium' || user?.role === 'super_admin' || user?.role === 'admin') {
                handleCategoryClick('health-aid');
              } else {
                alert('Health-Aid access requires Premium membership. Upgrade to unlock wellness resources!');
              }
            }}
            className={`font-bold py-3 px-6 rounded-full transition-colors ${
              user?.membershipTier === 'premium' || user?.role === 'super_admin' || user?.role === 'admin'
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-gray-600 hover:bg-gray-700 text-gray-300'
            }`}
          >
            Health-Aid
          </button>
          <button 
            onClick={() => handleCategoryClick('pre-rolls')}
            className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-full transition-colors"
          >
            Pre-rolls
          </button>
          <button 
            onClick={() => handleCategoryClick('edibles')}
            className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-6 rounded-full transition-colors"
          >
            Edibles
          </button>
          <button 
            onClick={() => handleCategoryClick('vapes')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-full transition-colors"
          >
            Vapes
          </button>
          <button 
            onClick={() => handleCategoryClick('concentrates')}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-full transition-colors"
          >
            Concentrates
          </button>
          <button 
            onClick={() => handleCategoryClick('suppositories')}
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-full transition-colors"
          >
            Wellness
          </button>
        </div>

        {/* Visual Category Grid - Keep the beautiful cards for visual appeal */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          
          {/* Lows (Affordable) Category - FIRST */}
          <div 
            onClick={() => handleCategoryClick('flower', 'lows')}
            className="relative group cursor-pointer transform hover:scale-105 transition-all duration-300"
          >
            <div className="bg-gradient-to-br from-yellow-300 to-pink-400 rounded-2xl p-6 h-80 flex flex-col justify-center items-center overflow-hidden relative">
              <div className="absolute inset-0 bg-black bg-opacity-10"></div>
              <div className="relative z-10 text-center">
                <div className="text-5xl font-black text-black mb-2" style={{
                  textShadow: '2px 2px 0px #fff'
                }}>
                  LOWS
                </div>
                <div className="text-2xl font-bold text-pink-600 mb-4">
                  AFFORDABLE BUD
                </div>
                <div className="text-sm text-black font-bold mb-2">
                  "SMOOTH INTRODUCTION FOR BEGINNERS"
                </div>
                <div className="text-sm text-black font-bold mb-2">
                  "BASIC BUD, BUT STILL GETS THE JOB DONE"
                </div>
                {/* Character face with sunglasses */}
                <div className="flex justify-center mt-4">
                  <div className="w-16 h-12 bg-black rounded-lg flex items-center justify-center relative">
                    <div className="w-12 h-8 bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 rounded opacity-80"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white text-xs">😎</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Stars decoration */}
              <div className="absolute top-4 left-4 text-yellow-400">⭐</div>
              <div className="absolute top-8 right-8 text-pink-400">⭐</div>
              <div className="absolute bottom-6 left-8 text-yellow-300">⭐</div>
            </div>
          </div>

          {/* Deps (Mid-tier) Category - SECOND */}
          <div 
            onClick={() => handleCategoryClick('flower', 'deps')}
            className="relative group cursor-pointer transform hover:scale-105 transition-all duration-300"
          >
            <div className="bg-gradient-to-br from-yellow-400 to-green-500 rounded-2xl p-6 h-80 flex flex-col justify-center items-center overflow-hidden relative">
              <div className="absolute inset-0 bg-black bg-opacity-20"></div>
              <div className="relative z-10 text-center">
                <div className="text-6xl font-black text-white mb-4" style={{
                  textShadow: '3px 3px 0px #000, -1px -1px 0px #000, 1px -1px 0px #000, -1px 1px 0px #000'
                }}>
                  Deps
                </div>
                <div className="text-xl font-bold text-white mb-4">
                  The Mids that Matter
                </div>
                <div className="text-sm text-black font-semibold mb-2">
                  "Noticeably more potent than Lows"
                </div>
                <div className="text-sm text-black font-semibold">
                  "Smooth smoke and quality"
                </div>
                <div className="text-black text-xs mt-2 font-bold">
                  Everyday elevation for the seasoned sesher
                </div>
              </div>
              {/* Greenhouse/plant decoration */}
              <div className="absolute bottom-0 left-0 w-full h-16 bg-green-600 opacity-30 rounded-b-2xl"></div>
              <div className="absolute top-6 right-6 w-10 h-10 bg-green-700 rounded-full opacity-40"></div>
            </div>
          </div>

          {/* Za (Premium) Category - THIRD */}
          <div 
            onClick={() => handleCategoryClick('flower', 'za')}
            className="relative group cursor-pointer transform hover:scale-105 transition-all duration-300"
          >
            <div className="bg-gradient-to-br from-teal-600 to-purple-700 rounded-2xl p-6 h-80 flex flex-col justify-center items-center overflow-hidden relative">
              <div className="absolute inset-0 bg-black bg-opacity-30"></div>
              <div className="relative z-10 text-center">
                <div className="text-6xl font-black text-white mb-4" style={{
                  textShadow: '3px 3px 0px #000, -1px -1px 0px #000, 1px -1px 0px #000, -1px 1px 0px #000'
                }}>
                  Za
                </div>
                <div className="text-2xl font-bold text-pink-300 mb-2">
                  The Loudest
                </div>
                <div className="text-lg text-white mb-4">
                  in the Room
                </div>
                <div className="flex justify-center space-x-4 text-yellow-300 text-sm">
                  <span>👃 AROMA</span>
                  <span>👅 FLAVOR</span>
                  <span>😌 EFFECTS</span>
                </div>
                <div className="text-yellow-300 text-sm mt-2">
                  SMALL BATCH
                </div>
              </div>
              {/* Cannabis buds decoration */}
              <div className="absolute top-4 left-4 w-8 h-8 bg-green-500 rounded-full opacity-70"></div>
              <div className="absolute bottom-4 right-4 w-6 h-6 bg-green-400 rounded-full opacity-50"></div>
              <div className="absolute top-1/2 right-6 w-4 h-4 bg-green-600 rounded-full opacity-60"></div>
            </div>
          </div>

          {/* Health-Aid moved to after Suppositories/Wellness card */}
        </div>

        {/* Additional Categories Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Vapes Category */}
          <div 
            onClick={() => handleCategoryClick('vapes')}
            className="relative group cursor-pointer transform hover:scale-105 transition-all duration-300"
          >
            <div className="bg-gradient-to-br from-teal-400 to-black rounded-2xl p-6 h-80 flex flex-col justify-center items-center overflow-hidden relative">
              <div className="absolute inset-0 bg-black bg-opacity-40"></div>
              <div className="relative z-10 text-center">
                <div className="text-5xl font-black text-white mb-4" style={{
                  textShadow: '3px 3px 0px #000, -1px -1px 0px #000, 1px -1px 0px #000, -1px 1px 0px #000'
                }}>
                  VAPES
                </div>
                <div className="text-lg font-bold text-blue-300 mb-4">
                  PUFF, PLAY, REPEAT: VAPE YOUR WAY TO BLISS!
                </div>
                <div className="text-sm text-gray-300 mb-2">
                  Effortless, portable, and discreet
                </div>
                <div className="text-xs text-gray-400">
                  Perfect for cannabis enthusiasts and rolling rookies
                </div>
                {/* Vape pen illustrations */}
                <div className="flex justify-center space-x-2 mt-4">
                  <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
                  <div className="w-2 h-8 bg-yellow-500 rounded-full"></div>
                  <div className="w-2 h-8 bg-pink-500 rounded-full"></div>
                  <div className="w-2 h-8 bg-orange-500 rounded-full"></div>
                  <div className="w-2 h-8 bg-green-500 rounded-full"></div>
                  <div className="w-2 h-8 bg-purple-500 rounded-full"></div>
                </div>
              </div>
              {/* Cannabis leaf decoration */}
              <div className="absolute top-4 right-4 w-8 h-8 text-green-400">🍃</div>
              <div className="absolute bottom-6 left-6 w-6 h-6 text-green-500">🍃</div>
            </div>
          </div>

          {/* Edibles Category */}
          <div 
            onClick={() => handleCategoryClick('edibles')}
            className="relative group cursor-pointer transform hover:scale-105 transition-all duration-300"
          >
            <div className="bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl p-6 h-80 flex flex-col justify-center items-center overflow-hidden relative">
              <div className="absolute inset-0 bg-black bg-opacity-30"></div>
              <div className="relative z-10 text-center">
                <div className="text-5xl font-black text-white mb-4" style={{
                  textShadow: '3px 3px 0px #000, -1px -1px 0px #000, 1px -1px 0px #000, -1px 1px 0px #000'
                }}>
                  EDIBLES
                </div>
                <div className="text-lg font-bold text-blue-300 mb-4">
                  A TASTY ALTERNATIVE FOR ASTHMA AFICIONADOS
                </div>
                <div className="text-sm text-gray-200 mb-2">
                  Cannabis-infused delights
                </div>
                <div className="text-xs text-gray-300">
                  Magical world without the smoky side effects
                </div>
                {/* Sweet treats illustrations */}
                <div className="flex justify-center space-x-3 mt-4">
                  <div className="w-6 h-4 bg-amber-600 rounded"></div>
                  <div className="w-4 h-4 bg-pink-400 rounded-full"></div>
                  <div className="w-5 h-4 bg-purple-500 rounded"></div>
                  <div className="w-4 h-4 bg-green-400 rounded-full"></div>
                </div>
                {/* Cute bears */}
                <div className="flex justify-center space-x-2 mt-2">
                  <span className="text-pink-300">🧸</span>
                  <span className="text-orange-300">🧸</span>
                </div>
              </div>
              {/* Stars decoration */}
              <div className="absolute top-3 left-4 text-yellow-300">⭐</div>
              <div className="absolute bottom-4 right-6 text-white">⭐</div>
            </div>
          </div>

          {/* Pre-rolls Category */}
          <div 
            onClick={() => handleCategoryClick('pre-rolls')}
            className="relative group cursor-pointer transform hover:scale-105 transition-all duration-300"
          >
            <div className="bg-gradient-to-br from-green-600 to-yellow-500 rounded-2xl p-6 h-80 flex flex-col justify-center items-center overflow-hidden relative">
              <div className="absolute inset-0 bg-black bg-opacity-30"></div>
              <div className="relative z-10 text-center">
                <div className="text-4xl font-black text-white mb-4" style={{
                  textShadow: '3px 3px 0px #000, -1px -1px 0px #000, 1px -1px 0px #000, -1px 1px 0px #000'
                }}>
                  PRE-ROLLS
                </div>
                <div className="text-lg font-bold text-black mb-4">
                  READY TO LIGHT & ENJOY
                </div>
                <div className="text-sm text-gray-800 mb-2">
                  Premium rolled joints and blunts
                </div>
                <div className="text-xs text-gray-700">
                  From budget Super J to premium Paletas
                </div>
                {/* Joint illustrations */}
                <div className="flex justify-center space-x-2 mt-4">
                  <div className="w-1 h-8 bg-white rounded-full opacity-80"></div>
                  <div className="w-1 h-8 bg-orange-300 rounded-full opacity-80"></div>
                  <div className="w-1 h-8 bg-yellow-200 rounded-full opacity-80"></div>
                  <div className="w-1 h-8 bg-green-300 rounded-full opacity-80"></div>
                  <div className="w-1 h-8 bg-white rounded-full opacity-80"></div>
                </div>
              </div>
              {/* Smoke decoration */}
              <div className="absolute top-4 right-4 w-6 h-6 text-gray-300">💨</div>
              <div className="absolute bottom-6 left-6 w-4 h-4 text-gray-400">💨</div>
            </div>
          </div>

          {/* Concentrates Category */}
          <div 
            onClick={() => handleCategoryClick('concentrates')}
            className="relative group cursor-pointer transform hover:scale-105 transition-all duration-300"
          >
            <div className="bg-gradient-to-br from-orange-600 to-red-500 rounded-2xl p-6 h-80 flex flex-col justify-center items-center overflow-hidden relative">
              <div className="absolute inset-0 bg-black bg-opacity-30"></div>
              <div className="relative z-10 text-center">
                <div className="text-3xl font-black text-white mb-4" style={{
                  textShadow: '3px 3px 0px #000, -1px -1px 0px #000, 1px -1px 0px #000, -1px 1px 0px #000'
                }}>
                  CONCENTRATES
                </div>
                <div className="text-lg font-bold text-yellow-300 mb-4">
                  POTENT & PURE
                </div>
                <div className="text-sm text-gray-200 mb-2">
                  Kief, Shatter, Sauce & More
                </div>
                <div className="text-xs text-gray-300">
                  High-potency cannabis extracts
                </div>
                {/* Concentrate types */}
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <div className="bg-yellow-600 text-white text-xs px-2 py-1 rounded font-bold">KIEF</div>
                  <div className="bg-orange-600 text-white text-xs px-2 py-1 rounded font-bold">SHATTER</div>
                  <div className="bg-red-600 text-white text-xs px-2 py-1 rounded font-bold">SAUCE</div>
                  <div className="bg-amber-600 text-white text-xs px-2 py-1 rounded font-bold">WAX</div>
                </div>
              </div>
              {/* Fire decoration */}
              <div className="absolute top-4 right-4 w-6 h-6 text-orange-400">🔥</div>
              <div className="absolute bottom-4 left-4 w-8 h-8 text-red-400">🔥</div>
            </div>
          </div>

          {/* Suppositories Category */}
          <div 
            onClick={() => handleCategoryClick('wellness-center')}
            className="relative group cursor-pointer transform hover:scale-105 transition-all duration-300"
          >
            <div className="bg-gradient-to-br from-purple-800 to-teal-600 rounded-2xl p-6 h-80 flex flex-col justify-center items-center overflow-hidden relative">
              <div className="absolute inset-0 bg-black bg-opacity-40"></div>
              <div className="relative z-10 text-center">
                <div className="text-3xl font-black text-white mb-4" style={{
                  textShadow: '3px 3px 0px #000, -1px -1px 0px #000, 1px -1px 0px #000, -1px 1px 0px #000'
                }}>
                  WELLNESS
                </div>
                <div className="text-sm font-bold text-blue-300 mb-2">
                  CANNABIS WELLNESS PRODUCTS
                </div>
                <div className="text-xs text-gray-300 mb-2">
                  FOR HEALTH-CONSCIOUS CONSUMERS
                </div>
                <div className="text-xs text-gray-400 mb-4">
                  Suppositories, drops, and capsules
                </div>
                {/* Product boxes */}
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <div className="bg-teal-500 text-white text-xs px-2 py-1 rounded font-bold">LUV DROPS</div>
                  <div className="bg-purple-500 text-white text-xs px-2 py-1 rounded font-bold">BALANCE</div>
                  <div className="bg-green-500 text-white text-xs px-2 py-1 rounded font-bold">ABUNDANCE</div>
                  <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded font-bold">WELLNESS</div>
                </div>
              </div>
              {/* Cannabis leaf decoration */}
              <div className="absolute top-4 right-4 w-6 h-6 text-green-400">🍃</div>
              <div className="absolute bottom-4 left-4 w-8 h-8 text-green-500">🍃</div>
            </div>
          </div>

          {/* Health-Aid Category - After Wellness */}
          <div 
            onClick={() => {
              if (user?.membershipTier === 'premium' || user?.role === 'super_admin' || user?.role === 'admin') {
                window.location.href = '#wellness-center';
              } else {
                alert('Health-Aid access requires Premium membership. Upgrade to unlock wellness resources!');
              }
            }}
            className={`relative group cursor-pointer transform hover:scale-105 transition-all duration-300 ${
              user?.membershipTier !== 'premium' && user?.role !== 'super_admin' && user?.role !== 'admin' 
                ? 'opacity-75' : ''
            }`}
          >
            <div className="bg-gradient-to-br from-emerald-600 to-teal-800 rounded-2xl p-6 h-80 flex flex-col justify-center items-center overflow-hidden relative">
              <div className="absolute inset-0 bg-black bg-opacity-30"></div>
              {user?.membershipTier !== 'premium' && user?.role !== 'super_admin' && user?.role !== 'admin' && (
                <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🔒</div>
                    <div className="text-white font-bold text-sm">PREMIUM REQUIRED</div>
                  </div>
                </div>
              )}
              <div className="relative z-10 text-center">
                <div className="text-3xl font-black text-white mb-4" style={{
                  textShadow: '3px 3px 0px #000, -1px -1px 0px #000, 1px -1px 0px #000, -1px 1px 0px #000'
                }}>
                  Health-Aid
                </div>
                <div className="text-sm font-bold text-emerald-300 mb-2">
                  Wellness Resources
                </div>
                <div className="text-xs text-white mb-2">
                  Cannabis education & definitions
                </div>
                <div className="text-xs text-gray-400 mb-4">
                  Luv drops, balance capsules & more
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <div className="bg-emerald-500 text-white text-xs px-2 py-1 rounded font-bold">LUV DROPS</div>
                  <div className="bg-teal-500 text-white text-xs px-2 py-1 rounded font-bold">BALANCE</div>
                  <div className="bg-green-500 text-white text-xs px-2 py-1 rounded font-bold">EDUCATION</div>
                  <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded font-bold">HEALTH-AID</div>
                </div>
              </div>
              {/* Wellness decoration */}
              <div className="absolute top-4 left-4 w-6 h-6 text-emerald-400">🌿</div>
              <div className="absolute bottom-4 right-4 w-4 h-4 text-emerald-300">📖</div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-16">
          <p className="text-gray-400 text-sm">
            Click any category to explore our premium selection of cannabis products
          </p>
        </div>
      </div>
    </section>
  );
};

export default ProductSelection;