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
import { mockProducts, mockDailyDeals } from '../data/mock';

const ProductGrid = ({ category = 'all' }) => {
  const [selectedCategory, setSelectedCategory] = useState(category);
  const [cart, setCart] = useState([]);

  const filteredProducts = selectedCategory === 'all' 
    ? mockProducts 
    : mockProducts.filter(product => product.category === selectedCategory);

  const getDealForProduct = (productId) => {
    return mockDailyDeals.find(deal => deal.productId === productId);
  };

  const addToCart = async (product) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to add items to cart",
        variant: "destructive",
      });
      return;
    }

    try {
      await cartAPI.add({
        product_id: product.id,
        quantity: 1
      });
      
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart`,
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    }
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

        {/* Category Filter */}
        <div className="flex justify-center mb-12">
          <div className="flex flex-wrap gap-2 bg-black/50 rounded-full p-2 border border-gray-700">
            {['all', 'flower', 'edibles', 'concentrates'].map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? 'default' : 'ghost'}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-6 py-2 capitalize ${
                  selectedCategory === cat 
                    ? 'bg-green-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {getCategoryIcon(cat)}
                <span className="ml-2">{cat === 'all' ? 'All Products' : cat}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-gray-800 rounded-lg h-96 animate-pulse" />
            ))}
          </div>
        ) : (
          /* Products Grid */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => {

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
                    {product.daily_deal && (
                      <Badge className="bg-yellow-500 text-black font-bold flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>Daily Deal</span>
                      </Badge>
                    )}
                  </div>

                  {/* Category Badge */}
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-black/70 text-white flex items-center space-x-1">
                      {getCategoryIcon(product.category)}
                      <span className="capitalize">{product.category}</span>
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
                  
                  {/* THC Info */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="border-green-400 text-green-400">
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
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-green-400">
                        ${product.price.toFixed(2)}
                      </span>
                      {product.original_price && product.original_price > product.price && (
                        <span className="text-gray-400 line-through text-lg">
                          ${product.original_price.toFixed(2)}
                        </span>
                      )}
                    </div>
                    
                    <Button 
                      onClick={() => addToCart(product)}
                      disabled={!product.inStock}
                      className="bg-green-600 hover:bg-green-700 text-white flex items-center space-x-2"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      <span>Add to Cart</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          </div>
        )}

        {/* Load More Button */}
        <div className="text-center mt-12">
          <Button className="bg-gradient-to-r from-green-600 to-yellow-600 hover:from-green-700 hover:to-yellow-700 text-white px-8 py-3 rounded-full font-bold">
            Load More Products
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;