// Mock data for StatusXSmoakland

// Products mock data
export const mockProducts = [
  {
    id: '1',
    name: 'NYC Haze',
    category: 'flower',
    price: 45,
    originalPrice: 60,
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
    description: 'Premium sativa strain perfect for the city that never sleeps',
    thc: '24%',
    vendor: 'Brooklyn Botanicals',
    inStock: true,
    dailyDeal: true,
    rating: 4.8,
    reviews: 156
  },
  {
    id: '2',
    name: 'Manhattan Melt',
    category: 'edibles',
    price: 35,
    originalPrice: 35,
    image: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=400&fit=crop',
    description: 'Smooth chocolate edibles with a sophisticated NYC twist',
    thc: '10mg per piece',
    vendor: 'Queens Confections',
    inStock: true,
    dailyDeal: false,
    rating: 4.6,
    reviews: 89
  },
  {
    id: '3',
    name: 'Bronx Blaze',
    category: 'concentrates',
    price: 55,
    originalPrice: 70,
    image: 'https://images.unsplash.com/photo-1597848212624-e6ebcc0eff05?w=400&h=400&fit=crop',
    description: 'High-quality concentrate for experienced users',
    thc: '85%',
    vendor: 'Uptown Extracts',
    inStock: true,
    dailyDeal: true,
    rating: 4.9,
    reviews: 234
  }
];

// Daily deals mock data
export const mockDailyDeals = [
  {
    id: 'deal-1',
    productId: '1',
    discount: 25,
    validUntil: '2025-01-28T23:59:59Z',
    reason: 'High inventory'
  },
  {
    id: 'deal-2',
    productId: '3',
    discount: 21,
    validUntil: '2025-01-28T23:59:59Z',
    reason: 'Bulk stock clearance'
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