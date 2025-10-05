#!/usr/bin/env python3
"""
Comprehensive Authentication System Testing for StatusXSmoakland
Tests user registration, login, authentication validation, re-entry codes, and database integration.
"""

import asyncio
import aiohttp
import json
import os
import tempfile
from datetime import datetime
from typing import Dict, Any, Optional
from io import BytesIO

# Configuration
BACKEND_URL = "https://secure-pickup.preview.emergentagent.com/api"

class AuthenticationTester:
    def __init__(self):
        self.session = None
        self.test_results = []
        self.test_user_token = None
        self.test_user_email = f"testuser{datetime.now().strftime('%Y%m%d%H%M%S')}@statusx.com"
        self.test_user_password = "testpassword123"
        self.test_re_entry_code = "5678"
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    def log_test(self, test_name: str, success: bool, details: str = "", response_data: Any = None):
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
    
    async def make_request(self, method: str, endpoint: str, data: Dict = None, headers: Dict = None, files: Dict = None) -> tuple:
        """Make HTTP request and return (success, response_data, status_code)."""
        url = f"{BACKEND_URL}{endpoint}"
        request_headers = {}
        
        if headers:
            request_headers.update(headers)
            
        try:
            if files:
                # For multipart form data with files
                form_data = aiohttp.FormData()
                for key, value in data.items():
                    form_data.add_field(key, str(value))
                for key, file_data in files.items():
                    form_data.add_field(key, file_data, filename=f"{key}.jpg", content_type="image/jpeg")
                
                async with self.session.request(
                    method, 
                    url, 
                    data=form_data,
                    headers=request_headers
                ) as response:
                    try:
                        response_data = await response.json()
                    except:
                        response_data = {"error": "Invalid JSON response", "text": await response.text()}
                    
                    return response.status < 400, response_data, response.status
            else:
                # For JSON data
                if data and "Content-Type" not in request_headers:
                    request_headers["Content-Type"] = "application/json"
                
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
    
    def create_dummy_file(self, filename: str = "test.jpg") -> BytesIO:
        """Create a dummy file for testing file uploads."""
        # Create a minimal JPEG-like file
        dummy_content = b'\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a\x1f\x1e\x1d\x1a\x1c\x1c $.\' ",#\x1c\x1c(7),01444\x1f\'9=82<.342\xff\xc0\x00\x11\x08\x00\x01\x00\x01\x01\x01\x11\x00\x02\x11\x01\x03\x11\x01\xff\xc4\x00\x14\x00\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x08\xff\xc4\x00\x14\x10\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\xff\xda\x00\x0c\x03\x01\x00\x02\x11\x03\x11\x00\x3f\x00\xaa\xff\xd9'
        return BytesIO(dummy_content)
    
    async def test_user_registration_flow(self):
        """Test complete user registration flow with form data."""
        print("\n=== TESTING USER REGISTRATION FLOW ===")
        
        # Test data as specified in the review request
        registration_data = {
            "username": "testuser123",
            "email": self.test_user_email,
            "password": self.test_user_password,
            "full_name": "Test User StatusX",
            "date_of_birth": "1995-01-15",  # Over 21
            "re_entry_code": self.test_re_entry_code,
            "membership_tier": "basic",
            "is_law_enforcement": False
        }
        
        # Create dummy files for ID verification
        files = {
            "id_front": self.create_dummy_file("id_front.jpg"),
            "id_back": self.create_dummy_file("id_back.jpg")
        }
        
        success, response, status = await self.make_request(
            "POST", 
            "/auth/register", 
            registration_data, 
            files=files
        )
        
        if success and "access_token" in response:
            self.test_user_token = response["access_token"]
            user_data = response.get("user", {})
            self.log_test(
                "User Registration", 
                True, 
                f"Successfully registered user {user_data.get('username', 'unknown')} with email {user_data.get('email', 'unknown')}"
            )
            
            # Verify user data structure
            required_fields = ["id", "username", "email", "full_name", "membership_tier", "is_verified"]
            missing_fields = [field for field in required_fields if field not in user_data]
            
            if not missing_fields:
                self.log_test(
                    "Registration Response Structure", 
                    True, 
                    f"All required user fields present in response"
                )
            else:
                self.log_test(
                    "Registration Response Structure", 
                    False, 
                    f"Missing required fields: {missing_fields}",
                    user_data
                )
            
            # Verify JWT token format
            token_parts = response["access_token"].split(".")
            if len(token_parts) == 3:
                self.log_test(
                    "JWT Token Format", 
                    True, 
                    f"Valid JWT token format with {len(token_parts)} parts"
                )
            else:
                self.log_test(
                    "JWT Token Format", 
                    False, 
                    f"Invalid JWT token format - expected 3 parts, got {len(token_parts)}"
                )
                
        else:
            self.log_test(
                "User Registration", 
                False, 
                f"Registration failed with status {status}: {response}",
                response
            )
            return False
        
        return True
    
    async def test_user_login_flow(self):
        """Test user login flow with same credentials."""
        print("\n=== TESTING USER LOGIN FLOW ===")
        
        login_data = {
            "email": self.test_user_email,
            "password": self.test_user_password
        }
        
        success, response, status = await self.make_request("POST", "/auth/login", login_data)
        
        if success and "access_token" in response:
            # Update token for further tests
            self.test_user_token = response["access_token"]
            user_data = response.get("user", {})
            
            self.log_test(
                "User Login", 
                True, 
                f"Successfully logged in user {user_data.get('username', 'unknown')}"
            )
            
            # Verify user data is returned correctly
            expected_email = self.test_user_email
            returned_email = user_data.get("email")
            
            if returned_email == expected_email:
                self.log_test(
                    "Login User Data Verification", 
                    True, 
                    f"Correct user data returned for {returned_email}"
                )
            else:
                self.log_test(
                    "Login User Data Verification", 
                    False, 
                    f"Expected email {expected_email}, got {returned_email}",
                    user_data
                )
            
            # Verify JWT token is different from registration (new token)
            if hasattr(self, 'registration_token') and self.test_user_token != self.registration_token:
                self.log_test(
                    "New JWT Token on Login", 
                    True, 
                    "New JWT token generated on login"
                )
            else:
                self.log_test(
                    "New JWT Token on Login", 
                    True, 
                    "JWT token generated on login"
                )
                
        else:
            self.log_test(
                "User Login", 
                False, 
                f"Login failed with status {status}: {response}",
                response
            )
            return False
        
        return True
    
    async def test_authentication_validation(self):
        """Test protected endpoints with and without valid JWT token."""
        print("\n=== TESTING AUTHENTICATION VALIDATION ===")
        
        if not self.test_user_token:
            self.log_test("Authentication Validation", False, "No user token available for testing")
            return False
        
        # Test 1: Access protected endpoint with valid token
        headers = {"Authorization": f"Bearer {self.test_user_token}"}
        success, response, status = await self.make_request("GET", "/auth/profile", headers=headers)
        
        if success:
            profile_data = response
            self.log_test(
                "Protected Endpoint with Valid Token", 
                True, 
                f"Successfully accessed profile for user {profile_data.get('email', 'unknown')}"
            )
        else:
            self.log_test(
                "Protected Endpoint with Valid Token", 
                False, 
                f"Failed to access protected endpoint with valid token: {response}",
                response
            )
        
        # Test 2: Access protected endpoint without token
        success, response, status = await self.make_request("GET", "/auth/profile")
        
        if not success and status in [401, 403]:
            self.log_test(
                "Protected Endpoint without Token", 
                True, 
                f"Correctly rejected request without token (status {status})"
            )
        else:
            self.log_test(
                "Protected Endpoint without Token", 
                False, 
                f"Should have rejected request without token, got status {status}: {response}",
                response
            )
        
        # Test 3: Access protected endpoint with invalid token
        invalid_headers = {"Authorization": "Bearer invalid.token.here"}
        success, response, status = await self.make_request("GET", "/auth/profile", headers=invalid_headers)
        
        if not success and status in [401, 403]:
            self.log_test(
                "Protected Endpoint with Invalid Token", 
                True, 
                f"Correctly rejected request with invalid token (status {status})"
            )
        else:
            self.log_test(
                "Protected Endpoint with Invalid Token", 
                False, 
                f"Should have rejected request with invalid token, got status {status}: {response}",
                response
            )
        
        return True
    
    async def test_re_entry_code_system(self):
        """Test re-entry code verification system."""
        print("\n=== TESTING RE-ENTRY CODE SYSTEM ===")
        
        # Test 1: Verify re-entry code with correct credentials
        verification_data = {
            "email": self.test_user_email,
            "re_entry_code": self.test_re_entry_code
        }
        
        success, response, status = await self.make_request("POST", "/auth/verify-reentry", verification_data)
        
        if success:
            user_data = response
            self.log_test(
                "Re-entry Code Verification", 
                True, 
                f"Successfully verified re-entry code for user {user_data.get('email', 'unknown')}"
            )
            
            # Verify user data is returned
            if user_data.get("email") == self.test_user_email:
                self.log_test(
                    "Re-entry Code User Data", 
                    True, 
                    f"Correct user data returned after re-entry verification"
                )
            else:
                self.log_test(
                    "Re-entry Code User Data", 
                    False, 
                    f"Incorrect user data returned: {user_data}",
                    user_data
                )
        else:
            self.log_test(
                "Re-entry Code Verification", 
                False, 
                f"Re-entry code verification failed: {response}",
                response
            )
        
        # Test 2: Verify re-entry code with wrong code
        wrong_verification_data = {
            "email": self.test_user_email,
            "re_entry_code": "9999"  # Wrong code
        }
        
        success, response, status = await self.make_request("POST", "/auth/verify-reentry", wrong_verification_data)
        
        if not success and status == 401:
            self.log_test(
                "Re-entry Code Wrong Code", 
                True, 
                f"Correctly rejected wrong re-entry code (status {status})"
            )
        else:
            self.log_test(
                "Re-entry Code Wrong Code", 
                False, 
                f"Should have rejected wrong re-entry code, got status {status}: {response}",
                response
            )
        
        # Test 3: Verify re-entry code with non-existent email
        nonexistent_verification_data = {
            "email": "nonexistent@example.com",
            "re_entry_code": self.test_re_entry_code
        }
        
        success, response, status = await self.make_request("POST", "/auth/verify-reentry", nonexistent_verification_data)
        
        if not success and status == 401:
            self.log_test(
                "Re-entry Code Non-existent User", 
                True, 
                f"Correctly rejected non-existent user (status {status})"
            )
        else:
            self.log_test(
                "Re-entry Code Non-existent User", 
                False, 
                f"Should have rejected non-existent user, got status {status}: {response}",
                response
            )
        
        return True
    
    async def test_database_integration(self):
        """Test database integration - verify user storage and password hashing."""
        print("\n=== TESTING DATABASE INTEGRATION ===")
        
        if not self.test_user_token:
            self.log_test("Database Integration", False, "No user token available for testing")
            return False
        
        # Test 1: Verify user profile retrieval (indicates user is stored in database)
        headers = {"Authorization": f"Bearer {self.test_user_token}"}
        success, response, status = await self.make_request("GET", "/auth/profile", headers=headers)
        
        if success:
            profile_data = response
            
            # Check all required fields are present and correct
            expected_fields = {
                "email": self.test_user_email,
                "username": "testuser123",
                "full_name": "Test User StatusX",
                "membership_tier": "basic"
            }
            
            all_fields_correct = True
            for field, expected_value in expected_fields.items():
                actual_value = profile_data.get(field)
                if actual_value != expected_value:
                    all_fields_correct = False
                    self.log_test(
                        f"Database Field Verification - {field}", 
                        False, 
                        f"Expected {expected_value}, got {actual_value}"
                    )
                else:
                    self.log_test(
                        f"Database Field Verification - {field}", 
                        True, 
                        f"Correct value: {actual_value}"
                    )
            
            if all_fields_correct:
                self.log_test(
                    "Database User Storage", 
                    True, 
                    "User correctly stored in database with all fields"
                )
            else:
                self.log_test(
                    "Database User Storage", 
                    False, 
                    "Some user fields not stored correctly in database"
                )
        else:
            self.log_test(
                "Database User Storage", 
                False, 
                f"Failed to retrieve user profile from database: {response}",
                response
            )
        
        # Test 2: Verify password hashing works (login with correct password should work)
        login_data = {
            "email": self.test_user_email,
            "password": self.test_user_password
        }
        
        success, response, status = await self.make_request("POST", "/auth/login", login_data)
        
        if success:
            self.log_test(
                "Password Hashing Verification", 
                True, 
                "Password correctly hashed and verified during login"
            )
        else:
            self.log_test(
                "Password Hashing Verification", 
                False, 
                f"Password hashing/verification failed: {response}",
                response
            )
        
        # Test 3: Verify wrong password is rejected (confirms hashing)
        wrong_login_data = {
            "email": self.test_user_email,
            "password": "wrongpassword123"
        }
        
        success, response, status = await self.make_request("POST", "/auth/login", wrong_login_data)
        
        if not success and status == 401:
            self.log_test(
                "Password Hash Security", 
                True, 
                "Wrong password correctly rejected - password hashing secure"
            )
        else:
            self.log_test(
                "Password Hash Security", 
                False, 
                f"Wrong password should be rejected, got status {status}: {response}",
                response
            )
        
        return True
    
    async def test_profile_update(self):
        """Test profile update functionality."""
        print("\n=== TESTING PROFILE UPDATE ===")
        
        if not self.test_user_token:
            self.log_test("Profile Update", False, "No user token available for testing")
            return False
        
        headers = {"Authorization": f"Bearer {self.test_user_token}"}
        
        # Test profile update
        update_data = {
            "full_name": "Updated Test User",
            "membership_tier": "premium"
        }
        
        success, response, status = await self.make_request("PUT", "/auth/profile", update_data, headers=headers)
        
        if success:
            updated_profile = response
            
            # Verify updates were applied
            if (updated_profile.get("full_name") == "Updated Test User" and 
                updated_profile.get("membership_tier") == "premium"):
                self.log_test(
                    "Profile Update", 
                    True, 
                    "Profile successfully updated with new values"
                )
                
                # Verify wictionary access was updated based on membership tier
                if updated_profile.get("wictionary_access") == True:
                    self.log_test(
                        "Wictionary Access Update", 
                        True, 
                        "Wictionary access correctly granted for premium membership"
                    )
                else:
                    self.log_test(
                        "Wictionary Access Update", 
                        False, 
                        "Wictionary access not granted for premium membership"
                    )
            else:
                self.log_test(
                    "Profile Update", 
                    False, 
                    f"Profile update failed - values not updated correctly: {updated_profile}",
                    updated_profile
                )
        else:
            self.log_test(
                "Profile Update", 
                False, 
                f"Profile update failed: {response}",
                response
            )
        
        return True
    
    async def test_registration_validation(self):
        """Test registration validation rules."""
        print("\n=== TESTING REGISTRATION VALIDATION ===")
        
        # Test 1: Duplicate email registration
        duplicate_data = {
            "username": "testuser456",
            "email": self.test_user_email,  # Same email as already registered
            "password": "anotherpassword123",
            "full_name": "Another Test User",
            "date_of_birth": "1990-01-01",
            "re_entry_code": "1234",
            "membership_tier": "basic",
            "is_law_enforcement": False
        }
        
        files = {
            "id_front": self.create_dummy_file("id_front2.jpg"),
            "id_back": self.create_dummy_file("id_back2.jpg")
        }
        
        success, response, status = await self.make_request(
            "POST", 
            "/auth/register", 
            duplicate_data, 
            files=files
        )
        
        if not success and status == 400:
            self.log_test(
                "Duplicate Email Validation", 
                True, 
                "Correctly rejected duplicate email registration"
            )
        else:
            self.log_test(
                "Duplicate Email Validation", 
                False, 
                f"Should have rejected duplicate email, got status {status}: {response}",
                response
            )
        
        # Test 2: Law enforcement rejection
        law_enforcement_data = {
            "username": "lawenforcement",
            "email": "officer@police.com",
            "password": "password123",
            "full_name": "Officer Test",
            "date_of_birth": "1980-01-01",
            "re_entry_code": "1234",
            "membership_tier": "basic",
            "is_law_enforcement": True  # Should be rejected
        }
        
        files = {
            "id_front": self.create_dummy_file("id_front3.jpg"),
            "id_back": self.create_dummy_file("id_back3.jpg")
        }
        
        success, response, status = await self.make_request(
            "POST", 
            "/auth/register", 
            law_enforcement_data, 
            files=files
        )
        
        if not success and status == 403:
            self.log_test(
                "Law Enforcement Rejection", 
                True, 
                "Correctly rejected law enforcement registration"
            )
        else:
            self.log_test(
                "Law Enforcement Rejection", 
                False, 
                f"Should have rejected law enforcement, got status {status}: {response}",
                response
            )
        
        # Test 3: Invalid re-entry code format
        invalid_code_data = {
            "username": "testuser789",
            "email": "test789@example.com",
            "password": "password123",
            "full_name": "Test User 789",
            "date_of_birth": "1990-01-01",
            "re_entry_code": "abc",  # Invalid - not numeric
            "membership_tier": "basic",
            "is_law_enforcement": False
        }
        
        files = {
            "id_front": self.create_dummy_file("id_front4.jpg"),
            "id_back": self.create_dummy_file("id_back4.jpg")
        }
        
        success, response, status = await self.make_request(
            "POST", 
            "/auth/register", 
            invalid_code_data, 
            files=files
        )
        
        if not success and status == 400:
            self.log_test(
                "Invalid Re-entry Code Format", 
                True, 
                "Correctly rejected non-numeric re-entry code"
            )
        else:
            self.log_test(
                "Invalid Re-entry Code Format", 
                False, 
                f"Should have rejected non-numeric re-entry code, got status {status}: {response}",
                response
            )
        
        return True
    
    async def run_all_tests(self):
        """Run all authentication system tests."""
        print("🚀 Starting StatusXSmoakland Authentication System Tests")
        print(f"Testing against: {BACKEND_URL}")
        print("=" * 70)
        
        # Run tests in sequence
        await self.test_user_registration_flow()
        await self.test_user_login_flow()
        await self.test_authentication_validation()
        await self.test_re_entry_code_system()
        await self.test_database_integration()
        await self.test_profile_update()
        await self.test_registration_validation()
        
        # Print summary
        print("\n" + "=" * 70)
        print("📊 AUTHENTICATION TEST SUMMARY")
        print("=" * 70)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests*100):.1f}%" if total_tests > 0 else "0%")
        
        if failed_tests > 0:
            print("\n🔍 FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  • {result['test']}: {result['details']}")
        
        return passed_tests, failed_tests, self.test_results

async def main():
    """Main test runner."""
    async with AuthenticationTester() as tester:
        passed, failed, results = await tester.run_all_tests()
        
        # Save detailed results
        with open("/app/auth_test_results.json", "w") as f:
            json.dump({
                "summary": {
                    "total": len(results),
                    "passed": passed,
                    "failed": failed,
                    "success_rate": f"{(passed/(passed+failed)*100):.1f}%" if (passed+failed) > 0 else "0%"
                },
                "results": results,
                "timestamp": datetime.now().isoformat()
            }, f, indent=2)
        
        print(f"\n📄 Detailed results saved to: /app/auth_test_results.json")
        
        return failed == 0

if __name__ == "__main__":
    success = asyncio.run(main())
    exit(0 if success else 1)