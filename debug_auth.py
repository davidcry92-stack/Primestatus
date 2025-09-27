#!/usr/bin/env python3
"""
Debug authentication by testing the exact same logic as backend
"""
import asyncio
import os
import hashlib
from motor.motor_asyncio import AsyncIOMotorClient

async def debug_auth():
    # Connect to MongoDB
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    client = AsyncIOMotorClient(mongo_url)
    db = client.statusxsmoakland
    
    # Test credentials
    email = "verified@smoakland.com"
    password = "verified123"
    
    # Get user from database
    user = await db.users.find_one({"email": email})
    if not user:
        print("❌ User not found in database")
        client.close()
        return
    
    print(f"✅ User found: {user['username']}")
    print(f"   Email: {user['email']}")
    print(f"   Stored password hash: {user['password'][:20]}...")
    
    # Test password verification with exact backend logic
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash - exact copy from backend."""
        salt = "statusxsmoakland_salt_2024"
        hashed_input = hashlib.sha256((plain_password + salt).encode()).hexdigest()
        print(f"   Input password: {plain_password}")
        print(f"   Salt: {salt}")
        print(f"   Generated hash: {hashed_input}")
        print(f"   Stored hash:    {hashed_password}")
        print(f"   Hashes match: {hashed_input == hashed_password}")
        return hashed_input == hashed_password
    
    # Test verification
    is_valid = verify_password(password, user["password"])
    
    if is_valid:
        print("✅ Password verification successful!")
    else:
        print("❌ Password verification failed!")
        
        # Try creating a new hash manually and updating
        print("\n🔧 Fixing password hash...")
        salt = "statusxsmoakland_salt_2024"
        correct_hash = hashlib.sha256((password + salt).encode()).hexdigest()
        
        await db.users.update_one(
            {"email": email},
            {"$set": {"password": correct_hash}}
        )
        
        print(f"✅ Updated password hash to: {correct_hash[:20]}...")
        
        # Test again
        updated_user = await db.users.find_one({"email": email})
        is_valid_now = verify_password(password, updated_user["password"])
        
        if is_valid_now:
            print("✅ Password verification now works!")
        else:
            print("❌ Still failing after update")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(debug_auth())