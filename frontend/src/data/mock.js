// StatusXSmoakland Mock Data - COMPREHENSIVE VERSION WITH ALL STRAIN DEFINITIONS

import { getInventoryProducts } from './actual-inventory.js';

// Daily deals mock data 
export const mockDailyDeals = [
  {
    id: 'deal-1',
    productId: 'lows-1', // Northern Lights
    originalPrice: 12,
    dealPrice: 8,
    discount: 33,
    timeLeft: '2h 30m',
    description: 'Limited time offer on Northern Lights'
  },
  {
    id: 'deal-2',
    productId: 'deps-2', // Blue Cookies
    originalPrice: 18,
    dealPrice: 15,
    discount: 17,
    timeLeft: '5h 15m',
    description: 'Flash sale on Blue Cookies'
  },
  {
    id: 'deal-3',
    productId: 'za-1', // Gary Payton
    originalPrice: 30,
    dealPrice: 25,
    discount: 17,
    timeLeft: '1h 45m',
    description: 'Premium Gary Payton special'
  }
];

// COMPLETE COMPREHENSIVE Weed dictionary (Wictionary) with ALL strain definitions
export const mockWictionary = [
  // Cannabis Terms & Slang
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
    definition: 'Mid-tier cannabis that matters. Noticeably more potent than Lows with smooth smoke and quality terp profiles. Everyday elevation for the seasoned smoker.',
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
  },
  {
    id: 'term-couch-lock',
    term: 'Couch-lock',
    definition: 'A state of deep relaxation and sedation, often associated with Indica strains, where one feels unable or unwilling to move.',
    category: 'slang',
    etymology: 'Describes the physical sensation of being "locked" to the couch'
  },
  {
    id: 'term-body-high',
    term: 'Body High',
    definition: 'A sensation of physical relaxation and heaviness throughout the body, often characterized by warmth, heaviness, or tingling.',
    category: 'slang',
    etymology: 'Cannabis effect terminology'
  },
  {
    id: 'term-cerebral-buzz',
    term: 'Cerebral Buzz',
    definition: 'A mental or head-focused effect, often associated with Sativa strains.',
    category: 'slang',
    etymology: 'Cannabis effect terminology'
  },

  // ========== ZA TIER STRAINS (Premium) ==========
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
    id: 'strain-purpl-runtz',
    term: 'Purpl Runtz',
    definition: 'Indica-dominant Hybrid (80% Indica / 20% Sativa). THC: 19-26%. Effects: Sedated, happy, euphoric. Taste: Fruity, grape, candy. Helps with insomnia, pain, anxiety.',
    category: 'strain',
    etymology: 'Purple variation of the popular Runtz strain'
  },
  {
    id: 'strain-super-dop3',
    term: 'Super Dop3',
    definition: 'Hybrid (50% Indica / 50% Sativa). THC: 23-28%. Effects: Powerful, euphoric, relaxing. Taste: Fruity, herbal, earthy. Helps with stress, chronic pain, depression.',
    category: 'strain',
    etymology: 'Enhanced version indicating superior quality'
  },
  {
    id: 'strain-super-runtz-za',
    term: 'Super Runtz',
    definition: 'Hybrid (60% Indica / 40% Sativa). THC: 21-27%. Effects: Mellow, cheerful, creative. Taste: Candy, sweet, tropical. Helps with anxiety, appetite loss, pain.',
    category: 'strain',
    etymology: 'Enhanced version of the popular Runtz strain'
  },
  {
    id: 'strain-superman-og',
    term: 'Superman OG',
    definition: 'Indica-dominant Hybrid (75% Indica / 25% Sativa). THC: 20-26%. Effects: Heavy, calming, couch-lock. Taste: Diesel, pine, spicy. Helps with insomnia, stress, chronic pain.',
    category: 'strain',
    etymology: 'Superhero reference reflecting its powerful effects'
  },
  {
    id: 'strain-tunchi',
    term: 'Tunchi',
    definition: 'Hybrid (60% Sativa / 40% Indica). THC: 22-27%. Effects: Creative, social, uplifted. Taste: Fruity, sour, floral. Helps with fatigue, anxiety, stress.',
    category: 'strain',
    etymology: 'Unique strain name with creative effects profile'
  },

  // ========== DEPS TIER STRAINS (Mid-tier) ==========
  {
    id: 'strain-blu-berry-space-cake',
    term: 'Blu Berry Spac3 Cak3',
    definition: 'Indica-dominant Hybrid (70% Indica / 30% Sativa). THC: 18-24%. Effects: Relaxed, euphoric, sleepy. Taste: Berry, creamy, earthy. Helps with stress, insomnia, pain.',
    category: 'strain',
    etymology: 'Combination of blueberry and space cake genetics'
  },
  {
    id: 'strain-blu-blush',
    term: 'Blu Blush',
    definition: 'Sativa (100% Sativa). THC: 19-24%. Effects: Energetic, creative, uplifting. Taste: Berry, citrus, floral. Helps with fatigue, depression, low focus, social anxiety.',
    category: 'strain',
    etymology: 'Named for its blushing blue appearance'
  },
  {
    id: 'strain-blu-cookies',
    term: 'Blu Cookies',
    definition: 'Hybrid (75% Indica / 25% Sativa). THC: 20-26%. Effects: Relaxed, happy, sedated. Taste: Sweet, vanilla, berry. Helps with anxiety, pain, insomnia.',
    category: 'strain',
    etymology: 'Blueberry variation of classic Girl Scout Cookies'
  },
  {
    id: 'strain-blu-dreamz',
    term: 'Blu Dreamz',
    definition: 'Sativa-dominant Hybrid (70% Sativa / 30% Indica). THC: 18-24%. Effects: Uplifted, focused, mentally relaxed. Taste: Berry, sweet, herbal. Helps with stress, fatigue, depression, mild pain.',
    category: 'strain',
    etymology: 'Dreamy variation of Blue Dream genetics'
  },
  {
    id: 'strain-blu-slushies',
    term: 'Blu Slushies',
    definition: 'Balanced Hybrid (60% Indica / 40% Sativa). THC: 19-25%. Effects: Happy, euphoric, calm. Taste: Fruity, icy, berry. Helps with depression, stress, nausea.',
    category: 'strain',
    etymology: 'Named for its icy, slush-like flavor profile'
  },
  {
    id: 'strain-blu-zushi',
    term: 'Blu Zushi',
    definition: 'Hybrid (60% Indica / 40% Sativa). THC: 21-27%. Effects: Relaxed, euphoric, balanced. Taste: Fruity, earthy, diesel. Helps with pain, insomnia, anxiety.',
    category: 'strain',
    etymology: 'Blue variation of Zkittlez and Kush genetics'
  },
  {
    id: 'strain-bronx-glue',
    term: 'Bronx Glue',
    definition: 'Hybrid (60% Indica / 40% Sativa). THC: 20-25%. Effects: Heavy, stony, couch-lock. Taste: Diesel, earthy, pungent. Helps with chronic pain, stress, insomnia.',
    category: 'strain',
    etymology: 'NYC-inspired version of Gorilla Glue'
  },
  {
    id: 'strain-candy-kush',
    term: 'Candy Kush',
    definition: 'Indica-dominant Hybrid (70% Indica / 30% Sativa). THC: 14-19%. Effects: Relaxed, sleepy, euphoric. Taste: Sweet, floral, sugary. Helps with anxiety, insomnia, pain.',
    category: 'strain',
    etymology: 'Sweet candy-flavored Kush variety'
  },
  {
    id: 'strain-candy-land',
    term: 'Candy Land',
    definition: 'Sativa-dominant Hybrid (75% Sativa / 25% Indica). THC: 18-24%. Effects: Energetic, social, creative. Taste: Sweet, earthy, berry. Helps with fatigue, depression, stress.',
    category: 'strain',
    etymology: 'Named after the popular board game'
  },
  {
    id: 'strain-chucky-runtz',
    term: 'Chucky Runtz',
    definition: 'Hybrid (60% Indica / 40% Sativa). THC: 21-27%. Effects: Relaxed, cheerful, dreamy. Taste: Fruity, candy, earthy. Helps with stress, anxiety, chronic pain.',
    category: 'strain',
    etymology: 'Horror movie reference with Runtz genetics'
  },
  {
    id: 'strain-crostata',
    term: 'Crostata',
    definition: 'Indica-dominant Hybrid. THC: 18-24%. Effects: Relaxing, euphoric, comforting. Taste: Pastry, fruit, vanilla. Helps with stress, mood swings, insomnia.',
    category: 'strain',
    etymology: 'Named after the Italian dessert tart'
  },
  {
    id: 'strain-e85',
    term: 'E-85',
    definition: 'Balanced Hybrid (50% Sativa / 50% Indica). THC: 26-30%. Effects: Euphoric, relaxed, tingly, uplifted. Taste: Sweet, fruity, citrus, creamy vanilla, diesel. Helps with anxiety, stress, depression, chronic pain, muscle spasms.',
    category: 'strain',
    etymology: 'Named after high-octane fuel blend'
  },
  {
    id: 'strain-elf-cookies',
    term: 'Elf Cookies',
    definition: 'Balanced Hybrid (50% Sativa / 50% Indica). THC: 24-28%. Effects: Relaxed, euphoric, creative, happy, uplifted. Taste: Sweet, earthy, vanilla, mint, nutty. Helps with stress, anxiety, depression, chronic pain, insomnia.',
    category: 'strain',
    etymology: 'Holiday-themed cookie strain variation'
  },
  {
    id: 'strain-flushing-mintz',
    term: 'Flushing Mintz',
    definition: 'Hybrid (50% Indica / 50% Sativa). THC: 22-28%. Effects: Relaxed, euphoric, focused. Taste: Minty, earthy, herbal. Helps with stress, fatigue, depression, inflammation.',
    category: 'strain',
    etymology: 'NYC Flushing, Queens reference with mint genetics'
  },
  {
    id: 'strain-fruit-punch',
    term: 'Fruit Punch',
    definition: 'Sativa-dominant Hybrid (70% Sativa / 30% Indica). THC: 18-23%. Effects: Energetic, creative, happy. Taste: Sweet, fruity, tropical. Helps with fatigue, stress, mood swings.',
    category: 'strain',
    etymology: 'Named for its fruity punch flavor'
  },
  {
    id: 'strain-gas-mintz',
    term: 'Gas Mintz',
    definition: 'Indica-dominant Hybrid (75% Indica / 25% Sativa). THC: 22-27%. Effects: Relaxed, calm, heavy. Taste: Gas, mint, earthy. Helps with pain, insomnia, anxiety.',
    category: 'strain',
    etymology: 'Combination of gassy and minty flavor profiles'
  },
  {
    id: 'strain-gelato-41',
    term: 'Gelato 41',
    definition: 'Sativa Dominant Hybrid (60% Sativa / 40% Indica). THC: 25-29%. Effects: Uplifted, euphoric, creative, focused, relaxed. Taste: Sweet, creamy, citrus, earthy, berry. Helps with depression, anxiety, fatigue, mood swings, chronic stress.',
    category: 'strain',
    etymology: 'Specific phenotype (#41) of the famous Gelato strain'
  },
  {
    id: 'strain-gelato-kush',
    term: 'Gelato Kush',
    definition: 'Indica-dominant Hybrid (60% Indica / 40% Sativa). THC: 18-24%. Effects: Calm, relaxed, sleepy. Taste: Creamy, earthy, herbal. Helps with insomnia, stress, anxiety.',
    category: 'strain',
    etymology: 'Cross between Gelato and Kush genetics'
  },
  {
    id: 'strain-girlscout-cookies',
    term: 'Girlscout Cookies',
    definition: 'Hybrid (60% Indica / 40% Sativa). THC: 17-28%. Effects: Happy, relaxed, euphoric. Taste: Sweet, earthy, mint. Helps with chronic pain, appetite loss, stress.',
    category: 'strain',
    etymology: 'Famous strain named after the cookie brand'
  },
  {
    id: 'strain-gorilla-glu4',
    term: 'Gorilla Glu 4',
    definition: 'Hybrid (60% Indica / 40% Sativa). THC: 20-28%. Effects: Heavy, relaxed, sleepy. Taste: Earthy, pine, sour. Helps with insomnia, stress, pain.',
    category: 'strain',
    etymology: 'Fourth phenotype of Gorilla Glue strain'
  },
  {
    id: 'strain-gorilla-glu3',
    term: 'Gorilla Glu3',
    definition: 'Indica-dominant Hybrid (65% Indica / 35% Sativa). THC: 22-27%. Effects: Sedated, euphoric, couch-lock. Taste: Diesel, pine, chocolate. Helps with pain, insomnia, anxiety.',
    category: 'strain',
    etymology: 'Third phenotype of Gorilla Glue strain'
  },
  {
    id: 'strain-grand-daddy-purp',
    term: 'Grand Daddy Purp',
    definition: 'Indica (100%). THC: 17-23%. Effects: Sleepy, relaxed, euphoric. Taste: Grape, berry, sweet. Helps with insomnia, muscle spasms, appetite loss.',
    category: 'strain',
    etymology: 'Classic purple indica strain'
  },
  {
    id: 'strain-grape-cake',
    term: 'Grap3 Cak3',
    definition: 'Indica-dominant Hybrid (80% Indica / 20% Sativa). THC: 20-25%. Effects: Relaxed, happy, mellow. Taste: Grape, vanilla, earthy. Helps with stress, insomnia, mood swings.',
    category: 'strain',
    etymology: 'Grape-flavored cake strain variation'
  },
  {
    id: 'strain-grapes-n-cream',
    term: 'Grapes N Cream',
    definition: 'Balanced Hybrid (50% Sativa / 50% Indica). THC: 24-28%. Effects: Euphoric, relaxed, creative, happy, soothing. Taste: Grape, creamy, sweet, berry, earthy. Helps with anxiety, stress, depression, mood swings, mild pain.',
    category: 'strain',
    etymology: 'Combination of grape and cream flavors'
  },
  {
    id: 'strain-grape-soda',
    term: 'Grape Soda',
    definition: 'Balanced Hybrid (50% Sativa / 50% Indica). THC: 22-26%. Effects: Relaxed, uplifted, euphoric, happy, calm. Taste: Grape, sweet, berry, citrus, floral. Helps with stress, anxiety, depression, chronic pain, fatigue.',
    category: 'strain',
    etymology: 'Named for its grape soda flavor profile'
  },
  {
    id: 'strain-gush-mintz',
    term: 'Gush Mintz',
    definition: 'Indica-dominant Hybrid (80% Indica / 20% Sativa). THC: 20-26%. Effects: Calming, euphoric, sedative. Taste: Mint, gassy, earthy. Helps with stress, depression, insomnia.',
    category: 'strain',
    etymology: 'Gushy minty flavor combination'
  },
  {
    id: 'strain-ice-cream-man',
    term: 'Ic3 Cream Man',
    definition: 'Hybrid (60% Indica / 40% Sativa). THC: 18-23%. Effects: Uplifted, relaxed, creative. Taste: Vanilla, sweet, fruity. Helps with fatigue, mood swings, stress.',
    category: 'strain',
    etymology: 'Named after the ice cream vendor'
  },
  {
    id: 'strain-jealousy',
    term: 'Jealousy',
    definition: 'Indica Dominant Hybrid (70% Indica / 30% Sativa). THC: 26-30%. Effects: Relaxed, euphoric, focused, uplifted, creative. Taste: Sweet, creamy, earthy, citrus, floral. Helps with stress, anxiety, depression, chronic pain, insomnia.',
    category: 'strain',
    etymology: 'Named for its coveted status among cannabis connoisseurs'
  },
  {
    id: 'strain-jingle-town-grape',
    term: 'Jingle Town Grap3',
    definition: '100% Indica. THC: 24-27%. Effects: Sedative, relaxed, sleepy, body high, calming. Taste: Grape, sweet, earthy, berry, herbal. Helps with insomnia, chronic pain, anxiety, muscle spasms, stress.',
    category: 'strain',
    etymology: 'Oakland Jingletown district reference'
  },
  {
    id: 'strain-la-pop-rockz',
    term: 'LA Pop Rockz',
    definition: 'Indica Dominant Hybrid (70% Indica / 30% Sativa). THC: 25-29%. Effects: Relaxed, euphoric, sleepy, calm, uplifted. Taste: Sweet, fruity, candy, berry, creamy. Helps with insomnia, stress, anxiety, chronic pain, appetite loss.',
    category: 'strain',
    etymology: 'LA reference with Pop Rocks candy flavor'
  },
  {
    id: 'strain-larry-bird',
    term: 'Larry Bird',
    definition: 'Balanced Hybrid (50% Sativa / 50% Indica). THC: 24-28%. Effects: Euphoric, relaxed, creative, uplifted, focused. Taste: Sweet, berry, citrus, earthy, grape. Helps with stress, anxiety, depression, chronic pain, fatigue.',
    category: 'strain',
    etymology: 'Named after NBA legend Larry Bird'
  },
  {
    id: 'strain-luv-triangle',
    term: 'Luv Triangle',
    definition: 'Hybrid (60% Indica / 40% Sativa). THC: 19-24%. Effects: Relaxed, euphoric, aroused. Taste: Berry, earthy, floral. Helps with anxiety, stress, chronic pain.',
    category: 'strain',
    etymology: 'Love-themed strain with balanced effects'
  },
  {
    id: 'strain-manhattan-cookies',
    term: 'Manhattan Cookies',
    definition: 'Hybrid (60% Sativa / 40% Indica). THC: 20-26%. Effects: Uplifted, creative, focused. Taste: Sweet, citrus, herbal. Helps with fatigue, stress, depression.',
    category: 'strain',
    etymology: 'NYC Manhattan reference with cookie genetics'
  },
  {
    id: 'strain-maui-waui',
    term: 'Maui Waui',
    definition: 'Sativa (100%). THC: 17-23%. Effects: Energetic, happy, euphoric. Taste: Pineapple, tropical, citrus. Helps with fatigue, depression, anxiety.',
    category: 'strain',
    etymology: 'Classic Hawaiian strain from Maui'
  },
  {
    id: 'strain-mochi',
    term: 'Mochi',
    definition: 'Indica-dominant Hybrid (70% Indica / 30% Sativa). THC: 20-25%. Effects: Relaxed, creative, sleepy. Taste: Sweet, minty, creamy. Helps with stress, insomnia, chronic pain.',
    category: 'strain',
    etymology: 'Named after the Japanese rice cake'
  },
  {
    id: 'strain-obama-grape',
    term: 'Obama Grape',
    definition: 'Indica Dominant Hybrid (80% Indica / 20% Sativa). THC: 22-26%. Effects: Relaxed, euphoric, uplifted, calm, sleepy. Taste: Grape, berry, earthy, sweet, herbal. Helps with stress, anxiety, depression, insomnia, chronic pain.',
    category: 'strain',
    etymology: 'Presidential tribute with grape genetics'
  },
  {
    id: 'strain-obama-kush',
    term: 'Obama Kush',
    definition: 'Indica (100%). THC: 16-21%. Effects: Chill, relaxed, focused. Taste: Woody, herbal, pine. Helps with stress, mood swings, inflammation.',
    category: 'strain',
    etymology: 'Presidential tribute Kush strain'
  },
  {
    id: 'strain-obama-runtz',
    term: 'Obama Runtz',
    definition: 'Indica Dominant Hybrid (70% Indica / 30% Sativa). THC: 24-28%. Effects: Relaxed, euphoric, giggly, calm, sleepy. Taste: Sweet, fruity, berry, citrus, creamy. Helps with stress, anxiety, depression, insomnia, mood swings.',
    category: 'strain',
    etymology: 'Presidential tribute crossed with popular Runtz genetics'
  },
  {
    id: 'strain-og-glu3',
    term: 'OG Glu3',
    definition: 'Sativa Dominant Hybrid (60% Sativa / 40% Indica). THC: 25-30%. Effects: Uplifted, focused, euphoric, energetic, creative. Taste: Earthy, pine, diesel, herbal, citrus. Helps with stress, fatigue, depression, ADHD, chronic pain.',
    category: 'strain',
    etymology: 'OG Kush crossed with Gorilla Glue genetics'
  },
  {
    id: 'strain-og-kush',
    term: 'OG Kush',
    definition: 'Hybrid (55% Indica / 45% Sativa). THC: 19-26%. Effects: Relaxed, happy, hungry. Taste: Earthy, pine, woody. Helps with stress, migraines, depression.',
    category: 'strain',
    etymology: 'Original Gangster Kush, West Coast classic'
  },
  {
    id: 'strain-orange-cake-kush',
    term: 'Orang3 Cak3 Kush',
    definition: 'Sativa Dominant Hybrid (60% Sativa / 40% Indica). THC: 24-28%. Effects: Uplifted, creative, euphoric, focused, energized. Taste: Orange, citrus, vanilla, sweet, earthy. Helps with depression, fatigue, stress, mood swings, headaches.',
    category: 'strain',
    etymology: 'Orange cake flavor with Kush genetics'
  },
  {
    id: 'strain-oreo-cookies',
    term: 'Oreo Cookies',
    definition: 'Indica-dominant Hybrid (70% Indica / 30% Sativa). THC: 22-28%. Effects: Sedated, euphoric, hungry. Taste: Creamy, chocolate, sweet. Helps with insomnia, pain, stress.',
    category: 'strain',
    etymology: 'Named after the popular cookie brand'
  },
  {
    id: 'strain-purple-candy',
    term: 'Purpl3 Candy',
    definition: 'Indica-dominant Hybrid (75% Indica / 25% Sativa). THC: 17-23%. Effects: Relaxed, mellow, giggly. Taste: Sweet, fruity, berry. Helps with stress, anxiety, insomnia.',
    category: 'strain',
    etymology: 'Purple-colored sweet candy strain'
  },
  {
    id: 'strain-purple-kush',
    term: 'Purpl3 Kush',
    definition: 'Indica (100%). THC: 17-27%. Effects: Sleepy, relaxed, euphoric. Taste: Grape, earthy, spicy. Helps with insomnia, pain, muscle spasms.',
    category: 'strain',
    etymology: 'Classic purple indica Kush variety'
  },
  {
    id: 'strain-purple-monster-cookies',
    term: 'Purpl3 Monster Cookies',
    definition: 'Indica-dominant Hybrid (80% Indica / 20% Sativa). THC: 21-26%. Effects: Sedated, relaxed, blissful. Taste: Sweet, grape, vanilla. Helps with pain, insomnia, anxiety.',
    category: 'strain',
    etymology: 'Purple monster-sized cookie strain'
  },
  {
    id: 'strain-purple-panty-dropper',
    term: 'Purpl3 Panty Dropper',
    definition: 'Indica-dominant Hybrid (70% Indica / 30% Sativa). THC: 18-24%. Effects: Aroused, relaxed, euphoric. Taste: Berry, grape, sweet. Helps with stress, insomnia, lack of appetite, pain.',
    category: 'strain',
    etymology: 'Provocative name for its alluring effects'
  },
  {
    id: 'strain-purple-punch',
    term: 'Purpl3 Punch',
    definition: 'Indica-dominant Hybrid (80% Indica / 20% Sativa). THC: 18-24%. Effects: Calming, euphoric, sleepy. Taste: Grape, berry, candy. Helps with insomnia, chronic pain, anxiety.',
    category: 'strain',
    etymology: 'Purple-colored punch flavor strain'
  },
  {
    id: 'strain-queens-kush',
    term: 'Queens Kush',
    definition: '100% Indica. THC: 23-27%. Effects: Sedative, relaxed, sleepy, body high, tranquil. Taste: Earthy, kush, spicy, herbal, gassy. Helps with insomnia, chronic pain, stress, anxiety, muscle spasms.',
    category: 'strain',
    etymology: 'NYC Queens borough reference Kush strain'
  },
  {
    id: 'strain-san-fernando-valley-og',
    term: 'San Fernando Valley OG',
    definition: 'Sativa Dominant Hybrid (70% Sativa / 30% Indica). THC: 24-29%. Effects: Uplifted, euphoric, creative, focused, relaxed. Taste: Lemon, pine, earthy, diesel, herbal. Helps with stress, depression, chronic pain, fatigue, headaches.',
    category: 'strain',
    etymology: 'California San Fernando Valley OG Kush'
  },
  {
    id: 'strain-slushies',
    term: 'Slushies',
    definition: 'Balanced Hybrid (50% Sativa / 50% Indica). THC: 23-27%. Effects: Euphoric, relaxed, happy, uplifted, creative. Taste: Fruity, sweet, berry, citrus, candy. Helps with stress, anxiety, depression, chronic pain, fatigue.',
    category: 'strain',
    etymology: 'Named for its frozen drink flavor profile'
  },
  {
    id: 'strain-sour-diesel',
    term: 'Sour Diesel',
    definition: '100% Sativa. THC: 25-30%. Effects: Energized, uplifted, euphoric, focused, creative. Taste: Diesel, citrus, pungent, earthy, herbal. Helps with depression, fatigue, stress, ADHD, mood disorders.',
    category: 'strain',
    etymology: 'Classic East Coast sativa with diesel aroma'
  },
  {
    id: 'strain-spiderman-runtz',
    term: 'Spiderman Runtz',
    definition: 'Indica Dominant Hybrid (70% Indica / 30% Sativa). THC: 25-29%. Effects: Relaxed, euphoric, sleepy, giggly, calm. Taste: Sweet, berry, tropical, creamy, earthy. Helps with stress, anxiety, insomnia, depression, chronic pain.',
    category: 'strain',
    etymology: 'Superhero-themed Runtz variation'
  },
  {
    id: 'strain-super-runtz-deps',
    term: 'Super Runtz',
    definition: 'Indica Dominant Hybrid (70% Indica / 30% Sativa). THC: 26-30%. Effects: Relaxed, euphoric, calm, happy, sedative. Taste: Fruity, sweet, candy, berry, earthy. Helps with anxiety, stress, insomnia, chronic pain, depression.',
    category: 'strain',
    etymology: 'Enhanced super version of Runtz strain'
  },
  {
    id: 'strain-super-sour-diesel',
    term: 'Super Sour Diesel',
    definition: 'Sativa Dominant Hybrid (90% Sativa / 10% Indica). THC: 25-29%. Effects: Energized, euphoric, uplifted, creative, focused. Taste: Diesel, pungent, citrus, earthy, skunky. Helps with depression, fatigue, stress, mood disorders, ADHD.',
    category: 'strain',
    etymology: 'Enhanced version of classic Sour Diesel'
  },
  {
    id: 'strain-tropical-skittlez',
    term: 'Tropical Skittlez',
    definition: 'Indica Dominant Hybrid (70% Indica / 30% Sativa). THC: 24-28%. Effects: Relaxed, euphoric, happy, sleepy, uplifted. Taste: Tropical, fruity, sweet, berry, citrus. Helps with stress, anxiety, insomnia, depression, chronic pain.',
    category: 'strain',
    etymology: 'Tropical flavor variation of Skittles strain'
  },
  {
    id: 'strain-violet-fog',
    term: 'Violet Fog',
    definition: 'Indica Dominant Hybrid (80% Indica / 20% Sativa). THC: 25-29%. Effects: Relaxed, sedative, euphoric, calm, sleepy. Taste: Floral, grape, earthy, sweet, herbal. Helps with insomnia, stress, chronic pain, anxiety, muscle spasms.',
    category: 'strain',
    etymology: 'Named for its violet-colored foggy effects'
  },
  {
    id: 'strain-watermelon-cookies',
    term: 'Watermelon Cookies',
    definition: 'Indica-dominant Hybrid (80% Indica / 20% Sativa). THC: 18-26%. Effects: Relaxed, happy, sedated. Taste: Watermelon, sweet, earthy. Helps with anxiety, insomnia, pain, appetite loss.',
    category: 'strain',
    etymology: 'Watermelon-flavored cookie genetics'
  },
  {
    id: 'strain-white-runtz',
    term: 'White Runtz',
    definition: 'Sativa Dominant Hybrid (60% Sativa / 40% Indica). THC: 24-29%. Effects: Euphoric, uplifted, creative, focused, relaxed. Taste: Sweet, fruity, candy, creamy, citrus. Helps with stress, depression, fatigue, anxiety, mood swings.',
    category: 'strain',
    etymology: 'White variation of popular Runtz strain'
  },
  {
    id: 'strain-white-widow',
    term: 'White Widow',
    definition: 'Sativa Dominant Hybrid (60% Sativa / 40% Indica). THC: 22-26%. Effects: Uplifted, euphoric, energetic, creative, focused. Taste: Earthy, pungent, woody, spicy, herbal. Helps with depression, stress, fatigue, chronic pain, PTSD.',
    category: 'strain',
    etymology: 'Classic strain named for its white, resinous appearance'
  },
  {
    id: 'strain-zaza-runtz',
    term: 'Zaza Runtz',
    definition: 'Hybrid (60% Indica / 40% Sativa). THC: 22-29%. Effects: Relaxed, euphoric, sedative. Taste: Fruity, candy, earthy. Helps with insomnia, anxiety, pain, stress.',
    category: 'strain',
    etymology: 'Exotic "ZaZa" quality Runtz variation'
  },
  {
    id: 'strain-ze-chem',
    term: 'Ze Chem',
    definition: '100% Sativa. THC: 26-30%. Effects: Energized, focused, euphoric, uplifted, creative. Taste: Diesel, citrus, herbal, spicy, earthy. Helps with fatigue, depression, stress, ADHD, mood swings.',
    category: 'strain',
    etymology: 'Chemical/diesel flavor sativa strain'
  },

  // ========== LOWS TIER STRAINS (Budget) ==========
  {
    id: 'strain-animal-cookies',
    term: 'Animal Cookies',
    definition: 'Hybrid (75% Indica / 25% Sativa). THC: 18-27%. Effects: Relaxing, sleepy, euphoric. Taste: Nutty, sweet, vanilla. Helps with insomnia, chronic pain, depression, anxiety, stress.',
    category: 'strain',
    etymology: 'Cross between Animal Crackers and Girl Scout Cookies'
  },
  {
    id: 'strain-animal-mintz',
    term: 'Animal Mintz',
    definition: 'Hybrid (70% Indica / 30% Sativa). THC: 20-28%. Effects: Relaxing, giggly, hungry. Taste: Mint, cookie, earthy. Helps with appetite loss, anxiety, chronic stress, depression.',
    category: 'strain',
    etymology: 'Animal genetics crossed with minty flavor'
  },
  {
    id: 'strain-blackberry-kush',
    term: 'Blackberry Kush',
    definition: 'Indica (80% Indica / 20% Sativa). THC: 16-20%. Effects: Relaxing, sleepy, euphoric. Taste: Berry, earthy, sweet. Helps with insomnia, pain, stress, depression, anxiety.',
    category: 'strain',
    etymology: 'Blackberry-flavored Kush variety'
  },
  {
    id: 'strain-black-runtz',
    term: 'Black Runtz',
    definition: 'Hybrid (50% Indica / 50% Sativa). THC: 20-29%. Effects: Euphoric, relaxing, long-lasting buzz. Taste: Sweet, fruity, earthy. Helps with stress, anxiety, chronic pain, depression.',
    category: 'strain',
    etymology: 'Dark-colored Runtz variation'
  },
  {
    id: 'strain-blu-haz3',
    term: 'Blu Haz3',
    definition: 'Sativa (80% Sativa / 20% Indica). THC: 18-24%. Effects: Uplifting, energetic, focused. Taste: Sweet, blueberry, herbal. Helps with fatigue, stress, depression, ADHD.',
    category: 'strain',
    etymology: 'Blue Haze variation with energy effects'
  },
  {
    id: 'strain-blu-skittlez',
    term: 'Blu Skittlez',
    definition: 'Hybrid (60% Indica / 40% Sativa). THC: 19-23%. Effects: Relaxing, happy, euphoric. Taste: Berry, fruity, candy. Helps with anxiety, depression, chronic pain, mood swings.',
    category: 'strain',
    etymology: 'Blue Skittles candy-flavored strain'
  },
  {
    id: 'strain-boogie-nights',
    term: 'Boogi3 Nights',
    definition: 'Hybrid (50% Indica / 50% Sativa). THC: 18-24%. Effects: Uplifting, relaxed, creative. Taste: Grape, berry, floral. Helps with fatigue, mood swings, mild pain, anxiety.',
    category: 'strain',
    etymology: 'Disco-era themed strain name'
  },
  {
    id: 'strain-brooklyn-kush',
    term: 'Brooklyn Kush',
    definition: 'Indica (80% Indica / 20% Sativa). THC: 21-27%. Effects: Heavy, sedative, mellow. Taste: Diesel, earthy, pine. Helps with insomnia, pain, stress, muscle tension.',
    category: 'strain',
    etymology: 'NYC Brooklyn borough Kush variety'
  },
  {
    id: 'strain-bubba-kush',
    term: 'Bubba Kush',
    definition: 'Indica (65% Indica / 35% Sativa). THC: 14-22%. Effects: Sleepy, calm, body high. Taste: Coffee, chocolate, earthy. Helps with stress, insomnia, pain, muscle spasms.',
    category: 'strain',
    etymology: 'Named after breeder "Bubba" who developed this classic indica'
  },
  {
    id: 'strain-bubba',
    term: 'BUBBA',
    definition: 'Indica (85% Indica / 15% Sativa). THC: 14-22%. Effects: Sleepy, calm, body high. Taste: Coffee, chocolate, earthy. Helps with stress, insomnia, pain, muscle spasms.',
    category: 'strain',
    etymology: 'Short name for Bubba Kush strain'
  },
  {
    id: 'strain-business-town',
    term: 'Business Town',
    definition: 'Hybrid (60% Indica / 40% Sativa). THC: 22-27%. Effects: Focused, uplifting, mildly sedative. Taste: Earthy, pine, citrus zest. Helps with stress, fatigue, anxiety, mood imbalance.',
    category: 'strain',
    etymology: 'Business-focused productivity strain'
  },
  {
    id: 'strain-cali-gas',
    term: 'Cali Gas',
    definition: 'Indica (70% Indica / 30% Sativa). THC: 20-26%. Effects: Relaxed, happy, hungry. Taste: Diesel, skunky, earthy. Helps with appetite loss, chronic pain, depression.',
    category: 'strain',
    etymology: 'California gassy diesel strain'
  },
  {
    id: 'strain-chem-dawg',
    term: 'Ch3m Dawg',
    definition: 'Hybrid (55% Sativa / 45% Indica). THC: 19-25%. Effects: Euphoric, relaxed, happy. Taste: Diesel, pine, spicy. Helps with stress, pain, depression, anxiety.',
    category: 'strain',
    etymology: 'Chemical diesel genetics strain'
  },
  {
    id: 'strain-cherry-runtz',
    term: 'Ch3rry Runtz',
    definition: 'Hybrid (50% Sativa / 50% Indica). THC: 22-28%. Effects: Relaxed, creative, euphoric. Taste: Cherry, candy, fruity. Helps with depression, mood swings, chronic stress.',
    category: 'strain',
    etymology: 'Cherry-flavored Runtz variation'
  },
  {
    id: 'strain-chocolate-truffle',
    term: 'Chocolat3 truffl3',
    definition: 'Indica (70% Indica / 30% Sativa). THC: 20-27%. Effects: Sleepy, calm, tingly. Taste: Chocolate, nutty, earthy. Helps with insomnia, chronic pain, stress.',
    category: 'strain',
    etymology: 'Chocolate truffle dessert-flavored strain'
  },
  {
    id: 'strain-crashout',
    term: 'Crashout',
    definition: 'Indica (90% Indica / 10% Sativa). THC: 23-29%. Effects: Sedative, heavy, relaxing. Taste: Herbal, fuel, earthy. Helps with insomnia, anxiety, pain.',
    category: 'strain',
    etymology: 'Named for its crash-inducing sedative effects'
  },
  {
    id: 'strain-dosi-doh',
    term: 'Dosi Doh',
    definition: 'Indica (70% Indica / 30% Sativa). THC: 18-28%. Effects: Relaxing, euphoric, sleepy. Taste: Sweet, mint, nutty. Helps with anxiety, stress, chronic pain.',
    category: 'strain',
    etymology: 'Dosidos variation with dough-like effects'
  },
  {
    id: 'strain-durban-poison',
    term: 'Durban Poison',
    definition: 'Sativa (100% Sativa). THC: 15-25%. Effects: Energizing, uplifting, focused. Taste: Sweet, pine, citrus. Helps with fatigue, depression, ADHD.',
    category: 'strain',
    etymology: 'South African Durban region landrace sativa'
  },
  {
    id: 'strain-exotic-rays',
    term: 'Exotic Rays',
    definition: 'Sativa (70% Sativa / 30% Indica). THC: 22-26%. Effects: Creative, uplifting, relaxed. Taste: Tropical, citrus, floral. Helps with depression, fatigue, stress.',
    category: 'strain',
    etymology: 'Exotic tropical ray-like effects'
  },
  {
    id: 'strain-forbidden-fruit',
    term: 'Forbidden Fruit',
    definition: 'Indica (60% Indica / 40% Sativa). THC: 18-23%. Effects: Sleepy, tingly, relaxed. Taste: Grapefruit, sweet, spicy. Helps with stress, pain, insomnia.',
    category: 'strain',
    etymology: 'Biblical forbidden fruit reference'
  },
  {
    id: 'strain-gas-mintz-lows',
    term: 'Gas Mintz',
    definition: 'Hybrid (70% Indica / 30% Sativa). THC: 20-26%. Effects: Relaxed, euphoric, calming. Taste: Minty, diesel, earthy. Helps with stress, anxiety, insomnia, chronic pain.',
    category: 'strain',
    etymology: 'Gassy minty flavor combination'
  },
  {
    id: 'strain-gelato-lows',
    term: 'Gelato',
    definition: 'Hybrid (55% Indica / 45% Sativa). THC: 20-25%. Effects: Uplifted, relaxed, happy. Taste: Sweet, creamy, citrus. Helps with depression, fatigue, mood swings, stress.',
    category: 'strain',
    etymology: 'Italian ice cream-inspired strain'
  },
  {
    id: 'strain-gorilla-kush',
    term: 'Gorilla Kush',
    definition: 'Hybrid (70% Indica / 30% Sativa). THC: 22-28%. Effects: Sedative, heavy body high, calming. Taste: Pungent, earthy, pine. Helps with pain, insomnia, anxiety, muscle spasms.',
    category: 'strain',
    etymology: 'Gorilla genetics with Kush lineage'
  },
  {
    id: 'strain-green-crack',
    term: 'Gr33n Crack',
    definition: 'Hybrid (65% Sativa / 35% Indica). THC: 15-25%. Effects: Energetic, happy, focused. Taste: Citrus, tropical, earthy. Helps with fatigue, depression, stress.',
    category: 'strain',
    etymology: 'Energizing crack-like effects (cannabis only)'
  },
  {
    id: 'strain-ice-cream-cake',
    term: 'Ic3 Cream Cak3',
    definition: 'Hybrid (75% Indica / 25% Sativa). THC: 20-25%. Effects: Relaxed, happy, sleepy. Taste: Vanilla, creamy, nutty. Helps with pain, insomnia, anxiety.',
    category: 'strain',
    etymology: 'Ice cream cake dessert-flavored strain'
  },
  {
    id: 'strain-ice-cream-creamsicle',
    term: 'Ic3 Cream Cr3amsicl3',
    definition: 'Hybrid (60% Indica / 40% Sativa). THC: 18-23%. Effects: Euphoric, calming, body high. Taste: Orange, vanilla, sweet. Helps with stress, depression, muscle tension.',
    category: 'strain',
    etymology: 'Creamsicle popsicle-flavored strain'
  },
  {
    id: 'strain-incredible-hulk',
    term: 'Incredible Hulk',
    definition: 'Hybrid (60% Sativa / 40% Indica). THC: 17-24%. Effects: Energized, happy, uplifted. Taste: Pineapple, berry, diesel. Helps with fatigue, pain, stress.',
    category: 'strain',
    etymology: 'Marvel superhero-themed powerful strain'
  },
  {
    id: 'strain-larry-og',
    term: 'Larry OG',
    definition: 'Hybrid (60% Indica / 40% Sativa). THC: 20-26%. Effects: Relaxed, happy, mellow. Taste: Citrus, pine, earthy. Helps with stress, depression, chronic pain, anxiety.',
    category: 'strain',
    etymology: 'OG Kush variation named Larry'
  },
  {
    id: 'strain-lemon-cherry-dosilato',
    term: 'Lemon Cherry Dosilato',
    definition: 'Indica-dominant Hybrid (70% Indica / 30% Sativa). THC: 22-29%. Effects: Calming, body high, euphoric. Taste: Sweet cherry, lemon, earthy spice. Helps with stress, insomnia, chronic pain, anxiety.',
    category: 'strain',
    etymology: 'Lemon cherry with Dosidos genetics'
  },
  {
    id: 'strain-lemon-tree',
    term: 'Lemon Tree',
    definition: 'Sativa (100% Sativa). THC: 17-25%. Effects: Relaxed, happy, euphoric. Taste: Lemon, citrus, diesel. Helps with depression, stress, chronic pain.',
    category: 'strain',
    etymology: 'Lemon citrus tree-inspired strain'
  },
  {
    id: 'strain-lovers-lane',
    term: 'Lovers Lane',
    definition: 'Hybrid (40% Indica / 60% Sativa). THC: 20-26%. Effects: Relaxed, euphoric, tingly. Taste: Fruity, floral, creamy. Helps with stress, anxiety, muscle spasms, depression.',
    category: 'strain',
    etymology: 'Romantic lovers lane reference'
  },
  {
    id: 'strain-mac-1',
    term: 'Mac 1',
    definition: 'Hybrid (60% Indica / 50% Sativa). THC: 20-27%. Effects: Balanced, creative, euphoric. Taste: Citrus, diesel, creamy. Helps with stress, depression, mood swings, fatigue.',
    category: 'strain',
    etymology: 'Miracle Alien Cookies phenotype #1'
  },
  {
    id: 'strain-midnight',
    term: 'Midnight',
    definition: 'Hybrid (40% Indica / 60% Sativa). THC: 10-18%. Effects: Calm, clear-headed, mildly euphoric. Taste: Herbal, earthy, floral. Helps with anxiety, inflammation, chronic pain, insomnia.',
    category: 'strain',
    etymology: 'Named for its calming midnight effects'
  },
  {
    id: 'strain-new-york-skunk',
    term: 'New York Skunk',
    definition: 'Hybrid (65% Sativa / 35% Indica). THC: 18-24%. Effects: Energetic, uplifting, focused. Taste: Skunky, citrus, diesel. Helps with fatigue, depression, stress, lack of focus.',
    category: 'strain',
    etymology: 'NYC-inspired skunk strain variety'
  },
  {
    id: 'strain-northern-lights',
    term: 'Northern Lights',
    definition: 'Hybrid (50% Indica / 50% Sativa). THC: 16-22%. Effects: Relaxed, euphoric, dreamy. Taste: Earthy, sweet, pine. Helps with insomnia, chronic pain, depression, stress.',
    category: 'strain',
    etymology: 'Named after the Aurora Borealis phenomenon'
  },
  {
    id: 'strain-oil-tanker',
    term: 'Oil Tanker',
    definition: 'Sativa-dominant Hybrid (65% Sativa / 35% Indica). THC: 22-28%. Effects: Energizing, creative, cerebral buzz. Taste: Diesel, pungent, herbal. Helps with fatigue, low mood, mild pain, stress.',
    category: 'strain',
    etymology: 'Oil tanker fuel-like diesel strain'
  },
  {
    id: 'strain-pml-smallz',
    term: 'PML Smallz',
    definition: 'Sativa-dominant Hybrid (60% Sativa / 40% Indica). THC: 17-23%. Effects: Uplifted, focused, lightly energizing. Taste: Sweet, herbal, light diesel. Helps with stress, fatigue, mild depression, low motivation.',
    category: 'strain',
    etymology: 'PML genetics in smaller bud format'
  },
  {
    id: 'strain-premium-blu-cookies',
    term: 'Premium Blu Cookies',
    definition: 'Hybrid (65% Indica / 35% Sativa). THC: 20-27%. Effects: Euphoric, mellow, body buzz. Taste: Berry, nutty, vanilla. Helps with insomnia, stress, appetite loss.',
    category: 'strain',
    etymology: 'Premium blue cookie genetics'
  },
  {
    id: 'strain-premium-blu-runtz',
    term: 'Premium Blu Runtz',
    definition: 'Hybrid (60% Indica / 40% Sativa). THC: 22-28%. Effects: Relaxed, uplifted, focused. Taste: Fruity, creamy, sweet. Helps with chronic fatigue, anxiety, depression.',
    category: 'strain',
    etymology: 'Premium blue Runtz genetics'
  },
  {
    id: 'strain-premium-brownie-goods',
    term: 'Premium Brownie Goods',
    definition: 'Indica (75% Indica / 25% Sativa). THC: 18-24%. Effects: Calm, sleepy, content. Taste: Chocolate, earthy, sweet. Helps with stress, insomnia, mild pain.',
    category: 'strain',
    etymology: 'Premium brownie-flavored strain'
  },
  {
    id: 'strain-premium-northern-lights',
    term: 'Premium Northern Lights',
    definition: 'Indica-dominant Hybrid (80% Indica / 20% Sativa). THC: 20-26%. Effects: Sedative, peaceful, mentally calming. Taste: Earthy, sweet, pine. Helps with insomnia, chronic pain, anxiety, stress.',
    category: 'strain',
    etymology: 'Premium version of Northern Lights'
  },
  {
    id: 'strain-premium-white-widow',
    term: 'Premium White Widow',
    definition: 'Hybrid (50% Indica / 50% Sativa). THC: 18-25%. Effects: Balanced, energetic, creative. Taste: Pine, citrus, earthy. Helps with depression, fatigue, stress, mood swings.',
    category: 'strain',
    etymology: 'Premium version of White Widow'
  },
  {
    id: 'strain-raspberry-pie',
    term: 'Raspberry Pie',
    definition: 'Hybrid (70% Indica / 30% Sativa). THC: 19-24%. Effects: Relaxing, giggly, body-heavy. Taste: Berry, creamy, sweet. Helps with pain, nausea, stress.',
    category: 'strain',
    etymology: 'Raspberry pie dessert-flavored strain'
  },
  {
    id: 'strain-runtz',
    term: 'Runtz',
    definition: 'Hybrid (50% Indica / 50% Sativa). THC: 19-29%. Effects: Balanced, tingly, happy. Taste: Candy, fruity, tropical. Helps with anxiety, depression, appetite loss.',
    category: 'strain',
    etymology: 'Named after the popular candy'
  },
  {
    id: 'strain-skittlez',
    term: 'Skittlez',
    definition: 'Hybrid (70% Indica / 30% Sativa). THC: 18-23%. Effects: Relaxed, sleepy, blissful. Taste: Fruity, candy, berry. Helps with chronic pain, insomnia, stress.',
    category: 'strain',
    etymology: 'Named after Skittles candy'
  },
  {
    id: 'strain-skywalker-og',
    term: 'Skywalker OG',
    definition: 'Hybrid (70% Indica / 30% Sativa). THC: 20-25%. Effects: Sedative, heavy, euphoric. Taste: Earthy, herbal, spicy. Helps with insomnia, PTSD, chronic pain.',
    category: 'strain',
    etymology: 'Star Wars Skywalker reference'
  },
  {
    id: 'strain-smallz',
    term: 'Smallz',
    definition: 'Hybrid (Varies by strain). THC: 15-21%. Effects: Mild, calming, light buzz. Taste: Light, earthy, smooth. Helps with minor stress, anxiety, beginners.',
    category: 'strain',
    etymology: 'Small-sized buds with lighter effects'
  },
  {
    id: 'strain-stingray-runtz',
    term: 'Stingray Runtz',
    definition: 'Hybrid (60% Indica / 40% Sativa). THC: 21-27%. Effects: Tingly, mellow, cerebral. Taste: Fruity, creamy, floral. Helps with stress, muscle tension, creative fatigue.',
    category: 'strain',
    etymology: 'Stingray-themed Runtz variation'
  },
  {
    id: 'strain-stoneward',
    term: 'Stoneward',
    definition: 'Indica (80% Indica / 20% Sativa). THC: 22-28%. Effects: Heavy, couch-lock, dreamy. Taste: Earthy, woody, citrus. Helps with insomnia, anxiety, appetite loss.',
    category: 'strain',
    etymology: 'Stoned state ward-like effects'
  },
  {
    id: 'strain-strawberry-cough',
    term: 'Strawberry Cough',
    definition: 'Sativa (80% Sativa / 20% Indica). THC: 18-25%. Effects: Uplifted, euphoric, creative. Taste: Strawberry, sweet, herbal. Helps with stress, fatigue, social anxiety.',
    category: 'strain',
    etymology: 'Strawberry flavor that may cause coughing'
  }
];

// Sample transactions
export const mockTransactions = [
  {
    id: 'tx-001',
    userId: 'user-123',
    items: [
      { productId: 'lows-1', quantity: 1, price: 8 },
      { productId: 'deps-2', quantity: 1, price: 15 }
    ],
    total: 23,
    status: 'completed',
    pickupCode: 'ABC123',
    timestamp: '2024-03-15T10:30:00Z',
    paymentMethod: 'cash'
  }
];

// NYC neighborhoods for member profiles
export const nycNeighborhoods = [
  'Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island',
  'East Village', 'West Village', 'SoHo', 'Tribeca', 'Chelsea',
  'Upper East Side', 'Upper West Side', 'Harlem', 'Washington Heights',
  'Williamsburg', 'Park Slope', 'Long Island City', 'Astoria'
];