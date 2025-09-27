// Mock data for StatusXSmoakland

// Products mock data with realistic Smoakland strains and pricing
export const mockProducts = [
  // ZA (Premium Tier) Products - Top shelf strains
  {
    id: '1',
    name: 'Platinum Cookies',
    category: 'flower',
    price: 25,
    originalPrice: 25,
    weight: '3.5g',
    tier: 'za',
    image: 'https://images.unsplash.com/photo-1536658979405-4223fdb31410?w=400&h=400&fit=crop',
    description: 'Premium ZA strain with sweet, earthy aroma and potent effects',
    thc: '28-32%',
    vendor: 'Smoakland Premium',
    inStock: true,
    dailyDeal: false,
    rating: 4.9,
    reviews: 89
  },
  {
    id: '2',
    name: 'Sunset Sherbet',
    category: 'flower',
    price: 55,
    originalPrice: 55,
    weight: '14g',
    tier: 'za',
    image: 'https://images.unsplash.com/photo-1605197788044-5a32c7078486?w=400&h=400&fit=crop',
    description: 'Exotic ZA half ounce - fruity and relaxing',
    thc: '25-30%',
    vendor: 'Smoakland Premium',
    inStock: true,
    dailyDeal: false,
    rating: 4.9,
    reviews: 156
  },
  {
    id: '12',
    name: 'Wedding Cake',
    category: 'flower',
    price: 100,
    originalPrice: 100,
    weight: '28g',
    tier: 'za',
    image: 'https://images.unsplash.com/photo-1560450038-7d847b1fb393?w=400&h=400&fit=crop',
    description: 'Top shelf Wedding Cake - sweet vanilla flavor profile',
    thc: '25-30%',
    vendor: 'Smoakland Premium',
    inStock: true,
    dailyDeal: false,
    rating: 4.9,
    reviews: 234
  },
  {
    id: '13',
    name: 'Gelato 41',
    category: 'flower',
    price: 300,
    originalPrice: 300,
    weight: '112g',
    tier: 'za',
    image: 'https://images.unsplash.com/photo-1576543090539-ee11e00b0ce6?w=400&h=400&fit=crop',
    description: 'Premium Gelato 41 quarter pound - dessert-like experience',
    thc: '25-30%',
    vendor: 'Smoakland Premium',
    inStock: true,
    dailyDeal: false,
    rating: 4.9,
    reviews: 78
  },
  {
    id: '14',
    name: 'White Runtz',
    category: 'flower',
    price: 600,
    originalPrice: 600,
    weight: '224g',
    tier: 'za',
    image: 'https://images.unsplash.com/photo-1615671524827-c1fe3973b648?w=400&h=400&fit=crop',
    description: 'Exotic White Runtz half pound - candy-like flavor',
    thc: '25-30%',
    vendor: 'Smoakland Premium',
    inStock: true,
    dailyDeal: false,
    rating: 4.9,
    reviews: 45
  },
  {
    id: '15',
    name: 'Purple Punch',
    category: 'flower',
    price: 875,
    originalPrice: 950,
    weight: '448g',
    tier: 'za',
    image: 'https://images.unsplash.com/photo-1576614166012-eca0b7d6b9e2?w=400&h=400&fit=crop',
    description: 'Premium Purple Punch pound - grape soda meets blueberry muffins',
    thc: '25-30%',
    vendor: 'Smoakland Premium',
    inStock: true,
    dailyDeal: true,
    rating: 4.9,
    reviews: 23
  },
  
  // DEPS (Mid-tier) Products - Quality strains
  {
    id: '3',
    name: 'Blue Dream',
    category: 'flower',
    price: 15,
    originalPrice: 15,
    weight: '3.5g',
    tier: 'deps',
    image: 'https://images.unsplash.com/photo-1585585635519-0ec0bb6bbabc?w=400&h=400&fit=crop',
    description: 'Classic Blue Dream - balanced hybrid perfect for any time',
    thc: '20-24%',
    vendor: 'Smoakland Standard',
    inStock: true,
    dailyDeal: false,
    rating: 4.5,
    reviews: 234
  },
  {
    id: '4',
    name: 'Girl Scout Cookies',
    category: 'flower',
    price: 100,
    originalPrice: 100,
    weight: '14g',
    tier: 'deps',
    image: 'https://images.unsplash.com/photo-1583814626346-57d3beaba72b?w=400&h=400&fit=crop',
    description: 'Popular GSC half ounce - sweet and earthy with uplifting effects',
    thc: '20-24%',
    vendor: 'Smoakland Standard',
    inStock: true,
    dailyDeal: false,
    rating: 4.4,
    reviews: 312
  },
  {
    id: '5',
    name: 'Sour Diesel',
    category: 'flower',
    price: 175,
    originalPrice: 175,
    weight: '28g',
    tier: 'deps',
    image: 'https://images.unsplash.com/photo-1576535490153-ea45b1b5e4ca?w=400&h=400&fit=crop',
    description: 'Energizing Sour Diesel ounce - diesel aroma with cerebral high',
    thc: '20-24%',
    vendor: 'Smoakland Standard',
    inStock: true,
    dailyDeal: false,
    rating: 4.6,
    reviews: 187
  },
  {
    id: '16',
    name: 'OG Kush',
    category: 'flower',
    price: 600,
    originalPrice: 600,
    weight: '112g',
    tier: 'deps',
    image: 'https://images.unsplash.com/photo-1566398171848-f7893fe69f83?w=400&h=400&fit=crop',
    description: 'Classic OG Kush quarter pound - pine and lemon notes',
    thc: '20-24%',
    vendor: 'Smoakland Standard',
    inStock: true,
    dailyDeal: false,
    rating: 4.5,
    reviews: 67
  },
  {
    id: '17',
    name: 'Green Crack',
    category: 'flower',
    price: 900,
    originalPrice: 900,
    weight: '224g',
    tier: 'deps',
    image: 'https://images.unsplash.com/photo-1574072158027-1e8fb2e10dab?w=400&h=400&fit=crop',
    description: 'Energetic Green Crack half pound - citrus and tropical flavors',
    thc: '20-24%',
    vendor: 'Smoakland Standard',
    inStock: true,
    dailyDeal: false,
    rating: 4.6,
    reviews: 45
  },
  {
    id: '18',
    name: 'Granddaddy Purple',
    category: 'flower',
    price: 1625,
    originalPrice: 1750,
    weight: '448g',
    tier: 'deps',
    image: 'https://images.unsplash.com/photo-1608064430071-aabfac0b5b54?w=400&h=400&fit=crop',
    description: 'Relaxing GDP pound - grape and berry flavors with full-body effects',
    thc: '20-24%',
    vendor: 'Smoakland Standard',
    inStock: true,
    dailyDeal: true,
    rating: 4.7,
    reviews: 23
  },
  
  // LOWS (Budget tier) Products - Value strains
  {
    id: '6',
    name: 'Northern Lights',
    category: 'flower',
    price: 10,
    originalPrice: 15,
    weight: '3.5g',
    tier: 'lows',
    image: 'https://images.unsplash.com/photo-1574072158026-9b26e8c7cf95?w=400&h=400&fit=crop',
    description: 'Classic Northern Lights - reliable indica for relaxation',
    thc: '16-18%',
    vendor: 'Smoakland Budget',
    inStock: true,
    dailyDeal: false,
    rating: 4.2,
    reviews: 145
  },
  {
    id: '7',
    name: 'White Widow',
    category: 'flower',
    price: 35,
    originalPrice: 45,
    weight: '14g',
    tier: 'lows',
    image: 'https://images.unsplash.com/photo-1570737174876-b1d5dc7b5de4?w=400&h=400&fit=crop',
    description: 'Popular White Widow half ounce - balanced hybrid with resinous buds',
    thc: '15-18%',
    vendor: 'Smoakland Budget',
    inStock: true,
    dailyDeal: false,
    rating: 4.1,
    reviews: 98
  },
  {
    id: '8',
    name: 'AK-47',
    category: 'flower',
    price: 60,
    originalPrice: 75,
    weight: '28g',
    tier: 'lows',
    image: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=400&h=400&fit=crop',
    description: 'Legendary AK-47 ounce - skunky aroma with uplifting effects',
    thc: '15-18%',
    vendor: 'Smoakland Budget',
    inStock: true,
    dailyDeal: false,
    rating: 4.3,
    reviews: 203
  },
  {
    id: '9',
    name: 'Bubba Kush',
    category: 'flower',
    price: 175,
    originalPrice: 200,
    weight: '112g',
    tier: 'lows',
    image: 'https://images.unsplash.com/photo-1516975381672-39bd9cbad5a0?w=400&h=400&fit=crop',
    description: 'Relaxing Bubba Kush quarter pound - sweet hashish flavors',
    thc: '15-18%',
    vendor: 'Smoakland Budget',
    inStock: true,
    dailyDeal: false,
    rating: 4.4,
    reviews: 67
  },
  {
    id: '10',
    name: 'Skywalker OG',
    category: 'flower',
    price: 250,
    originalPrice: 300,
    weight: '224g',
    tier: 'lows',
    image: 'https://images.unsplash.com/photo-1576535489495-2b6930f8c7d3?w=400&h=400&fit=crop',
    description: 'Potent Skywalker OG half pound - diesel and spice notes',
    thc: '15-18%',
    vendor: 'Smoakland Budget',
    inStock: true,
    dailyDeal: false,
    rating: 4.5,
    reviews: 45
  },
  {
    id: '11',
    name: 'Blueberry Kush',
    category: 'flower',
    price: 475,
    originalPrice: 500,
    weight: '448g',
    tier: 'lows',
    image: 'https://images.unsplash.com/photo-1571842602263-2ef7e6eeba9b?w=400&h=400&fit=crop',
    description: 'Sweet Blueberry Kush pound - fruity flavors with relaxing effects',
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

// User profile mock data - VERIFIED user example
export const mockUserProfile = {
  id: 'user-123',
  username: 'nyctoker420',
  email: 'user@example.com',
  full_name: 'Alex Rodriguez',
  membershipTier: 'premium', // basic ($4.99) or premium ($7.99)
  memberSince: '2024-06-15',
  preferences: {
    categories: ['flower', 'edibles'],
    vendors: ['Brooklyn Botanicals', 'Queens Confections'],
    priceRange: [20, 80]
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
  wictionaryAccess: true,
  is_verified: true, // MUST be true for transactions
  verification_status: 'approved',
  requires_medical: false,
  age_verified: 25
};

// Unverified user example (for testing verification flow)
export const mockUnverifiedUser = {
  id: 'user-456',
  username: 'newuser21',
  email: 'newuser@example.com',
  full_name: 'Jordan Smith',
  membershipTier: 'basic',
  memberSince: '2025-01-27',
  preferences: {
    categories: [],
    vendors: [],
    priceRange: [10, 100]
  },
  orderHistory: [],
  wictionaryAccess: false,
  is_verified: false, // NOT verified - cannot make transactions
  verification_status: 'pending', // pending, needs_medical, approved, rejected
  requires_medical: false,
  age_verified: 22
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