import React from 'react';

const HealthAid = ({ user = null }) => {
  // Check if user has premium access
  const hasAccess = user?.membershipTier === 'premium' || user?.role === 'super_admin' || user?.role === 'admin';
  const isBasicMember = user && (user.membershipTier === 'basic' || user.membership_tier === 'basic');
  const isPremiumMember = hasAccess;

  // Premium members get full access, no upgrade needed
  if (isPremiumMember) {
    // Continue to full HealthAid content below
  }
  // Basic members see upgrade option
  else if (isBasicMember) {
    return (
      <section className="py-20 bg-gradient-to-b from-purple-900 to-emerald-900" id="health-aid">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
            Health-Aid
          </h2>
          <div className="bg-gray-900/70 backdrop-blur rounded-2xl p-8 border border-emerald-500/30">
            <h3 className="text-white font-bold text-lg mb-2">Premium + Health-Aid</h3>
            <p className="text-gray-300 text-sm mb-4">Everything + exclusive Health-Aid access</p>
            <p className="text-emerald-400 mb-6">
              Unlock our exclusive wellness resources with premium membership
            </p>
            <p className="text-gray-300 mb-6">
              Premium features • Wellness resources • **PICKUP ONLY** • Members-only location
            </p>
            <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-full font-bold">
              Upgrade to Premium
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-b from-purple-900 to-emerald-900" id="health-aid">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
            Health-Aid
          </h2>
          <p className="text-xl text-emerald-300 mb-4">
            Premium Wellness Resources
          </p>
          <p className="text-gray-300 max-w-3xl mx-auto">
            Wellness products • Health education • Scientific terms • Cannabis benefits
          </p>
        </div>

        {/* Wellness Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          
          {/* Luv Drops */}
          <div className="bg-gray-900/50 backdrop-blur rounded-xl p-6 border border-emerald-500/30 hover:border-emerald-400/50 transition-all">
            <div className="text-4xl mb-4">💊</div>
            <h3 className="text-xl font-bold text-white mb-2">Luv Drops</h3>
            <p className="text-emerald-400 mb-3">$30 • Premium wellness</p>
            <p className="text-gray-300 text-sm mb-4">Premium wellness luv drops for enhanced well-being and relaxation.</p>
            <div className="flex items-center text-yellow-400">
              <span className="text-sm">★★★★☆ 4.4</span>
            </div>
          </div>

          {/* Balance Oil Capsules */}
          <div className="bg-gray-900/50 backdrop-blur rounded-xl p-6 border border-emerald-500/30 hover:border-emerald-400/50 transition-all">
            <div className="text-4xl mb-4">⚖️</div>
            <h3 className="text-xl font-bold text-white mb-2">Balance Oil Capsules</h3>
            <p className="text-emerald-400 mb-3">$30 • Wellness balance</p>
            <p className="text-gray-300 text-sm mb-4">Balance oil capsules for wellness and therapeutic benefits.</p>
            <div className="flex items-center text-yellow-400">
              <span className="text-sm">★★★★★ 4.5</span>
            </div>
          </div>

          {/* Wellness Education */}
          <div className="bg-gray-900/50 backdrop-blur rounded-xl p-6 border border-emerald-500/30 hover:border-emerald-400/50 transition-all">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-xl font-bold text-white mb-2">Wellness Education</h3>
            <p className="text-emerald-400 mb-3">Free • Premium exclusive</p>
            <p className="text-gray-300 text-sm mb-4">Comprehensive cannabis education and wellness resources.</p>
            <div className="flex items-center text-emerald-400">
              <span className="text-sm">🌿 Educational Content</span>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Need Wellness Support?</h3>
          <p className="text-gray-300 mb-6">
            Help expand our Health-Aid by suggesting new wellness products and resources
          </p>
          <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-full font-bold">
            Suggest a Product
          </button>
        </div>
      </div>
    </section>
  );
};

export default HealthAid;