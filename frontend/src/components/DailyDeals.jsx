import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Clock, 
  Flame, 
  ShoppingCart, 
  Star,
  TrendingUp,
  Timer
} from 'lucide-react';
import { mockProducts, mockDailyDeals } from '../data/actual-inventory';

const DailyDeals = ({ user }) => {
  const [timeLeft, setTimeLeft] = useState({});

  // Block access for unverified users
  if (!user?.is_verified || user?.verification_status !== 'approved') {
    return (
      <div className="py-20 bg-black text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold text-white mb-4">Verification Required</h2>
        <p className="text-gray-400">You must be verified to view daily deals.</p>
      </div>
    );
  }

  // Calculate time remaining for deals
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const newTimeLeft = {};
      
      mockDailyDeals.forEach(deal => {
        const endTime = new Date(deal.validUntil).getTime();
        const difference = endTime - now;
        
        if (difference > 0) {
          newTimeLeft[deal.id] = {
            hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((difference % (1000 * 60)) / 1000)
          };
        }
      });
      
      setTimeLeft(newTimeLeft);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getProductsWithDeals = () => {
    return mockDailyDeals.map(deal => {
      const product = mockProducts.find(p => p.id === deal.productId);
      return { ...product, deal };
    }).filter(Boolean);
  };

  const productsWithDeals = getProductsWithDeals();

  return (
    <section className="py-20 bg-gradient-to-b from-gray-900 to-black" id="deals">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-4">
            <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-2 text-lg font-bold animate-pulse">
              🔥 LIMITED TIME OFFERS 🔥
            </Badge>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-yellow-400">
              Daily
            </span>
            {' '}Deals
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Premium selections based on bulk inventory • Save up to 50% • NYC Members Only
          </p>
        </div>

        {/* Deals Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {productsWithDeals.map((product) => {
            const discountedPrice = product.price * (1 - product.deal.discount / 100);
            const savings = product.price - discountedPrice;
            const timeRemaining = timeLeft[product.deal.id];

            return (
              <Card 
                key={product.id}
                className="bg-gradient-to-br from-red-900/30 to-orange-900/30 border-red-500/50 hover:border-red-400 transition-all duration-300 transform hover:scale-[1.02] group overflow-hidden relative"
              >
                {/* Animated border */}
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                
                <div className="flex flex-col md:flex-row">
                  {/* Product Image */}
                  <div className="relative md:w-1/3">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-48 md:h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    
                    {/* Deal Badge */}
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-red-500 text-white font-bold text-lg px-3 py-1 animate-bounce">
                        -{product.deal.discount}%
                      </Badge>
                    </div>
                    
                    {/* Deal Reason */}
                    <div className="absolute bottom-3 left-3 right-3">
                      <Badge className="bg-black/80 text-white text-xs w-full justify-center">
                        {product.deal.reason}
                      </Badge>
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 p-6">
                    <CardHeader className="p-0 mb-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-2xl font-bold text-white group-hover:text-red-400 transition-colors">
                            {product.name}
                          </h3>
                          <p className="text-gray-400 text-sm">{product.vendor}</p>
                        </div>
                        
                        {/* Rating */}
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-white text-sm font-medium">{product.rating}</span>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="p-0">
                      <p className="text-gray-300 text-sm mb-4">
                        {product.description}
                      </p>
                      
                      {/* THC Info */}
                      <div className="flex items-center space-x-2 mb-4">
                        <Badge variant="outline" className="border-green-400 text-green-400">
                          THC: {product.thc}
                        </Badge>
                        <Badge className="bg-green-500 text-white">
                          In Stock
                        </Badge>
                      </div>

                      {/* Pricing */}
                      <div className="mb-4">
                        <div className="flex items-baseline space-x-2 mb-1">
                          <span className="text-3xl font-black text-green-400">
                            ${discountedPrice?.toFixed(2) || '0.00'}
                          </span>
                          <span className="text-gray-400 line-through text-xl">
                            ${product?.price?.toFixed(2) || '0.00'}
                          </span>
                        </div>
                        <p className="text-yellow-400 text-sm font-medium">
                          You save ${savings.toFixed(2)}!
                        </p>
                      </div>

                      {/* Timer */}
                      {timeRemaining && (
                        <div className="mb-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <Timer className="h-4 w-4 text-red-400" />
                            <span className="text-red-400 text-sm font-medium">Deal ends in:</span>
                          </div>
                          <div className="flex space-x-2">
                            <div className="bg-black/50 rounded px-2 py-1 text-center min-w-[40px]">
                              <div className="text-white font-bold">{timeRemaining.hours || 0}</div>
                              <div className="text-xs text-gray-400">HRS</div>
                            </div>
                            <div className="bg-black/50 rounded px-2 py-1 text-center min-w-[40px]">
                              <div className="text-white font-bold">{timeRemaining.minutes || 0}</div>
                              <div className="text-xs text-gray-400">MIN</div>
                            </div>
                            <div className="bg-black/50 rounded px-2 py-1 text-center min-w-[40px]">
                              <div className="text-white font-bold">{timeRemaining.seconds || 0}</div>
                              <div className="text-xs text-gray-400">SEC</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* CTA Button */}
                      <Button 
                        disabled={!user?.is_verified}
                        className={`w-full font-bold py-3 text-lg transform transition-all duration-200 ${
                          !user?.is_verified 
                            ? 'bg-gray-600 hover:bg-gray-700 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 hover:scale-105'
                        } text-white`}
                        title={!user?.is_verified ? 'Verification required to purchase' : 'Pickup only - no delivery available'}
                        onClick={() => {
                          if (!user?.is_verified) {
                            alert('Membership verification required before making any purchases. Please complete your ID verification process.');
                          }
                        }}
                      >
                        <ShoppingCart className="h-5 w-5 mr-2" />
                        {!user?.is_verified ? 'Verification Required' : 'Order for Pickup - Cash OK'}
                      </Button>
                    </CardContent>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Deal Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="text-center bg-gradient-to-br from-green-900/30 to-black/30 border border-green-400/30 rounded-xl p-6">
            <TrendingUp className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-white">50%</h3>
            <p className="text-gray-400">Max Savings</p>
          </div>
          <div className="text-center bg-gradient-to-br from-yellow-900/30 to-black/30 border border-yellow-400/30 rounded-xl p-6">
            <Clock className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-white">24hrs</h3>
            <p className="text-gray-400">Deal Duration</p>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-red-900/50 to-orange-900/50 border border-red-500/50 rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">
              Never Miss a Deal
            </h3>
            <p className="text-gray-300 mb-6">
              Get notified when we drop fire deals on your favorite products
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <input 
                type="email" 
                placeholder="Enter your email"
                className="flex-1 bg-black/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-red-400 focus:outline-none"
              />
              <Button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-bold">
                Notify Me
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DailyDeals;