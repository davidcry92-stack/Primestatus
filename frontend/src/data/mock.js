// Mock data for StatusXSmoakland

// Products mock data with real Smoakland pricing
export const mockProducts = [
  // ZA (Premium Tier) Products - Top shelf pricing
  {
    id: '1',
    name: 'ZA Premium 1/8',
    category: 'flower',
    price: 25,
    originalPrice: 25,
    weight: '3.5g',
    tier: 'za',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
    description: 'Top-shelf ZA cannabis - mix & match any strands at ounce pricing',
    thc: '25-30%',
    vendor: 'Smoakland Premium',
    inStock: true,
    dailyDeal: false,
    rating: 4.9,
    reviews: 89
  },
  {
    id: '2',
    name: 'ZA Premium Half Ounce',
    category: 'flower',
    price: 55,
    originalPrice: 55,
    weight: '14g',
    tier: 'za',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
    description: 'Premium ZA half ounce - mix & match any strands',
    thc: '25-30%',
    vendor: 'Smoakland Premium',
    inStock: true,
    dailyDeal: false,
    rating: 4.9,
    reviews: 156
  },
  {
    id: '12',
    name: 'ZA Premium Full Ounce',
    category: 'flower',
    price: 100,
    originalPrice: 100,
    weight: '28g',
    tier: 'za',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
    description: 'Premium ZA full ounce - mix & match any strands at ounce only pricing',
    thc: '25-30%',
    vendor: 'Smoakland Premium',
    inStock: true,
    dailyDeal: false,
    rating: 4.9,
    reviews: 234
  },
  {
    id: '13',
    name: 'ZA Quarter Pound',
    category: 'flower',
    price: 300,
    originalPrice: 300,
    weight: '112g',
    tier: 'za',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
    description: 'ZA quarter pound - premium bulk pricing',
    thc: '25-30%',
    vendor: 'Smoakland Premium',
    inStock: true,
    dailyDeal: false,
    rating: 4.9,
    reviews: 78
  },
  {
    id: '14',
    name: 'ZA Half Pound',
    category: 'flower',
    price: 600,
    originalPrice: 600,
    weight: '224g',
    tier: 'za',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
    description: 'ZA half pound - wholesale premium pricing',
    thc: '25-30%',
    vendor: 'Smoakland Premium',
    inStock: true,
    dailyDeal: false,
    rating: 4.9,
    reviews: 45
  },
  {
    id: '15',
    name: 'ZA Full Pound',
    category: 'flower',
    price: 875,
    originalPrice: 950,
    weight: '448g',
    tier: 'za',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
    description: 'ZA full pound - ultimate premium bulk deal',
    thc: '25-30%',
    vendor: 'Smoakland Premium',
    inStock: true,
    dailyDeal: true,
    rating: 4.9,
    reviews: 23
  },
  
  // DEPS (Mid-tier) Products - Mid-range pricing
  {
    id: '3',
    name: 'Deps 1/8',
    category: 'flower',
    price: 25,
    originalPrice: 25,
    weight: '3.5g',
    tier: 'deps',
    image: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=400&fit=crop',
    description: 'Quality deps cannabis - perfect middle tier option',
    thc: '20-24%',
    vendor: 'Smoakland Standard',
    inStock: true,
    dailyDeal: false,
    rating: 4.5,
    reviews: 234
  },
  {
    id: '4',
    name: 'Deps Half Ounce',
    category: 'flower',
    price: 100,
    originalPrice: 100,
    weight: '14g',
    tier: 'deps',
    image: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=400&fit=crop',
    description: 'Half ounce deps - consistent quality and potency',
    thc: '20-24%',
    vendor: 'Smoakland Standard',
    inStock: true,
    dailyDeal: false,
    rating: 4.4,
    reviews: 312
  },
  {
    id: '5',
    name: 'Deps Full Ounce',
    category: 'flower',
    price: 175,
    originalPrice: 175,
    weight: '28g',
    tier: 'deps',
    image: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=400&fit=crop',
    description: 'Full ounce deps - reliable choice for regular users',
    thc: '20-24%',
    vendor: 'Smoakland Standard',
    inStock: true,
    dailyDeal: false,
    rating: 4.6,
    reviews: 187
  },
  {
    id: '16',
    name: 'Deps Quarter Pound',
    category: 'flower',
    price: 600,
    originalPrice: 600,
    weight: '112g',
    tier: 'deps',
    image: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=400&fit=crop',
    description: 'Deps quarter pound - bulk pricing',
    thc: '20-24%',
    vendor: 'Smoakland Standard',
    inStock: true,
    dailyDeal: false,
    rating: 4.5,
    reviews: 67
  },
  {
    id: '17',
    name: 'Deps Half Pound',
    category: 'flower',
    price: 900,
    originalPrice: 900,
    weight: '224g',
    tier: 'deps',
    image: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=400&fit=crop',
    description: 'Deps half pound - wholesale pricing',
    thc: '20-24%',
    vendor: 'Smoakland Standard',
    inStock: true,
    dailyDeal: false,
    rating: 4.6,
    reviews: 45
  },
  {
    id: '18',
    name: 'Deps Full Pound',
    category: 'flower',
    price: 1625,
    originalPrice: 1750,
    weight: '448g',
    tier: 'deps',
    image: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=400&fit=crop',
    description: 'Deps full pound - bulk deal',
    thc: '20-24%',
    vendor: 'Smoakland Standard',
    inStock: true,
    dailyDeal: true,
    rating: 4.7,
    reviews: 23
  },
  
  // LOWS (Budget tier) Products
  {
    id: '6',
    name: 'Lows 1/8',
    category: 'flower',
    price: 10,
    originalPrice: 15,
    weight: '3.5g',
    tier: 'lows',
    image: 'https://images.unsplash.com/photo-1597848212624-e6ebcc0eff05?w=400&h=400&fit=crop',
    description: 'Budget-friendly lows - unbeatable NYC prices',
    thc: '15-18%',
    vendor: 'Smoakland Budget',
    inStock: true,
    dailyDeal: false,
    rating: 4.2,
    reviews: 145
  },
  {
    id: '7',
    name: 'Lows Half Ounce',
    category: 'flower',
    price: 35,
    originalPrice: 45,
    weight: '14g',
    tier: 'lows',
    image: 'https://images.unsplash.com/photo-1597848212624-e6ebcc0eff05?w=400&h=400&fit=crop',
    description: 'Half ounce lows - incredible value for NYC',
    thc: '15-18%',
    vendor: 'Smoakland Budget',
    inStock: true,
    dailyDeal: false,
    rating: 4.1,
    reviews: 98
  },
  {
    id: '8',
    name: 'Lows Full Ounce',
    category: 'flower',
    price: 60,
    originalPrice: 75,
    weight: '28g',
    tier: 'lows',
    image: 'https://images.unsplash.com/photo-1597848212624-e6ebcc0eff05?w=400&h=400&fit=crop',
    description: 'Full ounce lows - maximum savings in NYC',
    thc: '15-18%',
    vendor: 'Smoakland Budget',
    inStock: true,
    dailyDeal: false,
    rating: 4.3,
    reviews: 203
  },
  {
    id: '9',
    name: 'Lows Quarter Pound',
    category: 'flower',
    price: 175,
    originalPrice: 200,
    weight: '112g',
    tier: 'lows',
    image: 'https://images.unsplash.com/photo-1597848212624-e6ebcc0eff05?w=400&h=400&fit=crop',
    description: 'Quarter pound lows - bulk savings',
    thc: '15-18%',
    vendor: 'Smoakland Budget',
    inStock: true,
    dailyDeal: false,
    rating: 4.4,
    reviews: 67
  },
  {
    id: '10',
    name: 'Lows Half Pound',
    category: 'flower',
    price: 250,
    originalPrice: 300,
    weight: '224g',
    tier: 'lows',
    image: 'https://images.unsplash.com/photo-1597848212624-e6ebcc0eff05?w=400&h=400&fit=crop',
    description: 'Half pound lows - wholesale pricing',
    thc: '15-18%',
    vendor: 'Smoakland Budget',
    inStock: true,
    dailyDeal: false,
    rating: 4.5,
    reviews: 45
  },
  {
    id: '11',
    name: 'Lows Full Pound',
    category: 'flower',
    price: 475,
    originalPrice: 500,
    weight: '448g',
    tier: 'lows',
    image: 'https://images.unsplash.com/photo-1597848212624-e6ebcc0eff05?w=400&h=400&fit=crop',
    description: 'Full pound lows - ultimate bulk deal',
    thc: '15-18%',
    vendor: 'Smoakland Budget',
    inStock: true,
    dailyDeal: true,
    rating: 4.6,
    reviews: 23
  }
];

