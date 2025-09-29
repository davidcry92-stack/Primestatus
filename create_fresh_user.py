#!/usr/bin/env python3
"""
Create a completely fresh user for testing
"""
import asyncio
import aiohttp
import os
import tempfile
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime

async def create_fresh_user():
    # Connect to MongoDB and clean up
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    client = AsyncIOMotorClient(mongo_url)
    db = client.statusxsmoakland
    
    # Delete all test users
    await db.users.delete_many({"email": {"$regex": "@smoakland.com"}})
    print("✅ Cleaned up existing test users")
    
    client.close()
    
    # Register new user via API
    backend_url = "https://cannabis-member.preview.emergentagent.com/api"
    
    # Create dummy image content
    dummy_image_content = b'\xff\xd8\xff\xe0\x10JFIF\x01\x01\x01HH\xff\xdbC\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a\x1f\x1e\x1d\x1a\x1c\x1c $.\' ",#\x1c\x1c(7),01444\x1f\'9=82<.342\xff\xc0\x11\x08\x01\x01\x01\x01\x11\x02\x11\x01\x03\x11\x01\xff\xc4\x14\x01\x08\xff\xc4\x14\x10\x01\xff\xda\x0c\x03\x01\x02\x11\x03\x11\x3f\xaa\xff\xd9'
    
    async with aiohttp.ClientSession() as session:
        # Prepare form data
        data = aiohttp.FormData()
        data.add_field('username', 'freshuser')
        data.add_field('email', 'fresh@smoakland.com')
        data.add_field('password', 'fresh123')
        data.add_field('full_name', 'Fresh User')
        data.add_field('date_of_birth', '1990-01-01')
        data.add_field('re_entry_code', '4444')
        data.add_field('membership_tier', 'premium')
        data.add_field('is_law_enforcement', 'false')
        
        # Add image files
        data.add_field('id_front', dummy_image_content, filename='id_front.jpg', content_type='image/jpeg')
        data.add_field('id_back', dummy_image_content, filename='id_back.jpg', content_type='image/jpeg')
        
        try:
            async with session.post(f"{backend_url}/auth/register", data=data) as response:
                response_text = await response.text()
                print(f"Registration Status: {response.status}")
                
                if response.status == 200:
                    print("✅ Registration successful!")
                    
                    # Now manually verify the user
                    client = AsyncIOMotorClient(mongo_url)
                    db = client.statusxsmoakland
                    
                    result = await db.users.update_one(
                        {"email": "fresh@smoakland.com"},
                        {
                            "$set": {
                                "is_verified": True,
                                "id_verification.verification_status": "approved",
                                "id_verification.verified_at": datetime.utcnow()
                            }
                        }
                    )
                    
                    if result.modified_count > 0:
                        print("✅ User manually verified!")
                        
                        # Test login
                        login_data = {"email": "fresh@smoakland.com", "password": "fresh123"}
                        async with session.post(f"{backend_url}/auth/login", json=login_data) as login_response:
                            login_text = await login_response.text()
                            print(f"Login Test Status: {login_response.status}")
                            
                            if login_response.status == 200:
                                print("🎉 LOGIN SUCCESSFUL!")
                                print("\n" + "="*60)
                                print("🎯 WORKING CREDENTIALS")
                                print("="*60)
                                print("Email: fresh@smoakland.com")
                                print("Password: fresh123")
                                print("Re-entry Code: 4444")
                                print("Membership: Premium")
                                print("Status: VERIFIED ✅")
                                print("="*60)
                            else:
                                print(f"❌ Login failed: {login_text}")
                    
                    client.close()
                    
                else:
                    print(f"❌ Registration failed: {response_text}")
                    
        except Exception as e:
            print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    asyncio.run(create_fresh_user())