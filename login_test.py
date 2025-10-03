#!/usr/bin/env python3
"""
Focused Login Testing for StatusXSmoakland Deployed Environment
Tests the exact login flow that users are experiencing issues with.
"""

import asyncio
import aiohttp
import json

# Deployed backend URL
BACKEND_URL = "https://statusapp-fix.preview.emergentagent.com/api"

# Demo credentials from review request
DEMO_CREDENTIALS = [
    ("admin@statusxsmoakland.com", "Admin123!", "admin"),
    ("premium@demo.com", "Premium123!", "user"),
    ("basic@demo.com", "Basic123!", "user")
]

async def test_login_flow():
    """Test the complete login flow for each demo user."""
    print("🔐 Testing StatusXSmoakland Login Flow")
    print(f"Backend URL: {BACKEND_URL}")
    print("=" * 60)
    
    async with aiohttp.ClientSession() as session:
        for email, password, user_type in DEMO_CREDENTIALS:
            print(f"\n🧪 Testing {email} ({user_type})")
            
            # Determine the correct endpoint
            if user_type == "admin":
                login_endpoint = f"{BACKEND_URL}/admin-auth/login"
                profile_endpoint = f"{BACKEND_URL}/admin-auth/profile"
            else:
                login_endpoint = f"{BACKEND_URL}/auth/login"
                profile_endpoint = f"{BACKEND_URL}/auth/profile"
            
            # Test login
            login_data = {
                "email": email,
                "password": password
            }
            
            try:
                async with session.post(login_endpoint, json=login_data) as response:
                    response_text = await response.text()
                    
                    if response.status == 200:
                        try:
                            response_data = json.loads(response_text)
                            if "access_token" in response_data:
                                token = response_data["access_token"]
                                user_info = response_data.get("user" if user_type != "admin" else "admin", {})
                                
                                print(f"  ✅ Login successful")
                                print(f"  📧 Email: {user_info.get('email', 'N/A')}")
                                print(f"  🎫 Token: {token[:20]}...")
                                print(f"  👤 Role/Tier: {user_info.get('role' if user_type == 'admin' else 'membership_tier', 'N/A')}")
                                
                                # Test token validation
                                headers = {"Authorization": f"Bearer {token}"}
                                async with session.get(profile_endpoint, headers=headers) as profile_response:
                                    if profile_response.status == 200:
                                        profile_data = await profile_response.json()
                                        print(f"  ✅ Token validation successful")
                                        print(f"  📋 Profile: {profile_data.get('email', 'N/A')}")
                                    else:
                                        print(f"  ❌ Token validation failed: {profile_response.status}")
                                        print(f"  📄 Response: {await profile_response.text()}")
                            else:
                                print(f"  ❌ No access token in response")
                                print(f"  📄 Response: {response_data}")
                        except json.JSONDecodeError:
                            print(f"  ❌ Invalid JSON response")
                            print(f"  📄 Raw response: {response_text}")
                    else:
                        print(f"  ❌ Login failed: HTTP {response.status}")
                        print(f"  📄 Response: {response_text}")
                        
            except Exception as e:
                print(f"  ❌ Request failed: {str(e)}")

async def test_api_connectivity():
    """Test basic API connectivity."""
    print("\n🌐 Testing API Connectivity")
    print("=" * 30)
    
    endpoints_to_test = [
        "/health",
        "/",
        "/products"
    ]
    
    async with aiohttp.ClientSession() as session:
        for endpoint in endpoints_to_test:
            url = f"{BACKEND_URL}{endpoint}"
            try:
                async with session.get(url) as response:
                    if response.status == 200:
                        print(f"  ✅ {endpoint}: OK ({response.status})")
                    else:
                        print(f"  ❌ {endpoint}: Failed ({response.status})")
                        print(f"     Response: {await response.text()}")
            except Exception as e:
                print(f"  ❌ {endpoint}: Connection error - {str(e)}")

async def test_cors_configuration():
    """Test CORS configuration."""
    print("\n🔒 Testing CORS Configuration")
    print("=" * 30)
    
    async with aiohttp.ClientSession() as session:
        # Test preflight request
        headers = {
            "Origin": "https://statusapp-fix.preview.emergentagent.com",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "Content-Type,Authorization"
        }
        
        try:
            async with session.options(f"{BACKEND_URL}/auth/login", headers=headers) as response:
                cors_headers = {k: v for k, v in response.headers.items() if k.lower().startswith('access-control')}
                
                if response.status in [200, 204]:
                    print(f"  ✅ CORS preflight: OK ({response.status})")
                    for header, value in cors_headers.items():
                        print(f"     {header}: {value}")
                else:
                    print(f"  ❌ CORS preflight: Failed ({response.status})")
                    
        except Exception as e:
            print(f"  ❌ CORS test failed: {str(e)}")

async def main():
    """Run all tests."""
    await test_api_connectivity()
    await test_cors_configuration()
    await test_login_flow()
    
    print("\n" + "=" * 60)
    print("🎯 SUMMARY")
    print("=" * 60)
    print("If all login tests passed, the authentication system is working correctly.")
    print("If login tests failed, check:")
    print("1. Database connectivity")
    print("2. Password hashing/verification")
    print("3. JWT token generation")
    print("4. CORS configuration")

if __name__ == "__main__":
    asyncio.run(main())