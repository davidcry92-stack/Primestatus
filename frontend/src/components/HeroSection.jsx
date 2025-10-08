import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Smartphone, Apple, Play, Crown, Zap } from 'lucide-react';
import SimpleCart from './SimpleCart';

const HeroSection = ({ onAuthClick, cartItems, setCartItems, user }) => {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-green-900 via-black to-yellow-900 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 border-2 border-green-400 rounded-full animate-pulse" />
        <div className="absolute top-40 right-20 w-24 h-24 border-2 border-yellow-400 rounded-full animate-bounce" />
        <div className="absolute bottom-40 left-1/4 w-16 h-16 border-2 border-green-400 rotate-45" />
        <div className="absolute bottom-20 right-1/3 w-20 h-20 border-2 border-yellow-400 rotate-12" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-20">
        <div className="text-center">
          {/* Logo moved back to header */}

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl font-black text-white mb-4 leading-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-yellow-400 animate-pulse">
              NYC
            </span>
            <span className="text-white"> PICKUP </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              LOCATION
            </span>
          </h1>
          
          {/* Delivery Coming Soon */}
          <div className="text-3xl md:text-5xl font-extrabold mb-6 transform animate-pulse">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 drop-shadow-lg">
              DELIVERY COMING SOON!
            </span>
          </div>

          {/* Subheadline */}
          <div className="max-w-3xl mx-auto mb-8">
            <p className="text-xl md:text-2xl text-gray-300 font-medium mb-4">
              Members-Only Cannabis Marketplace
            </p>
            <p className="text-lg text-gray-400">
              Premium products • **PICKUP ONLY** • Members-only location
            </p>
          </div>

          {/* Features */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <div className="flex items-center space-x-2 bg-black/50 rounded-full px-4 py-2 border border-green-400/30">
              <Zap className="h-4 w-4 text-yellow-400" />
              <span className="text-white text-sm font-medium">PICKUP ONLY</span>
            </div>
            <div className="flex items-center space-x-2 bg-black/50 rounded-full px-4 py-2 border border-green-400/30">
              <Crown className="h-4 w-4 text-yellow-400" />
              <span className="text-white text-sm font-medium">Members Only</span>
            </div>
            <div className="flex items-center space-x-2 bg-black/50 rounded-full px-4 py-2 border border-green-400/30">
              <span className="text-white text-sm font-medium">💰 Cash Accepted</span>
            </div>
          </div>

          {/* Pricing cards removed per user request - keep other HeroSection content */}

          {/* CTA Buttons */}
          {/* Join button removed - available at login screen */}

          {/* Daily Deals Section */}
          <DailyDeals />
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
    </section>
  );
};

export default HeroSection;