// Daily deals mock data
export const mockDailyDeals = [
  {
    id: 'deal-1',
    productId: '3',
    discount: 33,
    validUntil: '2025-01-28T23:59:59Z',
    reason: 'Deps Flash Sale'
  },
  {
    id: 'deal-2',
    productId: '4',
    discount: 22,
    validUntil: '2025-01-28T23:59:59Z',
    reason: 'Half Ounce Special'
  },
  {
    id: 'deal-3',
    productId: '5',
    discount: 20,
    validUntil: '2025-01-28T23:59:59Z',
    reason: 'Full Ounce Deal'
  }
];

// User profile mock data
export const mockUserProfile = {
  id: 'user-123',
  username: 'nyctoker420',
  email: 'user@example.com',
  membershipTier: 'premium', // basic ($4.99) or premium ($7.99)
  memberSince: '2024-06-15',
  preferences: {
    categories: ['flower', 'edibles'],
    vendors: ['Brooklyn Botanicals', 'Queens Confections'],
    priceRange: [20, 80],
    deliveryArea: 'Manhattan'
  },
  orderHistory: [
    {
      id: 'order-001',
      date: '2025-01-20',
      total: 85,
      items: ['NYC Haze', 'Manhattan Melt'],
      status: 'delivered'
    }
  ],
  wictionaryAccess: true
};

// Weed dictionary (Wictionary) mock data
export const mockWictionary = [
  {
    id: 'term-1',
    term: 'Loud',
    definition: 'High-quality cannabis with a strong aroma and potent effects',
    category: 'slang',
    etymology: 'NYC street term popularized in the 2000s'
  },
  {
    id: 'term-2',
    term: 'Fire',
    definition: 'Exceptionally good quality cannabis',
    category: 'slang',
    etymology: 'Universal cannabis culture term'
  },
  {
    id: 'term-3',
    term: 'Terpenes',
    definition: 'Aromatic compounds that contribute to cannabis flavor and effects',
    category: 'science',
    etymology: 'Scientific terminology'
  }
];

// Inventory mock data for admin
export const mockInventory = [
  {
    id: 'inv-1',
    productId: '1',
    quantity: 150,
    lowStockThreshold: 20,
    lastRestocked: '2025-01-15',
    vendor: 'Brooklyn Botanicals'
  },
  {
    id: 'inv-2',
    productId: '2',
    quantity: 8,
    lowStockThreshold: 10,
    lastRestocked: '2025-01-10',
    vendor: 'Queens Confections'
  }
];

// NYC neighborhoods for delivery
export const nycNeighborhoods = [
  'Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island',
  'Harlem', 'SoHo', 'Tribeca', 'East Village', 'West Village',
  'Williamsburg', 'Park Slope', 'Long Island City', 'Astoria'
];