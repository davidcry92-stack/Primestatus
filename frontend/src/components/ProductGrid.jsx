import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { 
  ShoppingCart, 
  Star, 
  Clock, 
  MapPin,
  Flame,
  Leaf,
  Package
} from 'lucide-react';
import { mockProducts, mockDailyDeals, inStockProducts, outOfStockProducts } from '../data/mock';
import ProductRating from './ProductRating';

const ProductGrid = ({ category = 'all', tier = null, user, showTitle = false }) => {
  const [selectedCategory, setSelectedCategory] = useState(category);
  const [cart, setCart] = useState([]);
  const [showOutOfStock, setShowOutOfStock] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(12);

  // Get all products (in-stock and out-of-stock)
  const allProducts = [...inStockProducts, ...outOfStockProducts];
  
  // Filter products based on category and tier
  const filteredProducts = (() => {
    let products = allProducts;
    
    console.log('Filtering - Category:', category, 'Tier:', tier);
    
    // Handle 'all' category - show everything
    if (category === 'all') {
      return allProducts;
    }
    
    // Handle tier-based filtering (Za/Deps/Lows should only show flower)
    if (tier && (tier === 'za' || tier === 'deps' || tier === 'lows')) {
      products = allProducts.filter(product => 
        product.category === 'flower' && product.tier === tier
      );
      console.log(`Filtered ${tier} flower products:`, products.length);
      return products;
    }
    
    // Handle category-based filtering (pre-rolls, edibles, wellness, etc.)
    if (category && category !== 'all') {
      products = allProducts.filter(product => product.category === category);
      console.log(`Filtered ${category} products:`, products.length);
      return products;
    }
    
    // Fallback for selectedCategory state
    if (selectedCategory && selectedCategory !== 'all') {
      if (selectedCategory === 'za' || selectedCategory === 'deps' || selectedCategory === 'lows') {
        products = allProducts.filter(product => 
          product.category === 'flower' && product.tier === selectedCategory
        );
      } else {
        products = allProducts.filter(product => product.category === selectedCategory);
      }
    }
    
    return products;
  })();

  // Separate in-stock and out-of-stock products
  const inStockFiltered = filteredProducts.filter(product => product.inStock);
  const outOfStockFiltered = filteredProducts.filter(product => !product.inStock);
  
  // Products to display based on current view
  const productsToShow = showOutOfStock 
    ? [...inStockFiltered.slice(0, displayLimit), ...outOfStockFiltered.slice(0, displayLimit)]
    : inStockFiltered.slice(0, displayLimit);

  const getDealForProduct = (productId) => {
    return mockDailyDeals.find(deal => deal.productId === productId);
  };

  const addToCart = (product) => {
    // Block all transactions for unverified users
    if (!user || !user.is_verified) {
      alert('Membership verification required before making any purchases. Please complete your ID verification process.');
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'flower': return <Leaf className="h-4 w-4" />;
      case 'edibles': return <Package className="h-4 w-4" />;
      case 'concentrates': return <Flame className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  return (
    <section className="py-20 bg-gradient-to-b from-black to-gray-900" id="products">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-yellow-400">
              Premium
            </span>
            {' '}Products
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Curated selection of the finest cannabis products from trusted NYC vendors
          </p>
        </div>

        {/* Tier Filter */}
        <div className="flex justify-center mb-12">
          <div className="flex flex-wrap gap-2 bg-black/50 rounded-full p-2 border border-gray-700">
            {[
              { key: 'all', label: 'All Products', icon: '🔥' },
              { key: 'za', label: 'ZA (Premium)', icon: '💎' },
              { key: 'deps', label: 'Deps (Regular)', icon: '⚡' },
              { key: 'lows', label: 'Lows (Budget)', icon: '💰' }
            ].map((tier) => (
              <Button
                key={tier.key}
                variant={selectedCategory === tier.key ? 'default' : 'ghost'}
                onClick={() => setSelectedCategory(tier.key)}
                className={`rounded-full px-6 py-2 ${
                  selectedCategory === tier.key 
                    ? 'bg-green-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <span className="mr-2">{tier.icon}</span>
                <span>{tier.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Category Title */}
        {showTitle && (category || tier) && (
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              {tier && tier !== 'all' && (
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-purple-600">
                  {tier.charAt(0).toUpperCase() + tier.slice(1)} Tier
                </span>
              )}
              {category && category !== 'all' && !tier && (
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-purple-600">
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </span>
              )}
              {category && tier && (
                <span className="text-gray-300"> - {category.charAt(0).toUpperCase() + category.slice(1)}</span>
              )}
            </h2>
            <p className="text-gray-400">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} available
            </p>
          </div>
        )}

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => {
            const deal = getDealForProduct(product.id);
            const discountedPrice = deal 
              ? product.price * (1 - deal.discount / 100)
              : product.price;

            return (
              <Card 
                key={product.id} 
                className="bg-gradient-to-br from-gray-900 to-black border-gray-700 hover:border-green-400/50 transition-all duration-300 transform hover:scale-105 group overflow-hidden"
              >
                {/* Product Image */}
                <div className="relative overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {deal && (
                      <Badge className="bg-red-500 text-white font-bold">
                        -{deal.discount}% OFF
                      </Badge>
                    )}
                    {product.dailyDeal && (
                      <Badge className="bg-yellow-500 text-black font-bold flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>Daily Deal</span>
                      </Badge>
                    )}
                  </div>

                  {/* Tier Badge */}
                  <div className="absolute top-3 right-3">
                    <Badge className={`text-white font-bold flex items-center space-x-1 ${
                      product.tier === 'za' ? 'bg-purple-600' :
                      product.tier === 'deps' ? 'bg-blue-600' :
                      'bg-green-600'
                    }`}>
                      <span className="uppercase">{product.tier}</span>
                    </Badge>
                  </div>
                </div>

                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-green-400 transition-colors">
                        {product.name}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-400 text-sm">{product.vendor}</span>
                      </div>
                    </div>
                    
                    {/* Rating */}
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-white text-sm font-medium">{product.rating}</span>
                      <span className="text-gray-400 text-xs">({product.reviews})</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {product.description}
                  </p>
                  
                  {/* THC Info & Weight */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="border-green-400 text-green-400">
                        {product.weight}
                      </Badge>
                      <Badge variant="outline" className="border-blue-400 text-blue-400">
                        THC: {product.thc}
                      </Badge>
                      {product.inStock ? (
                        <Badge className="bg-green-500 text-white">
                          In Stock
                        </Badge>
                      ) : (
                        <Badge className="bg-red-500 text-white">
                          Out of Stock
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-green-400">
                          ${discountedPrice.toFixed(2)}
                        </span>
                        {deal && (
                          <span className="text-gray-400 line-through text-lg">
                            ${product.originalPrice}
                          </span>
                        )}
                      </div>
                      <span className="text-gray-400 text-sm">per 1/8 (3.5g)</span>
                    </div>
                    
                    <Button 
                      onClick={() => addToCart(product)}
                      disabled={!product.inStock || !user?.is_verified}
                      className={`flex items-center space-x-2 ${
                        !user?.is_verified 
                          ? 'bg-gray-600 hover:bg-gray-700 cursor-not-allowed' 
                          : 'bg-green-600 hover:bg-green-700'
                      } text-white`}
                      title={!user?.is_verified ? 'Verification required to purchase' : 'Pickup only - no delivery'}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      <span>{!user?.is_verified ? 'Verification Required' : 'Order for Pickup'}</span>
                    </Button>
                  </div>
                  
                  {/* Product Rating Component */}
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <ProductRating 
                      productId={product.id}
                      productName={product.name}
                      currentRating={product.rating}
                      onRatingSubmitted={() => {
                        // Could refresh product data here if needed
                        console.log('Rating submitted for', product.name);
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Load More and Stock Controls */}
        <div className="text-center mt-12 space-y-4">
          {/* Stock Status Summary */}
          <div className="mb-6 text-center">
            <p className="text-gray-300 text-lg mb-4">
              Showing <span className="text-green-400 font-bold">{inStockFiltered.length}</span> in-stock products
              {outOfStockFiltered.length > 0 && (
                <span>, <span className="text-red-400 font-bold">{outOfStockFiltered.length}</span> out-of-stock</span>
              )}
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {/* Show Out of Stock Toggle */}
            {outOfStockFiltered.length > 0 && (
              <Button 
                onClick={() => setShowOutOfStock(!showOutOfStock)}
                variant={showOutOfStock ? "default" : "outline"}
                className={showOutOfStock 
                  ? "bg-red-600 hover:bg-red-700 text-white" 
                  : "border-red-400 text-red-400 hover:bg-red-600 hover:text-white"
                }
              >
                {showOutOfStock ? "Hide" : "Show"} Out of Stock ({outOfStockFiltered.length})
              </Button>
            )}
            
            {/* Load More Button */}
            {(displayLimit < (showOutOfStock ? filteredProducts.length : inStockFiltered.length)) && (
              <Button 
                onClick={() => setDisplayLimit(prev => prev + 12)}
                className="bg-gradient-to-r from-green-600 to-yellow-600 hover:from-green-700 hover:to-yellow-700 text-white px-8 py-3 rounded-full font-bold"
              >
                Load More Products
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;