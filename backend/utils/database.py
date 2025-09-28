from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import os
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')

# Database connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'statusxsmoakland')]

# Collections
users_collection = db.users
products_collection = db.products
daily_deals_collection = db.daily_deals
orders_collection = db.orders
wictionary_collection = db.wictionary
inventory_collection = db.inventory
transactions_collection = db.transactions
admins_collection = db.admins
ratings_collection = db.ratings

class DatabaseManager:
    @staticmethod
    async def init_database():
        """Initialize database with indexes and sample data."""
        # Create indexes
        await users_collection.create_index("email", unique=True)
        await products_collection.create_index("category")
        await products_collection.create_index("vendor")
        await daily_deals_collection.create_index("product_id")
        await daily_deals_collection.create_index("valid_until")
        await wictionary_collection.create_index("term")
        await wictionary_collection.create_index("category")
        await transactions_collection.create_index("payment_code", unique=True)
        await transactions_collection.create_index("user_id")
        await admins_collection.create_index("email", unique=True)
        await ratings_collection.create_index([("product_id", 1), ("user_id", 1)], unique=True)
        await ratings_collection.create_index("product_id")
        await ratings_collection.create_index("user_id")
        
        # Insert sample data if collections are empty
        if await products_collection.count_documents({}) == 0:
            await DatabaseManager.seed_products()
        
        if await wictionary_collection.count_documents({}) == 0:
            await DatabaseManager.seed_wictionary()
        
        # Temporarily disabled admin seeding
        # if await admins_collection.count_documents({}) == 0:
        #     await DatabaseManager.seed_admin()
    
    @staticmethod
    async def seed_products():
        """Seed initial products."""
        from datetime import datetime
        
        sample_products = [
            {
                "name": "NYC Haze",
                "category": "flower",
                "price": 45.0,
                "original_price": 60.0,
                "image": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
                "description": "Premium sativa strain perfect for the city that never sleeps",
                "thc": "24%",
                "vendor": "Brooklyn Botanicals",
                "tier": "za",
                "in_stock": True,
                "rating": 4.8,
                "reviews": 156,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "name": "Manhattan Melt",
                "category": "edibles",
                "price": 35.0,
                "original_price": 35.0,
                "image": "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=400&fit=crop",
                "description": "Smooth chocolate edibles with a sophisticated NYC twist",
                "thc": "10mg per piece",
                "vendor": "Queens Confections",
                "tier": "deps",
                "in_stock": True,
                "rating": 4.6,
                "reviews": 89,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "name": "Bronx Blaze",
                "category": "concentrates",
                "price": 55.0,
                "original_price": 70.0,
                "image": "https://images.unsplash.com/photo-1597848212624-e6ebcc0eff05?w=400&h=400&fit=crop",
                "description": "High-quality concentrate for experienced users",
                "thc": "85%",
                "vendor": "Uptown Extracts",
                "tier": "za",
                "in_stock": True,
                "rating": 4.9,
                "reviews": 234,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
        ]
        
        await products_collection.insert_many(sample_products)
    
    @staticmethod
    async def seed_wictionary():
        """Seed comprehensive wictionary terms including all strain definitions."""
        from datetime import datetime
        
        # Check if already seeded to prevent duplicates
        existing_count = await wictionary_collection.count_documents({})
        if existing_count > 10:  # If more than 10 terms exist, assume already seeded
            return
        
        # Clear existing terms to reseed with comprehensive data
        await wictionary_collection.delete_many({})
        
        comprehensive_terms = [
            # Tier Definitions
            {
                "term": "Za",
                "definition": "Premium, top-shelf cannabis with exceptional quality, potency, and flavor profile",
                "category": "slang",
                "etymology": "NYC street term for the highest grade cannabis"
            },
            {
                "term": "Deps", 
                "definition": "Mid-tier cannabis that is dependable and consistent, better than lows but not premium",
                "category": "slang",
                "etymology": "Short for \"dependable\" - reliable quality cannabis"
            },
            {
                "term": "Lows",
                "definition": "Budget-friendly cannabis, entry-level quality but still effective", 
                "category": "slang",
                "etymology": "Lower tier pricing and quality classification"
            },
            {
                "term": "Loud",
                "definition": "High-quality cannabis with a strong aroma and potent effects",
                "category": "slang", 
                "etymology": "NYC street term popularized in the 2000s"
            },
            {
                "term": "Fire",
                "definition": "Exceptionally good quality cannabis",
                "category": "slang",
                "etymology": "Street slang indicating top-quality product"
            },

            # ZA (ZAZA) TIER STRAINS - Using 'culture' category for strains
            {
                "term": "Gary Payton",
                "definition": "Hybrid (50% Indica / 50% Sativa) - THC: 19-25%. Effects: Uplifted, focused, relaxed. Taste: Diesel, herbal, spicy. Helps with stress, anxiety, depression.",
                "category": "culture",
                "etymology": "Premium za strain named after NBA legend Gary Payton"
            },
            {
                "term": "Lemon Cherry Gelato",
                "definition": "Indica-dominant Hybrid (60% Indica / 40% Sativa) - THC: 21-28%. Effects: Euphoric, relaxed, blissful. Taste: Citrus, cherry, creamy. Helps with pain, mood swings, insomnia.",
                "category": "culture", 
                "etymology": "Popular za-tier gelato phenotype with citrus cherry terpenes"
            },
            {
                "term": "Lemon Cherry Push Pop",
                "definition": "Indica-dominant Hybrid (70% Indica / 30% Sativa) - THC: 22-27%. Effects: Relaxed, cheerful, creative. Taste: Sweet, fruity, citrus. Helps with anxiety, stress, appetite loss.",
                "category": "culture",
                "etymology": "Za strain with dessert-like push pop candy flavors"
            },
            {
                "term": "Playmaker",
                "definition": "Hybrid (50% Sativa / 50% Indica) - THC: 20-26%. Effects: Energized, focused, happy. Taste: Earthy, citrus, spicy. Helps with fatigue, depression, stress.",
                "category": "culture",
                "etymology": "Za-tier balanced hybrid for peak performance"
            },
            {
                "term": "Purple Runtz", 
                "definition": "Indica-dominant Hybrid (80% Indica / 20% Sativa) - THC: 19-26%. Effects: Sedated, happy, euphoric. Taste: Fruity, grape, candy. Helps with insomnia, pain, anxiety.",
                "category": "culture",
                "etymology": "Premium purple phenotype of the famous Runtz strain"
            },
            {
                "term": "Super Dope",
                "definition": "Hybrid (50% Indica / 50% Sativa) - THC: 23-28%. Effects: Powerful, euphoric, relaxing. Taste: Fruity, herbal, earthy. Helps with stress, chronic pain, depression.",
                "category": "culture",
                "etymology": "High-potency za strain with exceptional effects"
            },
            {
                "term": "Super Runtz",
                "definition": "Hybrid (60% Indica / 40% Sativa) - THC: 21-27%. Effects: Mellow, cheerful, creative. Taste: Candy, sweet, tropical. Helps with anxiety, appetite loss, pain.",
                "category": "culture",
                "etymology": "Enhanced version of classic Runtz genetics"
            },
            {
                "term": "Superman OG",
                "definition": "Indica-dominant Hybrid (75% Indica / 25% Sativa) - THC: 20-26%. Effects: Heavy, calming, couch-lock. Taste: Diesel, pine, spicy. Helps with insomnia, stress, chronic pain.",
                "category": "culture",
                "etymology": "Powerful za-tier OG strain with superhero strength"
            },
            {
                "term": "Tunchi",
                "definition": "Hybrid (60% Sativa / 40% Indica) - THC: 22-27%. Effects: Creative, social, uplifted. Taste: Fruity, sour, floral. Helps with fatigue, anxiety, stress.",
                "category": "culture",
                "etymology": "Unique za strain with distinctive flavor profile"
            },

            # DEPS TIER STRAINS - Using 'science' category for medical information
            {
                "term": "Blueberry Space Cake",
                "definition": "Indica-dominant Hybrid (70% Indica / 30% Sativa) - THC: 18-24%. Effects: Relaxed, euphoric, sleepy. Taste: Berry, creamy, earthy. Helps with stress, insomnia, pain.",
                "category": "science",
                "etymology": "Deps-tier indica with out-of-this-world blueberry flavors"
            },
            {
                "term": "Blue Cookies",
                "definition": "Hybrid (75% Indica / 25% Sativa) - THC: 20-26%. Effects: Relaxed, happy, sedated. Taste: Sweet, vanilla, berry. Helps with anxiety, pain, insomnia.",
                "category": "science",
                "etymology": "Blue-phenotype Girl Scout Cookies hybrid"
            },
            {
                "term": "Bronx Glue",
                "definition": "Hybrid (60% Indica / 40% Sativa) - THC: 20-25%. Effects: Heavy, stony, couch-lock. Taste: Diesel, earthy, pungent. Helps with chronic pain, stress, insomnia.",
                "category": "science",
                "etymology": "NYC-bred Gorilla Glue phenotype from the Bronx"
            },
            {
                "term": "Crostata",
                "definition": "Indica-dominant Hybrid - THC: 18-24%. Effects: Relaxing, euphoric, comforting. Taste: Pastry, fruit, vanilla. Helps with stress, mood swings, insomnia.",
                "category": "science",
                "etymology": "Italian-inspired dessert strain with pastry flavors"
            },
            {
                "term": "Flushing Mints",
                "definition": "Hybrid (50% Indica / 50% Sativa) - THC: 22-28%. Effects: Relaxed, euphoric, focused. Taste: Minty, earthy, herbal. Helps with stress, fatigue, depression, inflammation.",
                "category": "science",
                "etymology": "Queens-bred mint strain from Flushing, NY"
            },
            {
                "term": "Gelato 41",
                "definition": "Sativa Dominant Hybrid (60% Sativa / 40% Indica) - THC: 25-29%. Effects: Uplifted, euphoric, creative, focused, relaxed. Taste: Sweet, creamy, citrus, earthy, berry. Helps with depression, anxiety, fatigue, mood swings, chronic stress.",
                "category": "science", 
                "etymology": "Sativa-leaning Gelato phenotype #41"
            },
            {
                "term": "Girl Scout Cookies",
                "definition": "Hybrid (60% Indica / 40% Sativa) - THC: 17-28%. Effects: Happy, relaxed, euphoric. Taste: Sweet, earthy, mint. Helps with chronic pain, appetite loss, stress.",
                "category": "science",
                "etymology": "Classic cookie strain from California genetics"
            },
            {
                "term": "Granddaddy Purple",
                "definition": "Indica (100%) - THC: 17-23%. Effects: Sleepy, relaxed, euphoric. Taste: Grape, berry, sweet. Helps with insomnia, muscle spasms, appetite loss.",
                "category": "science",
                "etymology": "Classic California purple indica strain"
            },
            {
                "term": "Grapes and Cream",
                "definition": "Balanced Hybrid (50% Sativa / 50% Indica) - THC: 24-28%. Effects: Euphoric, relaxed, creative, happy, soothing. Taste: Grape, creamy, sweet, berry, earthy. Helps with anxiety, stress, depression, mood swings, mild pain.",
                "category": "science",
                "etymology": "Smooth hybrid with grape cream flavors"
            },
            {
                "term": "Grape Soda",
                "definition": "Balanced Hybrid (50% Sativa / 50% Indica) - THC: 22-26%. Effects: Relaxed, uplifted, euphoric, happy, calm. Taste: Grape, sweet, berry, citrus, floral. Helps with stress, anxiety, depression, chronic pain, fatigue.",
                "category": "science",
                "etymology": "Fizzy grape-flavored balanced hybrid"
            },
            {
                "term": "Gush Mints",
                "definition": "Indica-dominant Hybrid (80% Indica / 20% Sativa) - THC: 20-26%. Effects: Calming, euphoric, sedative. Taste: Mint, gassy, earthy. Helps with stress, depression, insomnia.",
                "category": "science",
                "etymology": "Minty indica with gushing flavor explosion"
            },
            {
                "term": "LA Pop Rocks",
                "definition": "Indica Dominant Hybrid (70% Indica / 30% Sativa) - THC: 25-29%. Effects: Relaxed, euphoric, sleepy, calm, uplifted. Taste: Sweet, fruity, candy, berry, creamy. Helps with insomnia, stress, anxiety, chronic pain, appetite loss.",
                "category": "science",
                "etymology": "Los Angeles strain with popping candy flavors"
            },
            {
                "term": "Love Triangle",
                "definition": "Hybrid (60% Indica / 40% Sativa) - THC: 19-24%. Effects: Relaxed, euphoric, aroused. Taste: Berry, earthy, floral. Helps with anxiety, stress, chronic pain.",
                "category": "science",
                "etymology": "Romantic hybrid with complex terpene relationships"
            },
            {
                "term": "Maui Waui",
                "definition": "Sativa (100%) - THC: 17-23%. Effects: Energetic, happy, euphoric. Taste: Pineapple, tropical, citrus. Helps with fatigue, depression, anxiety.",
                "category": "science",
                "etymology": "Classic Hawaiian sativa landrace strain"
            },
            {
                "term": "OG Kush",
                "definition": "Hybrid (55% Indica / 45% Sativa) - THC: 19-26%. Effects: Relaxed, happy, hungry. Taste: Earthy, pine, woody. Helps with stress, migraines, depression.",
                "category": "science",
                "etymology": "Original Gangster California strain"
            },
            {
                "term": "Oreo Cookies",
                "definition": "Indica-dominant Hybrid (70% Indica / 30% Sativa) - THC: 22-28%. Effects: Sedated, euphoric, hungry. Taste: Creamy, chocolate, sweet. Helps with insomnia, pain, stress.",
                "category": "science",
                "etymology": "Cookie strain with chocolate cream filling"
            },
            {
                "term": "Purple Candy",
                "definition": "Indica-dominant Hybrid (75% Indica / 25% Sativa) - THC: 17-23%. Effects: Relaxed, mellow, giggly. Taste: Sweet, fruity, berry. Helps with stress, anxiety, insomnia.",
                "category": "science",
                "etymology": "Sweet purple indica with candy flavors"
            },
            {
                "term": "Tropical Skittles",
                "definition": "Indica Dominant Hybrid (70% Indica / 30% Sativa) - THC: 24-28%. Effects: Relaxed, euphoric, happy, sleepy, uplifted. Taste: Tropical, fruity, sweet, berry, citrus. Helps with stress, anxiety, insomnia, depression, chronic pain.",
                "category": "science",
                "etymology": "Tropical candy strain with skittles flavor"
            },
            {
                "term": "Watermelon Cookies",
                "definition": "Indica-dominant Hybrid (80% Indica / 20% Sativa) - THC: 18-26%. Effects: Relaxed, happy, sedated. Taste: Watermelon, sweet, earthy. Helps with anxiety, insomnia, pain, appetite loss.",
                "category": "science",
                "etymology": "Refreshing cookie strain with watermelon genetics"
            },
            {
                "term": "White Runtz",
                "definition": "Sativa Dominant Hybrid (60% Sativa / 40% Indica) - THC: 24-29%. Effects: Euphoric, uplifted, creative, focused, relaxed. Taste: Sweet, fruity, candy, creamy, citrus. Helps with stress, depression, fatigue, anxiety, mood swings.",
                "category": "science",
                "etymology": "White phenotype Runtz with sativa dominance"
            },

            # LOWS TIER STRAINS - Using 'legal' category for accessible information
            {
                "term": "Animal Cookies",
                "definition": "Hybrid (75% Indica / 25% Sativa) - Known for relaxing and sleepy effects, often leading to euphoria. Nutty, sweet, and vanilla taste. Helps with insomnia, chronic pain, depression, anxiety, and stress.",
                "category": "legal",
                "etymology": "Budget-tier cookie strain with animal genetics"
            },
            {
                "term": "Blackberry Kush",
                "definition": "Indica (80% Indica / 20% Sativa) - Delivers relaxing and sleepy sensations with euphoria. Berry, earthy, and sweet flavor. Helps with insomnia, pain, stress, depression, and anxiety.",
                "category": "legal",
                "etymology": "Classic blackberry indica strain"
            },
            {
                "term": "Blue Haze",
                "definition": "Sativa (80% Sativa / 20% Indica) - Characterized by uplifting, energetic, and focused effects. Sweet with blueberry and herbal undertones. Helps with fatigue, stress, depression, and ADHD.",
                "category": "legal",
                "etymology": "Blue phenotype of classic Haze genetics"
            },
            {
                "term": "Blue Skittles",
                "definition": "Hybrid (60% Indica / 40% Sativa) - Induces relaxing, happy, and euphoric feelings. Berry, fruity, and candy flavor. Helps with anxiety, depression, chronic pain, and mood swings.",
                "category": "legal",
                "etymology": "Blue candy strain with skittles genetics"
            },
            {
                "term": "Brooklyn Kush",
                "definition": "Indica (80% Indica / 20% Sativa) - Known for heavy, sedative, and mellow effects. Diesel, earthy, and pine taste. Helps with insomnia, pain, stress, and muscle tension.",
                "category": "legal",
                "etymology": "NYC indica strain from Brooklyn"
            },
            {
                "term": "Bubba Kush",
                "definition": "Indica (65% Indica / 35% Sativa) - Induces sleepy, calm, and body-focused sensations. Coffee, chocolate, and earthy taste. Helps with stress, insomnia, pain, and muscle spasms.",
                "category": "legal",
                "etymology": "Classic indica with coffee shop vibes"
            },
            {
                "term": "Chem Dawg",
                "definition": "Hybrid (55% Sativa / 45% Indica) - Delivers euphoric, relaxed, and happy sensations. Diesel, pine, and spicy taste. Helps with stress, pain, depression, and anxiety.",
                "category": "legal",
                "etymology": "Chemical dog strain with pungent aroma"
            },
            {
                "term": "Cherry Runtz",
                "definition": "Hybrid (50% Sativa / 50% Indica) - Induces relaxed, creative, and euphoric effects. Cherry, candy, and fruity flavors. Helps with depression, mood swings, and chronic stress.",
                "category": "legal",
                "etymology": "Cherry-flavored Runtz phenotype"
            },
            {
                "term": "Chocolate Truffle",
                "definition": "Indica (70% Indica / 30% Sativa) - Known for sleepy, calm, and tingly sensations. Rich chocolate, nutty, and earthy taste. Helps with insomnia, chronic pain, and stress.",
                "category": "legal",
                "etymology": "Dessert strain with chocolate flavors"
            },
            {
                "term": "Durban Poison",
                "definition": "Sativa (100% Sativa) - Pure sativa with energizing, uplifting, and focused effects. Sweet, pine, and citrus flavor. Helps with fatigue, depression, and ADHD.",
                "category": "legal",
                "etymology": "South African landrace sativa strain"
            },
            {
                "term": "Gelato",
                "definition": "Hybrid (55% Indica / 45% Sativa) - Provides uplifted, relaxed, and happy sensations. Sweet, creamy, and citrusy flavor. Helps with depression, fatigue, mood swings, and stress.",
                "category": "legal",
                "etymology": "Italian ice cream inspired strain"
            },
            {
                "term": "Gorilla Kush",
                "definition": "Hybrid (70% Indica / 30% Sativa) - Known for sedative, heavy body high, and calming effects. Pungent, earthy, and piney taste. Helps with pain, insomnia, anxiety, and muscle spasms.",
                "category": "legal",
                "etymology": "Gorilla genetics crossed with Kush"
            },
            {
                "term": "Green Crack",
                "definition": "Hybrid (65% Sativa / 35% Indica) - Offers energetic, happy, and focused effects. Citrus, tropical, and earthy taste. Helps with fatigue, depression, and stress.",
                "category": "legal",
                "etymology": "Energizing sativa with crack-like energy"
            },
            {
                "term": "Ice Cream Cake",
                "definition": "Hybrid (75% Indica / 25% Sativa) - Induces relaxed, happy, and sleepy sensations. Vanilla, creamy, and nutty flavor. Helps with pain, insomnia, and anxiety.",
                "category": "legal",
                "etymology": "Dessert strain with ice cream genetics"
            },
            {
                "term": "Incredible Hulk",
                "definition": "Hybrid (60% Sativa / 40% Indica) - Delivers energized, happy, and uplifted feelings. Pineapple, berry, and diesel taste. Helps with fatigue, pain, and stress.",
                "category": "legal",
                "etymology": "Superhero strain with incredible strength"
            },
            {
                "term": "Larry OG",
                "definition": "Hybrid (60% Indica / 40% Sativa) - Known for relaxed, happy, and mellow effects. Citrus, pine, and earthy taste. Helps with stress, depression, chronic pain, and anxiety.",
                "category": "legal",
                "etymology": "OG strain named after Larry"
            },
            {
                "term": "Lemon Tree",
                "definition": "Sativa (100% Sativa) - Pure sativa promoting relaxed, happy, and euphoric feelings. Distinct lemon, citrus, and diesel taste. Helps with depression, stress, and chronic pain.",
                "category": "legal",
                "etymology": "Citrus sativa with lemon tree genetics"
            },
            {
                "term": "Lovers Lane",
                "definition": "Hybrid (40% Indica / 60% Sativa) - Provides relaxed, euphoric, and tingly sensations. Fruity, floral, and creamy taste. Helps with stress, anxiety, muscle spasms, and depression.",
                "category": "legal",
                "etymology": "Romantic strain for intimate moments"
            },
            {
                "term": "Northern Lights",
                "definition": "Hybrid (50% Indica / 50% Sativa) - Induces relaxed, euphoric, and dreamy sensations. Earthy, sweet, and piney flavor. Helps with insomnia, chronic pain, depression, and stress.",
                "category": "legal",
                "etymology": "Classic strain named after aurora borealis"
            },
            {
                "term": "Skywalker OG",
                "definition": "Hybrid (70% Indica / 30% Sativa) - Delivers sedative, heavy, and euphoric effects. Earthy, herbal, and spicy taste. Helps with insomnia, PTSD, and chronic pain.",
                "category": "legal",
                "etymology": "Jedi-level OG strain from galaxy far away"
            }
        ]
        
        await wictionary_collection.insert_many(comprehensive_terms)
    
    @staticmethod
    async def seed_admin():
        """Seed initial admin user."""
        from utils.auth import get_password_hash
        from datetime import datetime
        
        admin_user = {
            "username": "admin",
            "email": "admin@statusxsmoakland.com",
            "password_hash": get_password_hash("Admin123!"),
            "full_name": "System Administrator",
            "role": "super_admin",
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        await admins_collection.insert_one(admin_user)

def convert_object_id(data):
    """Convert ObjectId to string in MongoDB documents."""
    if isinstance(data, list):
        return [convert_object_id(item) for item in data]
    elif isinstance(data, dict):
        if "_id" in data:
            data["id"] = str(data["_id"])
            del data["_id"]
        return {key: convert_object_id(value) for key, value in data.items()}
    elif isinstance(data, ObjectId):
        return str(data)
    return data