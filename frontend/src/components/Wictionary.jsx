import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { 
  Search, 
  Book, 
  Crown, 
  Filter,
  BookOpen,
  Sparkles,
  Lock
} from 'lucide-react';
import { mockWictionary, mockUserProfile } from '../data/actual-inventory';

const WellnessCenter = ({ user = null }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showUpgrade, setShowUpgrade] = useState(false);

  // Check if user has premium access or is admin
  const hasAccess = user?.membershipTier === 'premium' || 
                   user?.membership_tier === 'premium' || 
                   user?.role === 'super_admin' ||
                   user?.email === 'admin@statusxsmoakland.com';

  const categories = ['all', 'slang', 'science', 'culture', 'legal'];

  const filteredTerms = (mockWictionary || []).filter(term => {
    const matchesSearch = term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         term.definition.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || term.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (!hasAccess) {
    return (
      <section className="py-20 bg-gradient-to-b from-black to-purple-900" id="wellness-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-br from-purple-900/50 to-black/50 border border-purple-500/50 rounded-2xl p-12 backdrop-blur-sm">
            <Lock className="h-16 w-16 text-purple-400 mx-auto mb-6" />
            <h2 className="text-4xl font-black text-white mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                Wictionary
              </span>
              {' '}Access
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Unlock our exclusive cannabis dictionary with premium membership
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-black/30 border border-gray-600 rounded-xl p-6">
                <h3 className="text-white font-bold text-lg mb-2">Basic Membership</h3>
                <p className="text-green-400 text-2xl font-black mb-4">$4.99/month</p>
                <p className="text-gray-400 text-sm">Premium products & daily deals</p>
              </div>
              <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-400/50 rounded-xl p-6 relative">
                <Crown className="h-6 w-6 text-yellow-400 absolute top-4 right-4" />
                <h3 className="text-white font-bold text-lg mb-2">Premium + Wictionary</h3>
                <p className="text-purple-400 text-2xl font-black mb-4">$7.99/month</p>
                <p className="text-gray-300 text-sm">Everything + exclusive Wictionary access</p>
              </div>
            </div>
            
            <Button 
              onClick={() => setShowUpgrade(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-full font-bold text-lg transform hover:scale-105 transition-all duration-200"
            >
              <Crown className="h-5 w-5 mr-2" />
              Upgrade to Premium
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-b from-black to-purple-900" id="wictionary">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-4">
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 text-lg font-bold flex items-center space-x-2">
              <Crown className="h-5 w-5" />
              <span>PREMIUM EXCLUSIVE</span>
            </Badge>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Wictionary
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Your exclusive cannabis dictionary • NYC slang • Scientific terms • Culture insights
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search terms or definitions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-black/50 border-gray-600 text-white placeholder-gray-400 focus:border-purple-400"
              />
            </div>
            
            {/* Category Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <div className="flex space-x-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory(category)}
                    className={`capitalize ${
                      selectedCategory === category
                        ? 'bg-purple-600 text-white'
                        : 'border-gray-600 text-gray-400 hover:text-white hover:border-purple-400'
                    }`}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Results Count */}
          <p className="text-gray-400 text-sm">
            Showing {filteredTerms.length} terms
          </p>
        </div>

        {/* Dictionary Terms */}
        <div className="grid gap-6">
          {filteredTerms.map((term) => (
            <Card 
              key={term.id}
              className="bg-gradient-to-br from-purple-900/30 to-black/30 border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 group"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold text-white group-hover:text-purple-400 transition-colors">
                      {term.term}
                    </CardTitle>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge 
                        className={`capitalize ${
                          term.category === 'slang' ? 'bg-green-500' :
                          term.category === 'science' ? 'bg-blue-500' :
                          term.category === 'culture' ? 'bg-yellow-500' :
                          'bg-gray-500'
                        } text-white`}
                      >
                        {term.category}
                      </Badge>
                      <BookOpen className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                  <Sparkles className="h-6 w-6 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-gray-300 text-lg mb-4 leading-relaxed">
                  {term.definition}
                </p>
                
                {term.etymology && (
                  <div className="bg-black/30 rounded-lg p-4 border border-gray-700">
                    <h4 className="text-purple-400 font-semibold text-sm mb-2 flex items-center space-x-2">
                      <Book className="h-4 w-4" />
                      <span>Etymology</span>
                    </h4>
                    <p className="text-gray-400 text-sm">{term.etymology}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredTerms.length === 0 && (
          <div className="text-center py-12">
            <Book className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              No terms found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}

        {/* Suggest Term */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-500/50 rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">
              Know a term we’re missing?
            </h3>
            <p className="text-gray-300 mb-6">
              Help expand our Wictionary by suggesting new cannabis terms and definitions
            </p>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-full font-bold">
              Suggest a Term
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WellnessCenter;