#!/usr/bin/env python3
"""
Fix the test user password hash to match the backend's salted hash
"""
import asyncio
import os
import hashlib
from motor.motor_asyncio import AsyncIOMotorClient

async def fix_test_user():
    # Connect to MongoDB
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    client = AsyncIOMotorClient(mongo_url)
    db = client.statusxsmoakland
    
    # Test user credentials
    password = "password123"
    re_entry_code = "1111"
    
    # Hash with the correct salt (matching backend)
    salt = "statusxsmoakland_salt_2024"
    password_hash = hashlib.sha256((password + salt).encode()).hexdigest()
    re_entry_hash = hashlib.sha256((re_entry_code + salt).encode()).hexdigest()
    
    # Update the user with correct hash
    result = await db.users.update_one(
        {"email": "test@smoakland.com"},
        {
            "$set": {
                "password_hash": password_hash,
                "re_entry_code": re_entry_hash
            }
        }
    )
    
    if result.modified_count > 0:
        print("✅ Test user password hash updated successfully!")
        print("\n" + "="*50)
        print("🎯 CORRECTED TEST USER CREDENTIALS")
        print("="*50)
        print("Email: test@smoakland.com")
        print("Password: password123")
        print("Re-entry Code: 1111")
        print("Membership: Premium (Wictionary Access)")
        print("="*50)
        print("\nThe login should now work correctly!")
    else:
        print("❌ Failed to update user")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(fix_test_user())