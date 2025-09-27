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
  },

  // EDIBLES Category
  {
    id: 'edible-1',
    name: 'Brooklyn Brownies',
    category: 'edibles',
    price: 25,
    originalPrice: 25,
    weight: '4 pieces',
    tier: 'za',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=400&fit=crop',
    description: 'Premium chocolate brownies - 10mg THC per piece',
    thc: '10mg per piece',
    vendor: 'Queens Confections',
    inStock: true,
    dailyDeal: false,
    rating: 4.7,
    reviews: 89
  },
  {
    id: 'edible-2',
    name: 'Manhattan Gummies',
    category: 'edibles',
    price: 18,
    originalPrice: 18,
    weight: '10 pieces',
    tier: 'deps',
    image: 'https://images.unsplash.com/photo-1582391788984-71526138baa8?w=400&h=400&fit=crop',
    description: 'Fruity gummy bears - 5mg THC per piece',
    thc: '5mg per piece',
    vendor: 'Bronx Treats',
    inStock: true,
    dailyDeal: false,
    rating: 4.4,
    reviews: 156
  },
  {
    id: 'edible-3',
    name: 'Budget Cookies',
    category: 'edibles',
    price: 12,
    originalPrice: 15,
    weight: '6 pieces',
    tier: 'lows',
    image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&h=400&fit=crop',
    description: 'Simple chocolate chip cookies - 5mg THC per piece',
    thc: '5mg per piece',
    vendor: 'Smoakland Budget',
    inStock: true,
    dailyDeal: true,
    rating: 4.0,
    reviews: 67
  },

  // VAPES Category
  {
    id: 'vape-1',
    name: 'Premium Vape Cartridge',
    category: 'vapes',
    price: 45,
    originalPrice: 45,
    weight: '1g',
    tier: 'za',
    image: 'https://images.unsplash.com/photo-1512409206653-0e5d0b1bc41b?w=400&h=400&fit=crop',
    description: 'Top-shelf live resin cartridge - Gelato strain',
    thc: '85% THC',
    vendor: 'Uptown Extracts',
    inStock: true,
    dailyDeal: false,
    rating: 4.8,
    reviews: 234
  },
  {
    id: 'vape-2',
    name: 'Standard Vape Pen',
    category: 'vapes',
    price: 30,
    originalPrice: 30,
    weight: '0.5g',
    tier: 'deps',
    image: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=400&h=400&fit=crop',
    description: 'Quality distillate pen - OG Kush flavor',
    thc: '78% THC',
    vendor: 'Brooklyn Vapes',
    inStock: true,
    dailyDeal: false,
    rating: 4.3,
    reviews: 145
  },
  {
    id: 'vape-3',
    name: 'Basic Vape Cart',
    category: 'vapes',
    price: 20,
    originalPrice: 25,
    weight: '0.5g',
    tier: 'lows',
    image: 'https://images.unsplash.com/photo-1570737174876-b1d5dc7b5de4?w=400&h=400&fit=crop',
    description: 'Entry-level cartridge - Sativa blend',
    thc: '70% THC',
    vendor: 'Smoakland Budget',
    inStock: true,
    dailyDeal: true,
    rating: 3.9,
    reviews: 98
  },

  // SUPPOSITORIES Category
  {
    id: 'supp-1',
    name: 'Releaf Suppository',
    category: 'suppositories',
    price: 35,
    originalPrice: 35,
    weight: '4 pieces',
    tier: 'za',
    image: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=400&fit=crop',
    description: 'Premium wellness suppository - 30mg THC each',
    thc: '30mg per piece',
    vendor: 'Wellness Solutions',
    inStock: true,
    dailyDeal: false,
    rating: 4.6,
    reviews: 45
  },
  {
    id: 'supp-2',
    name: 'Serenity Suppository',
    category: 'suppositories',
    price: 28,
    originalPrice: 28,
    weight: '4 pieces',
    tier: 'deps',
    image: 'https://images.unsplash.com/photo-1597848212624-e6ebcc0eff05?w=400&h=400&fit=crop',
    description: 'Balanced CBD:THC ratio for relaxation - 15mg each',
    thc: '15mg THC + 15mg CBD',
    vendor: 'Holistic Health',
    inStock: true,
    dailyDeal: false,
    rating: 4.4,
    reviews: 32
  },
  {
    id: 'supp-3',
    name: 'Calm Suppository',
    category: 'suppositories',
    price: 22,
    originalPrice: 25,
    weight: '4 pieces',
    tier: 'lows',
    image: 'https://images.unsplash.com/photo-1560450038-7d847b1fb393?w=400&h=400&fit=crop',
    description: 'Affordable wellness option - 10mg THC each',
    thc: '10mg per piece',
    vendor: 'Budget Wellness',
    inStock: true,
    dailyDeal: true,
    rating: 4.1,
    reviews: 28
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