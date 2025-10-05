#!/usr/bin/env python3
"""
Test the login functionality and check user creation
"""
import asyncio
import os
import hashlib
import aiohttp
import json
from motor.motor_asyncio import AsyncIOMotorClient

async def test_login_and_user():
    # Connect to MongoDB to check user
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    client = AsyncIOMotorClient(mongo_url)
    db = client.statusxsmoakland
    
    print("🔍 Checking if test user exists in database...")
    user = await db.users.find_one({"email": "test@smoakland.com"})
    
    if user:
        print("✅ User found in database:")
        print(f"   ID: {user.get('id')}")
        print(f"   Username: {user.get('username')}")
        print(f"   Email: {user.get('email')}")
        print(f"   Membership: {user.get('membership_tier')}")
        print(f"   Verified: {user.get('is_verified')}")
        print(f"   Password Hash: {user.get('password_hash')[:20]}...")
    else:
        print("❌ User not found in database. Creating user...")
        
        # Create user with correct hash
        password = "password123"
        password_hash = hashlib.sha256(password.encode()).hexdigest()
        re_entry_hash = hashlib.sha256("1111".encode()).hexdigest()
        
        from datetime import datetime
        test_user = {
            "id": "test-user-12345",
            "username": "testuser",
            "email": "test@smoakland.com",
            "password_hash": password_hash,
            "full_name": "Test User",
            "date_of_birth": "1990-01-01",
            "re_entry_code": re_entry_hash,
            "membership_tier": "premium",
            "is_verified": True,
            "is_law_enforcement": False,
            "verification_status": "approved",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "preferences": {
                "categories": ["flower", "edibles", "vapes"],
                "price_range": [20, 150]
            }
        }
        
        await db.users.insert_one(test_user)
        print("✅ User created")
    
    # Test login API
    print("\n🔍 Testing login API...")
    
    login_data = {
        "email": "test@smoakland.com",
        "password": "password123"
    }
    
    backend_url = "https://secure-pickup.preview.emergentagent.com/api"
    
    async with aiohttp.ClientSession() as session:
        try:
            async with session.post(
                f"{backend_url}/auth/login",
                json=login_data,
                headers={"Content-Type": "application/json"}
            ) as response:
                response_text = await response.text()
                print(f"Status Code: {response.status}")
                print(f"Response: {response_text}")
                
                if response.status == 200:
                    try:
                        data = json.loads(response_text)
                        print("✅ Login successful!")
                        print(f"Token: {data.get('access_token', 'No token')[:50]}...")
                        print(f"User: {data.get('user', {}).get('username', 'No username')}")
                    except:
                        print("✅ Login successful but response parsing failed")
                else:
                    print("❌ Login failed")
                    
        except Exception as e:
            print(f"❌ API call failed: {str(e)}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(test_login_and_user())