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
  Package,
  X
} from 'lucide-react';
import { mockProducts, mockDailyDeals, inStockProducts, outOfStockProducts } from '../data/actual-inventory';
import ProductRating from './ProductRating';

const ProductGrid = ({ category = 'all', tier = null, user, cartItems, setCartItems, onOpenCart, showTitle = false }) => {
  const [selectedCategory, setSelectedCategory] = useState(category);
  // Use cart props from parent instead of local state
  
  // Debug: Check if cart props are available
  console.log('ProductGrid props:', { cartItems: !!cartItems, setCartItems: !!setCartItems, user: !!user });
  const [showOutOfStock, setShowOutOfStock] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(12);
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

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

  // Get quantity options with tier-specific pricing
  const getQuantityOptions = (productTier) => {
    switch(productTier) {
      case 'lows':
        // Lows: $10 base
        return [
          { weight: '1/8', grams: '3.5g', multiplier: 1, label: 'Eighth' },
          { weight: '1/2 oz', grams: '14g', multiplier: 3.5, label: 'Half Ounce' }, // $35
          { weight: '1 oz', grams: '28g', multiplier: 6, label: 'Ounce' }, // $60
          { weight: '1/4 lb', grams: '112g', multiplier: 17.5, label: 'Quarter Pound' }, // $175
          { weight: '1/2 lb', grams: '224g', multiplier: 25, label: 'Half Pound' }, // $250
          { weight: '1 lb', grams: '448g', multiplier: 47.5, label: 'Pound' } // $450-500 (avg $475)
        ];
      case 'deps':
        // Deps: $15 base
        return [
          { weight: '1/8', grams: '3.5g', multiplier: 1, label: 'Eighth' },
          { weight: '1/2 oz', grams: '14g', multiplier: 3.67, label: 'Half Ounce' }, // $55
          { weight: '1 oz', grams: '28g', multiplier: 6.67, label: 'Ounce' }, // $100
          { weight: '1/4 lb', grams: '112g', multiplier: 20, label: 'Quarter Pound' }, // $300
          { weight: '1/2 lb', grams: '224g', multiplier: 40, label: 'Half Pound' }, // $600
          { weight: '1 lb', grams: '448g', multiplier: 58.33, label: 'Pound' } // $800-950 (avg $875)
        ];
      case 'za':
        // Za: $25 base
        return [
          { weight: '1/8', grams: '3.5g', multiplier: 1, label: 'Eighth' },
          { weight: '1/2 oz', grams: '14g', multiplier: 4, label: 'Half Ounce' }, // $100
          { weight: '1 oz', grams: '28g', multiplier: 7, label: 'Ounce' }, // $175
          { weight: '1/4 lb', grams: '112g', multiplier: 24, label: 'Quarter Pound' }, // $600
          { weight: '1/2 lb', grams: '224g', multiplier: 36, label: 'Half Pound' }, // $900
          { weight: '1 lb', grams: '448g', multiplier: 65, label: 'Pound' } // $1500-1750 (avg $1625)
        ];
      default:
        // Default to lows pricing
        return [
          { weight: '1/8', grams: '3.5g', multiplier: 1, label: 'Eighth' },
          { weight: '1/2 oz', grams: '14g', multiplier: 3.5, label: 'Half Ounce' },
          { weight: '1 oz', grams: '28g', multiplier: 6, label: 'Ounce' },
          { weight: '1/4 lb', grams: '112g', multiplier: 17.5, label: 'Quarter Pound' },
          { weight: '1/2 lb', grams: '224g', multiplier: 25, label: 'Half Pound' },
          { weight: '1 lb', grams: '448g', multiplier: 47.5, label: 'Pound' }
        ];
    }
  };

  const getDealForProduct = (productId) => {
    return mockDailyDeals.find(deal => deal.productId === productId);
  };

  const handleAddToCartClick = (product) => {
    console.log('handleAddToCartClick called:', product.name);
    console.log('User verification status:', user?.is_verified);
    console.log('Product in stock:', product.inStock);
    setSelectedProduct(product);
    setShowQuantityModal(true);
    console.log('Set showQuantityModal to true');
  };

  const addToCart = (product, quantity) => {
    // Block all transactions for unverified users
    if (!user || !user.is_verified) {
      alert('Membership verification required before making any purchases. Please complete your ID verification process.');
      return;
    }

    // Check if cart props are available
    if (!setCartItems) {
      console.error('Cart functionality not available - setCartItems prop missing');
      console.error('Available props:', { cartItems: !!cartItems, setCartItems: !!setCartItems });
      alert('Cart functionality is currently unavailable. Check console for details.');
      return;
    }

    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity.multiplier || 1,
      image: product.image,
      tier: product.tier,
      category: product.category
    };
    
    setCartItems(prevCart => {
      // Check if item already exists in cart
      const existingItemIndex = prevCart.findIndex(item => item.id === product.id);
      
      if (existingItemIndex > -1) {
        // Update quantity if item exists
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += quantity.multiplier || 1;
        return updatedCart;
      } else {
        // Add new item to cart
        return [...prevCart, cartItem];
      }
    });
    
    setShowQuantityModal(false);
    setSelectedProduct(null);
    
    // Automatically open cart after adding item
    console.log('About to call onOpenCart, function exists:', !!onOpenCart);
    setTimeout(() => {
      if (onOpenCart) {
        console.log('Calling onOpenCart function now');
        onOpenCart();
      } else {
        console.error('onOpenCart function not available');
      }
    }, 100); // Small delay to ensure state updates
    
    console.log('Added to cart:', cartItem);
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
                          ${discountedPrice?.toFixed(2) || '0.00'}
                        </span>
                        {deal && (
                          <span className="text-gray-400 line-through text-lg">
                            ${product?.originalPrice || '0.00'}
                          </span>
                        )}
                      </div>
                      <span className="text-gray-400 text-sm">per 1/8 (3.5g)</span>
                    </div>
                    
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Button clicked for:', product.name);
                        console.log('Button disabled?', !product.inStock || !user?.is_verified);
                        console.log('User:', user);
                        handleAddToCartClick(product);
                      }}
                      disabled={!product.inStock || !user?.is_verified}
                      className={`w-full font-bold py-2 px-4 rounded transition-colors flex items-center justify-center ${
                        !product.inStock || !user?.is_verified
                          ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      {!user?.is_verified ? 'Verification Required' : 
                       !product.inStock ? 'Out of Stock' : 
                       'Select Quantity'}
                    </button>
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

      {/* Quantity Selection Modal */}
      {showQuantityModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-900 rounded-xl border border-gray-700 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Select Quantity</h3>
                <button
                  onClick={() => setShowQuantityModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Product Info */}
              <div className="flex items-center space-x-4 mb-6 p-3 bg-gray-800 rounded-lg">
                <img 
                  src={selectedProduct.image} 
                  alt={selectedProduct.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div>
                  <h4 className="text-white font-semibold">{selectedProduct.name}</h4>
                  <p className="text-gray-400 text-sm">{selectedProduct.type}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="outline" className="border-green-400 text-green-400 text-xs">
                      THC: {selectedProduct.thc}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Quantity Options */}
              <div className="space-y-3">
                <h4 className="text-white font-semibold mb-3">Choose Amount:</h4>
                {getQuantityOptions(selectedProduct.tier).map((option, index) => {
                  const totalPrice = (selectedProduct.price * option.multiplier).toFixed(2);
                  return (
                    <button
                      key={index}
                      onClick={() => addToCart(selectedProduct, option)}
                      className="w-full flex items-center justify-between p-4 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-600 hover:border-green-400 transition-all duration-200 group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 rounded-full border-2 border-green-400 group-hover:bg-green-400 transition-colors"></div>
                        <div>
                          <span className="text-white font-semibold">{option.weight}</span>
                          <span className="text-gray-400 ml-2">({option.grams})</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-green-400 font-bold text-lg">${totalPrice}</div>
                        <div className="text-gray-400 text-sm">{option.label}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Price Note */}
              <div className="mt-6 p-3 bg-yellow-900/30 border border-yellow-400/30 rounded-lg">
                <p className="text-yellow-200 text-sm">
                  <strong>Pickup Only:</strong> All orders must be picked up in-store. No delivery available.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ProductGrid;