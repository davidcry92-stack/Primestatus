#!/usr/bin/env python3
"""
Test login with exactly the same data as frontend sends
"""
import asyncio
import aiohttp
import json

async def test_direct_login():
    backend_url = "https://blank-screen-fix-1.preview.emergentagent.com/api"
    
    # Test with exact same format as frontend
    login_data = {
        "email": "verified@smoakland.com",
        "password": "verified123"
    }
    
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    
    async with aiohttp.ClientSession() as session:
        try:
            print(f"Testing login to: {backend_url}/auth/login")
            print(f"Data: {json.dumps(login_data, indent=2)}")
            
            async with session.post(
                f"{backend_url}/auth/login",
                json=login_data,
                headers=headers
            ) as response:
                response_text = await response.text()
                print(f"Status: {response.status}")
                print(f"Response: {response_text}")
                
                if response.status == 200:
                    try:
                        data = json.loads(response_text)
                        print("✅ Login successful!")
                        print(f"Token: {data.get('access_token', 'No token')[:50]}...")
                        user = data.get('user', {})
                        print(f"User: {user.get('username', 'No username')}")
                        print(f"Verified: {user.get('is_verified', 'Unknown')}")
                        print(f"Membership: {user.get('membership_tier', 'Unknown')}")
                    except:
                        print("✅ Login successful but JSON parsing failed")
                else:
                    print("❌ Login failed")
                    
                # Also test with a simple user that might exist
                print("\n" + "="*50)
                print("Testing with any existing user...")
                
                # Check what users exist in database
                from motor.motor_asyncio import AsyncIOMotorClient
                import os
                mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
                client = AsyncIOMotorClient(mongo_url)
                db = client.statusxsmoakland
                
                users = await db.users.find({}, {"email": 1, "username": 1, "is_verified": 1, "membership_tier": 1}).to_list(length=5)
                print(f"Found {len(users)} users in database:")
                for user in users:
                    print(f"  - {user['email']} ({user.get('username', 'no username')}) - Verified: {user.get('is_verified', False)}")
                
                client.close()
                
        except Exception as e:
            print(f"❌ Request failed: {str(e)}")

if __name__ == "__main__":
    asyncio.run(test_direct_login())