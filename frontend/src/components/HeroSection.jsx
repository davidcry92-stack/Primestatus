import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Smartphone, Apple, Play, Crown, Zap } from 'lucide-react';

const HeroSection = ({ onAuthClick }) => {
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
          {/* NYC Badge */}
          <div className="flex justify-center mb-8">
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold text-sm px-6 py-2 rounded-full">
              🗽 NEW YORK CITY EXCLUSIVE 🗽
            </Badge>
          </div>

          {/* Main Headline */}
          <h1 className="text-6xl md:text-8xl font-black text-white mb-6 leading-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-yellow-400 animate-pulse">
              NYC
            </span>
            <br />
            <span className="text-white">
              PICKUP
            </span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              ONLY
            </span>
          </h1>

          {/* Subheadline */}
          <div className="max-w-3xl mx-auto mb-8">
            <p className="text-xl md:text-2xl text-gray-300 font-medium mb-4">
              Members-Only Cannabis Marketplace
            </p>
            <p className="text-lg text-gray-400">
              Premium products • Daily deals • **PICKUP ONLY** • Members-only location
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

          {/* Membership Tiers */}
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-12">
            <div className="bg-gradient-to-br from-green-900/50 to-black/50 border border-green-400/30 rounded-xl p-6 backdrop-blur-sm">
              <h3 className="text-white font-bold text-xl mb-2">Basic Membership</h3>
              <p className="text-green-400 text-3xl font-black mb-2">$4.99<span className="text-sm text-gray-400">/month</span></p>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Premium product access</li>
                <li>• Daily deals</li>
                <li>• Member pricing</li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-yellow-900/50 to-black/50 border border-yellow-400/30 rounded-xl p-6 backdrop-blur-sm relative">
              <div className="absolute -top-2 -right-2">
                <Crown className="h-6 w-6 text-yellow-400" />
              </div>
              <h3 className="text-white font-bold text-xl mb-2">Premium + Health-Aid</h3>
              <p className="text-yellow-400 text-3xl font-black mb-2">$7.99<span className="text-sm text-gray-400">/month</span></p>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Everything in Basic</li>
                <li>• Exclusive Health-Aid access</li>
                <li>• Priority support</li>
              </ul>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button 
              onClick={onAuthClick}
              className="bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-4 rounded-full font-bold shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              Join StatusXSmoakland
            </Button>
          </div>

          {/* App Store Buttons */}
          <div className="space-y-4">
            <p className="text-white text-lg font-semibold">DOWNLOAD PRIMESTATUS</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button className="flex items-center space-x-3 bg-black hover:bg-gray-900 text-white border border-gray-600 px-6 py-3 rounded-xl">
                <Apple className="h-8 w-8" />
                <div className="text-left">
                  <p className="text-xs text-gray-400">Download PrimeStatus on the</p>
                  <p className="font-semibold">App Store</p>
                </div>
              </Button>
              <Button className="flex items-center space-x-3 bg-black hover:bg-gray-900 text-white border border-gray-600 px-6 py-3 rounded-xl">
                <Play className="h-8 w-8" />
                <div className="text-left">
                  <p className="text-xs text-gray-400">Get PrimeStatus on</p>
                  <p className="font-semibold">Google Play</p>
                </div>
              </Button>
            </div>
            <p className="text-gray-400 text-sm">
              Search "PrimeStatus" in your app store
            </p>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
    </section>
  );
};

export default HeroSection;