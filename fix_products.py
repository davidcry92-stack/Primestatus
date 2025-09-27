#!/usr/bin/env python3
"""
Fix existing products in database to include missing fields
"""

import asyncio
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
ROOT_DIR = Path(__file__).parent / "backend"
load_dotenv(ROOT_DIR / '.env')

async def fix_products():
    """Add missing fields to existing products."""
    
    # Database connection
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ.get('DB_NAME', 'statusxsmoakland')]
    products_collection = db.products
    
    # Update all products to add missing fields
    update_result = await products_collection.update_many(
        {"tier": {"$exists": False}},  # Products without tier field
        {
            "$set": {
                "tier": "za",  # Default tier
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    print(f"Updated {update_result.modified_count} products with missing fields")
    
    # Also update products that might be missing created_at/updated_at
    update_result2 = await products_collection.update_many(
        {"created_at": {"$exists": False}},
        {
            "$set": {
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    print(f"Updated {update_result2.modified_count} products with missing timestamps")
    
    # Check final count
    total_products = await products_collection.count_documents({})
    print(f"Total products in database: {total_products}")
    
    await client.close()

if __name__ == "__main__":
    asyncio.run(fix_products())