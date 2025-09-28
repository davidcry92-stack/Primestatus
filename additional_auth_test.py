#!/usr/bin/env python3
"""
Additional Authentication Testing - Test all demo users
"""

import asyncio
import aiohttp
import json

BACKEND_URL = "http://localhost:8001/api"

# All demo users from review request
DEMO_USERS = [
    {"email": "admin@statusxsmoakland.com", "password": "Admin123!", "type": "admin"},
    {"email": "premium@demo.com", "password": "Premium123!", "type": "user"},
    {"email": "basic@demo.com", "password": "Basic123!", "type": "user"},
    {"email": "unverified@demo.com", "password": "Unverified123!", "type": "user"}
]

async def test_all_demo_users():
    """Test all demo users can authenticate."""
    async with aiohttp.ClientSession() as session:
        print("🔐 TESTING ALL DEMO USER AUTHENTICATION")
        print("=" * 50)
        
        for user in DEMO_USERS:
            endpoint = "/admin-auth/login" if user["type"] == "admin" else "/auth/login"
            
            login_data = {
                "email": user["email"],
                "password": user["password"]
            }
            
            try:
                async with session.post(
                    f"{BACKEND_URL}{endpoint}",
                    json=login_data,
                    headers={"Content-Type": "application/json"}
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        if "access_token" in data:
                            user_info = data.get("admin" if user["type"] == "admin" else "user", {})
                            print(f"✅ {user['email']}: Login successful - {user_info.get('membership_tier', user_info.get('role', 'unknown'))}")
                        else:
                            print(f"❌ {user['email']}: No access token in response")
                    else:
                        error_data = await response.json()
                        print(f"❌ {user['email']}: Login failed - {error_data.get('detail', 'Unknown error')}")
            except Exception as e:
                print(f"❌ {user['email']}: Exception - {str(e)}")

if __name__ == "__main__":
    asyncio.run(test_all_demo_users())