#!/usr/bin/env python3
"""
Production URL Authentication Test for StatusXSmoakland
Tests authentication using the production URL from frontend/.env
"""

import asyncio
import aiohttp
import json
from datetime import datetime

# Configuration - Using production URL from frontend/.env
BACKEND_URL = "https://smoakland-auth.preview.emergentagent.com"

# Test credentials from review request
ADMIN_EMAIL = "admin@statusxsmoakland.com"
ADMIN_PASSWORD = "Admin123!"
PREMIUM_USER_EMAIL = "premium@demo.com"
PREMIUM_USER_PASSWORD = "Premium123!"
BASIC_USER_EMAIL = "basic@demo.com"
BASIC_USER_PASSWORD = "Basic123!"

class ProductionAuthTester:
    def __init__(self):
        self.session = None
        self.test_results = []
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    def log_test(self, test_name: str, success: bool, details: str = "", response_data = None):
        """Log test results."""
        result = {
            "test": test_name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat(),
            "response_data": response_data
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {details}")
        if response_data and not success:
            print(f"   Response: {json.dumps(response_data, indent=2)}")
    
    async def make_request(self, method: str, endpoint: str, data: dict = None, headers: dict = None) -> tuple:
        """Make HTTP request and return (success, response_data, status_code)."""
        url = f"{BACKEND_URL}{endpoint}"
        request_headers = {"Content-Type": "application/json"}
        
        if headers:
            request_headers.update(headers)
            
        try:
            async with self.session.request(
                method, 
                url, 
                json=data if data else None,
                headers=request_headers
            ) as response:
                try:
                    response_data = await response.json()
                except:
                    response_data = {"error": "Invalid JSON response", "text": await response.text()}
                
                return response.status < 400, response_data, response.status
                
        except Exception as e:
            return False, {"error": str(e)}, 0
    
    async def test_production_endpoints(self):
        """Test production endpoints with exact credentials from review request."""
        print("🎯 TESTING PRODUCTION URL AUTHENTICATION")
        print("=" * 60)
        print(f"Backend URL: {BACKEND_URL}")
        print()
        
        # Test 1: Health check
        print("=== TESTING API HEALTH CHECK ===")
        success, response, status = await self.make_request("GET", "/health")
        
        if success:
            self.log_test(
                "Production API Health Check", 
                True, 
                f"API is healthy: {response.get('message', 'Unknown')}"
            )
        else:
            self.log_test(
                "Production API Health Check", 
                False, 
                f"API health check failed (status {status}): {response}",
                response
            )
            return False
        
        # Test 2: Admin login
        print("\n=== TESTING ADMIN LOGIN ===")
        admin_login_data = {
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        }
        
        success, response, status = await self.make_request("POST", "/admin-auth/login", admin_login_data)
        
        if success and "access_token" in response:
            admin_info = response.get("admin", {})
            self.log_test(
                "Admin Login - Production", 
                True, 
                f"Successfully logged in as {admin_info.get('email', 'unknown')} with role {admin_info.get('role', 'unknown')}"
            )
        else:
            self.log_test(
                "Admin Login - Production", 
                False, 
                f"Login failed with status {status}: {response}",
                response
            )
        
        # Test 3: Premium user login
        print("\n=== TESTING PREMIUM USER LOGIN ===")
        premium_login_data = {
            "email": PREMIUM_USER_EMAIL,
            "password": PREMIUM_USER_PASSWORD
        }
        
        success, response, status = await self.make_request("POST", "/auth/login", premium_login_data)
        
        if success and "access_token" in response:
            user_info = response.get("user", {})
            self.log_test(
                "Premium User Login - Production", 
                True, 
                f"Successfully logged in as {user_info.get('email', 'unknown')} with tier {user_info.get('membership_tier', 'unknown')}"
            )
        else:
            self.log_test(
                "Premium User Login - Production", 
                False, 
                f"Login failed with status {status}: {response}",
                response
            )
        
        # Test 4: Basic user login
        print("\n=== TESTING BASIC USER LOGIN ===")
        basic_login_data = {
            "email": BASIC_USER_EMAIL,
            "password": BASIC_USER_PASSWORD
        }
        
        success, response, status = await self.make_request("POST", "/auth/login", basic_login_data)
        
        if success and "access_token" in response:
            user_info = response.get("user", {})
            self.log_test(
                "Basic User Login - Production", 
                True, 
                f"Successfully logged in as {user_info.get('email', 'unknown')} with tier {user_info.get('membership_tier', 'unknown')}"
            )
        else:
            self.log_test(
                "Basic User Login - Production", 
                False, 
                f"Login failed with status {status}: {response}",
                response
            )
        
        # Summary
        print("\n" + "=" * 60)
        print("🎯 PRODUCTION AUTHENTICATION TEST SUMMARY")
        print("=" * 60)
        
        passed_tests = [r for r in self.test_results if r["success"]]
        failed_tests = [r for r in self.test_results if not r["success"]]
        
        print(f"✅ PASSED: {len(passed_tests)}")
        print(f"❌ FAILED: {len(failed_tests)}")
        print(f"📊 SUCCESS RATE: {len(passed_tests)}/{len(self.test_results)} ({len(passed_tests)/len(self.test_results)*100:.1f}%)")
        
        if failed_tests:
            print("\n❌ FAILED TESTS:")
            for test in failed_tests:
                print(f"   - {test['test']}: {test['details']}")
        
        return len(failed_tests) == 0

async def main():
    """Main test runner for production URL."""
    async with ProductionAuthTester() as tester:
        success = await tester.test_production_endpoints()
        return success

if __name__ == "__main__":
    success = asyncio.run(main())
    exit(0 if success else 1)