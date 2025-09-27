// Mock data for StatusXSmoakland
import { allProducts, inStockProducts, outOfStockProducts, getProductsByTier, getProductsByCategory } from './actual-inventory';

// Note: This file contains mock data for development
// The app should use real API data from the backend
export const mockProducts = allProducts;

// Export inventory helper functions
export { inStockProducts, outOfStockProducts, getProductsByTier, getProductsByCategory };

// Daily deals mock data
export const mockDailyDeals = [
  {
    id: 'deal-1',
    productId: 'lows-6', // Smalls
    discount: 20,
    validUntil: '2025-01-28T23:59:59Z',
    reason: 'Smalls Special Sale'
  },
  {
    id: 'deal-2',
    productId: 'special-razzberry-diesel',
    discount: 30,
    validUntil: '2025-01-28T23:59:59Z',
    reason: '3 for $25 Deal'
  },
  {
    id: 'deal-3',
    productId: 'edible-green-gummy',
    discount: 15,
    validUntil: '2025-01-28T23:59:59Z',
    reason: 'Edibles Flash Sale'
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
    vendors: ['Smoakland Premium', 'Paletas'],
    priceRange: [20, 80]
  },
  orderHistory: [
    {
      id: 'order-001',
      date: '2025-01-20',
      total: 85,
      items: ['Lemon Cherry Gelato', 'Paleta Alien 2g Blunt'],
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
  // Original terms
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
  },

  // Za (Premium) Tier Strains
  {
    id: 'strain-gary-payton',
    term: 'Gary Payton',
    definition: 'Hybrid (50% Indica / 50% Sativa). THC: 19-25%. Effects: Uplifted, focused, relaxed. Taste: Diesel, herbal, spicy. Helps with stress, anxiety, depression.',
    category: 'strain',
    etymology: 'Named after NBA Hall of Fame basketball player Gary Payton'
  },
  {
    id: 'strain-lemon-cherry-gelato',
    term: 'Lemon Cherry Gelato',
    definition: 'Indica-dominant Hybrid (60% Indica / 40% Sativa). THC: 21-28%. Effects: Euphoric, relaxed, blissful. Taste: Citrus, cherry, creamy. Helps with pain, mood swings, insomnia.',
    category: 'strain',
    etymology: 'Named for its distinctive lemon and cherry flavor profile'
  },
  {
    id: 'strain-lemon-cherry-push-pop',
    term: 'Lemon Cherry Push Pop',
    definition: 'Indica-dominant Hybrid (70% Indica / 30% Sativa). THC: 22-27%. Effects: Relaxed, cheerful, creative. Taste: Sweet, fruity, citrus. Helps with anxiety, stress, appetite loss.',
    category: 'strain',
    etymology: 'Named after the popular frozen treat for its sweet flavor'
  },
  {
    id: 'strain-playmaker',
    term: 'Playmaker',
    definition: 'Hybrid (50% Sativa / 50% Indica). THC: 20-26%. Effects: Energized, focused, happy. Taste: Earthy, citrus, spicy. Helps with fatigue, depression, stress.',
    category: 'strain',
    etymology: 'Sports reference reflecting its energizing effects'
  },
  {
    id: 'strain-super-runtz',
    term: 'Super Runtz',
    definition: 'Hybrid (60% Indica / 40% Sativa). THC: 21-27%. Effects: Mellow, cheerful, creative. Taste: Candy, sweet, tropical. Helps with anxiety, appetite loss, pain.',
    category: 'strain',
    etymology: 'Enhanced version of the popular Runtz strain'
  },

  // Deps (Mid-tier) Strains
  {
    id: 'strain-blu-cookies',
    term: 'Blu Cookies',
    definition: 'Hybrid (75% Indica / 25% Sativa). THC: 20-26%. Effects: Relaxed, happy, sedated. Taste: Sweet, vanilla, berry. Helps with anxiety, pain, insomnia.',
    category: 'strain',
    etymology: 'Variation of classic Girl Scout Cookies with blueberry genetics'
  },
  {
    id: 'strain-gelato-41',
    term: 'Gelato 41',
    definition: 'Sativa Dominant Hybrid (60% Sativa / 40% Indica). THC: 25-29%. Effects: Uplifted, euphoric, creative, focused, relaxed. Taste: Sweet, creamy, citrus, earthy, berry. Helps with depression, anxiety, fatigue.',
    category: 'strain',
    etymology: 'Specific phenotype (#41) of the famous Gelato strain'
  },
  {
    id: 'strain-jealousy',
    term: 'Jealousy',
    definition: 'Indica Dominant Hybrid (70% Indica / 30% Sativa). THC: 26-30%. Effects: Relaxed, euphoric, focused, uplifted, creative. Taste: Sweet, creamy, earthy, citrus, floral. Helps with stress, anxiety, depression.',
    category: 'strain',
    etymology: 'Named for its coveted status among cannabis connoisseurs'
  },
  {
    id: 'strain-obama-runtz',
    term: 'Obama Runtz',
    definition: 'Indica Dominant Hybrid (70% Indica / 30% Sativa). THC: 24-28%. Effects: Relaxed, euphoric, giggly, calm, sleepy. Taste: Sweet, fruity, berry, citrus, creamy. Helps with stress, anxiety, depression.',
    category: 'strain',
    etymology: 'Presidential tribute crossed with popular Runtz genetics'
  },

  // Lows (Budget) Strains
  {
    id: 'strain-animal-cookies',
    term: 'Animal Cookies',
    definition: 'Hybrid (75% Indica / 25% Sativa). THC: 18-27%. Effects: Relaxing, sleepy, euphoric. Taste: Nutty, sweet, vanilla. Helps with insomnia, chronic pain, depression, anxiety, stress.',
    category: 'strain',
    etymology: 'Cross between Animal Crackers and Girl Scout Cookies'
  },
  {
    id: 'strain-bubba-kush',
    term: 'Bubba Kush',
    definition: 'Indica (65% Indica / 35% Sativa). THC: 14-22%. Effects: Sleepy, calm, body high. Taste: Coffee, chocolate, earthy. Helps with stress, insomnia, pain, muscle spasms.',
    category: 'strain',
    etymology: 'Named after breeder "Bubba" who developed this classic indica'
  },
  {
    id: 'strain-northern-lights',
    term: 'Northern Lights',
    definition: 'Hybrid (50% Indica / 50% Sativa). THC: 16-22%. Effects: Relaxed, euphoric, dreamy. Taste: Earthy, sweet, pine. Helps with insomnia, chronic pain, depression, stress.',
    category: 'strain',
    etymology: 'Named after the Aurora Borealis phenomenon'
  },
  {
    id: 'strain-white-widow',
    term: 'White Widow',
    definition: 'Sativa Dominant Hybrid (60% Sativa / 40% Indica). THC: 22-26%. Effects: Uplifted, euphoric, energetic, creative, focused. Taste: Earthy, pungent, woody, spicy, herbal. Helps with depression, stress, fatigue.',
    category: 'strain',
    etymology: 'Named for its white, resinous appearance'
  },

  // Cannabis Terms & Slang
  {
    id: 'term-za',
    term: 'Za',
    definition: 'Premium, top-shelf cannabis. The loudest in the room with exceptional aroma, flavor, and effects. Small batch, high-quality product.',
    category: 'slang',
    etymology: 'Modern slang for "exotic" or premium cannabis'
  },
  {
    id: 'term-deps',
    term: 'Deps',
    definition: 'Mid-tier cannabis that matters. Noticeably more potent than Lows with smooth smoke and quality terp profiles. Everyday elevation for the seasoned sesher.',
    category: 'slang',
    etymology: 'Short for "dependable" or reliable mid-grade cannabis'
  },
  {
    id: 'term-lows',
    term: 'Lows',
    definition: 'Budget-friendly cannabis. Basic bud that still gets the job done. Smooth introduction for beginners with consistent effects.',
    category: 'slang',
    etymology: 'Reference to lower-priced, entry-level cannabis products'
  },
  {
    id: 'term-sesher',
    term: 'Sesher',
    definition: 'Someone who regularly participates in cannabis smoking sessions. An experienced cannabis consumer.',
    category: 'slang',
    etymology: 'Derived from "session" - a group smoking experience'
  },
  {
    id: 'term-mids',
    term: 'Mids',
    definition: 'Mid-grade cannabis. Not the highest quality but better than schwag. The middle tier of cannabis quality.',
    category: 'slang',
    etymology: 'Short for "middles" - middle-grade cannabis'
  },
  {
    id: 'term-terps',
    term: 'Terps',
    definition: 'Short for terpenes. The aromatic compounds in cannabis that contribute to flavor and effects profiles.',
    category: 'slang',
    etymology: 'Abbreviated form of terpenes'
  }
];

// Inventory mock data for admin
export const mockInventory = [
  {
    id: 'inv-1',
    productId: 'za-1',
    quantity: 150,
    lowStockThreshold: 20,
    lastRestocked: '2025-01-15',
    vendor: 'Smoakland Premium'
  },
  {
    id: 'inv-2',
    productId: 'deps-1',
    quantity: 8,
    lowStockThreshold: 10,
    lastRestocked: '2025-01-10',
    vendor: 'Smoakland Standard'
  }
];

// NYC neighborhoods for delivery (pickup only for now)
export const nycNeighborhoods = [
  'Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island',
  'Harlem', 'SoHo', 'Tribeca', 'East Village', 'West Village',
  'Williamsburg', 'Park Slope', 'Long Island City', 'Astoria'
];