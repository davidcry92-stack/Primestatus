from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import os

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
        
        # Insert sample data if collections are empty
        if await products_collection.count_documents({}) == 0:
            await DatabaseManager.seed_products()
        
        if await wictionary_collection.count_documents({}) == 0:
            await DatabaseManager.seed_wictionary()
    
    @staticmethod
    async def seed_products():
        """Seed initial products."""
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
                "in_stock": True,
                "rating": 4.8,
                "reviews": 156
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
                "in_stock": True,
                "rating": 4.6,
                "reviews": 89
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
                "in_stock": True,
                "rating": 4.9,
                "reviews": 234
            }
        ]
        
        await products_collection.insert_many(sample_products)
    
    @staticmethod
    async def seed_wictionary():
        """Seed initial wictionary terms."""
        sample_terms = [
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
                "etymology": "Universal cannabis culture term"
            },
            {
                "term": "Terpenes",
                "definition": "Aromatic compounds that contribute to cannabis flavor and effects",
                "category": "science",
                "etymology": "Scientific terminology"
            },
            {
                "term": "Bodega",
                "definition": "NYC corner store where cannabis accessories are often sold",
                "category": "culture",
                "etymology": "NYC cultural term for corner stores"
            }
        ]
        
        await wictionary_collection.insert_many(sample_terms)

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