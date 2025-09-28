#!/usr/bin/env python3
"""
Script to manually reseed the Wictionary collection with comprehensive strain definitions
"""

import asyncio
import os
import sys
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_path))

from utils.database import DatabaseManager, wictionary_collection

async def reseed_wictionary():
    """Manually reseed the wictionary collection."""
    print("🌿 Starting Wictionary reseeding process...")
    
    # Check current count
    current_count = await wictionary_collection.count_documents({})
    print(f"📊 Current wictionary terms: {current_count}")
    
    # Clear existing terms
    print("🗑️ Clearing existing wictionary terms...")
    delete_result = await wictionary_collection.delete_many({})
    print(f"🗑️ Deleted {delete_result.deleted_count} existing terms")
    
    # Reseed with comprehensive data
    print("🌱 Seeding comprehensive strain definitions...")
    await DatabaseManager.seed_wictionary()
    
    # Check new count
    new_count = await wictionary_collection.count_documents({})
    print(f"✅ New wictionary terms count: {new_count}")
    
    # Show sample terms
    sample_terms = await wictionary_collection.find({}).limit(5).to_list(length=5)
    print("\n📋 Sample terms:")
    for term in sample_terms:
        print(f"  • {term.get('term', 'Unknown')}: {term.get('definition', 'No definition')[:100]}...")
    
    # Show category breakdown
    pipeline = [
        {"$group": {"_id": "$category", "count": {"$sum": 1}}}
    ]
    category_stats = await wictionary_collection.aggregate(pipeline).to_list(length=None)
    
    print("\n📊 Category breakdown:")
    for cat in category_stats:
        print(f"  • {cat['_id']}: {cat['count']} terms")
    
    print("\n🎉 Wictionary reseeding complete!")

if __name__ == "__main__":
    asyncio.run(reseed_wictionary())