#!/usr/bin/env python3
"""
Register a test user using the actual API
"""
import asyncio
import aiohttp
import tempfile
import os

async def register_test_user():
    backend_url = "https://statusapp-fix.preview.emergentagent.com/api"
    
    # Create temporary image files
    dummy_image_content = b'\xff\xd8\xff\xe0\x10JFIF\x01\x01\x01HH\xff\xdbC\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a\x1f\x1e\x1d\x1a\x1c\x1c $.\' ",#\x1c\x1c(7),01444\x1f\'9=82<.342\xff\xc0\x11\x08\x01\x01\x01\x01\x11\x02\x11\x01\x03\x11\x01\xff\xc4\x14\x01\x08\xff\xc4\x14\x10\x01\xff\xda\x0c\x03\x01\x02\x11\x03\x11\x3f\xaa\xff\xd9'
    
    # First delete any existing test user
    from motor.motor_asyncio import AsyncIOMotorClient
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    client = AsyncIOMotorClient(mongo_url)
    db = client.statusxsmoakland
    await db.users.delete_one({"email": "demo@smoakland.com"})
    client.close()
    
    async with aiohttp.ClientSession() as session:
        # Prepare form data
        data = aiohttp.FormData()
        data.add_field('username', 'demouser')
        data.add_field('email', 'demo@smoakland.com')
        data.add_field('password', 'demo123')
        data.add_field('full_name', 'Demo User')
        data.add_field('date_of_birth', '1990-01-01')
        data.add_field('re_entry_code', '2222')
        data.add_field('membership_tier', 'premium')
        data.add_field('is_law_enforcement', 'false')
        
        # Add image files
        data.add_field('id_front', dummy_image_content, filename='id_front.jpg', content_type='image/jpeg')
        data.add_field('id_back', dummy_image_content, filename='id_back.jpg', content_type='image/jpeg')
        
        try:
            async with session.post(f"{backend_url}/auth/register", data=data) as response:
                response_text = await response.text()
                print(f"Registration Status: {response.status}")
                print(f"Response: {response_text}")
                
                if response.status == 200:
                    # Now manually set the user as verified for immediate use
                    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
                    client = AsyncIOMotorClient(mongo_url)
                    db = client.statusxsmoakland
                    
                    await db.users.update_one(
                        {"email": "demo@smoakland.com"},
                        {"$set": {"is_verified": True}}
                    )
                    client.close()
                    
                    print("\n" + "="*50)
                    print("🎯 NEW TEST USER REGISTERED SUCCESSFULLY!")
                    print("="*50)
                    print("Email: demo@smoakland.com")
                    print("Password: demo123")
                    print("Re-entry Code: 2222")
                    print("Membership: Premium (Wictionary Access)")
                    print("Status: Verified and ready to use")
                    print("="*50)
                    
                    # Test login immediately
                    login_data = {"email": "demo@smoakland.com", "password": "demo123"}
                    async with session.post(f"{backend_url}/auth/login", json=login_data) as login_response:
                        login_text = await login_response.text()
                        print(f"\nLogin Test Status: {login_response.status}")
                        if login_response.status == 200:
                            print("✅ Login test successful!")
                        else:
                            print(f"❌ Login test failed: {login_text}")
                    
        except Exception as e:
            print(f"❌ Registration failed: {str(e)}")

if __name__ == "__main__":
    asyncio.run(register_test_user())