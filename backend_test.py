#!/usr/bin/env python3
"""
Square Payment Integration Testing for StatusXSmoakland
Comprehensive testing of Square payment endpoints after Phase 2 SDK integration.
Focus: Square API connection, payment processing, digital wallet payments, and admin management.
"""

import asyncio
import aiohttp
import json
import os
from datetime import datetime
from typing import Dict, Any, Optional

# Configuration - Using deployed backend URL from frontend .env
BACKEND_URL = "https://statusx-cannabis-1.preview.emergentagent.com/api"

# Test credentials from review request
ADMIN_EMAIL = "admin@statusxsmoakland.com"
ADMIN_PASSWORD = "Admin123!"
PREMIUM_USER_EMAIL = "premium@demo.com"
PREMIUM_USER_PASSWORD = "Premium123!"

class SquarePaymentTester:
    def __init__(self):
        self.session = None
        self.admin_token = None
        self.premium_token = None
        self.test_results = []
        
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
    
    async def make_request(self, method: str, endpoint: str, data: Dict = None, headers: Dict = None) -> tuple:
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

    async def test_admin_authentication(self):
        """Test admin authentication."""
        print("\n=== TESTING ADMIN AUTHENTICATION ===")
        
        login_data = {
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        }
        
        success, response, status = await self.make_request("POST", "/admin-auth/login", login_data)
        
        if success and "access_token" in response:
            self.admin_token = response["access_token"]
            admin_info = response.get("admin", {})
            self.log_test(
                "Admin Login", 
                True, 
                f"Successfully logged in as {admin_info.get('email', 'unknown')} with role {admin_info.get('role', 'unknown')}"
            )
            return True
        else:
            self.log_test(
                "Admin Login", 
                False, 
                f"Login failed with status {status}: {response}",
                response
            )
            return False

    async def test_premium_user_authentication(self):
        """Test premium user authentication."""
        print("\n=== TESTING PREMIUM USER AUTHENTICATION ===")
        
        login_data = {
            "email": PREMIUM_USER_EMAIL,
            "password": PREMIUM_USER_PASSWORD
        }
        
        success, response, status = await self.make_request("POST", "/auth/login", login_data)
        
        if success and "access_token" in response:
            self.premium_token = response["access_token"]
            user_info = response.get("user", {})
            self.log_test(
                "Premium User Login", 
                True, 
                f"Successfully logged in as {user_info.get('email', 'unknown')} with tier {user_info.get('membership_tier', 'unknown')}"
            )
            return self.premium_token
        else:
            self.log_test(
                "Premium User Login", 
                False, 
                f"Login failed with status {status}: {response}",
                response
            )
            return None

    async def test_square_api_connection(self):
        """Test Square API connection and authentication."""
        print("\n=== TESTING SQUARE API CONNECTION ===")
        
        success, response, status = await self.make_request("POST", "/square/test-connection")
        
        if success and response.get("success"):
            locations = response.get("locations", [])
            self.log_test(
                "Square API Connection",
                True,
                f"Successfully connected to Square API with {len(locations)} locations"
            )
            
            # Log location details
            for location in locations:
                location_id = location.get("id")
                location_name = location.get("name", "Unknown")
                print(f"   Location: {location_name} (ID: {location_id})")
                
            return True
        else:
            self.log_test(
                "Square API Connection",
                False,
                f"Square API connection failed: {response}",
                response
            )
            return False

    async def test_square_order_creation(self):
        """Test Square order creation and payment processing."""
        print("\n=== TESTING SQUARE ORDER CREATION ===")
        
        if not self.premium_token:
            self.log_test("Square Order Creation", False, "No premium user token available")
            return None
        
        headers_user = {"Authorization": f"Bearer {self.premium_token}"}
        
        # Test order creation with proper Square payment data
        order_data = {
            "payment_source_id": "cnon:card-nonce-ok",  # Square test nonce
            "user_name": "Premium Demo User",
            "user_email": PREMIUM_USER_EMAIL,
            "items": [
                {
                    "product_id": "za-1",
                    "product_name": "Lemon Cherry Gelato",
                    "quantity": 1,
                    "unit_price": 2500,  # $25.00 in cents
                    "total_price": 2500
                }
            ],
            "pickup_notes": "Test order for Square integration"
        }
        
        success, response, status = await self.make_request(
            "POST", 
            "/square/create-order", 
            order_data, 
            headers_user
        )
        
        if success and response.get("success"):
            payment_id = response.get("payment_id")
            order_id = response.get("order_id")
            pickup_code = response.get("pickup_code")
            
            self.log_test(
                "Square Order Creation",
                True,
                f"Successfully created order: Payment ID {payment_id}, Order ID {order_id}, Pickup Code {pickup_code}"
            )
            
            # Verify pickup code format
            code_format_valid = pickup_code and pickup_code.startswith("P") and len(pickup_code) == 7
            self.log_test(
                "Square Payment Code Format",
                code_format_valid,
                f"Payment code format: {pickup_code} {'(valid P-prefix format)' if code_format_valid else '(invalid format)'}"
            )
            
            return {"payment_id": payment_id, "order_id": order_id, "pickup_code": pickup_code}
        else:
            self.log_test(
                "Square Order Creation",
                False,
                f"Square order creation failed: {response}",
                response
            )
            return None

    async def test_digital_wallet_payments(self):
        """Test Apple Pay and Google Pay integration."""
        print("\n=== TESTING DIGITAL WALLET PAYMENTS ===")
        
        if not self.premium_token:
            self.log_test("Digital Wallet Payments", False, "No premium user token available")
            return False
        
        headers_user = {"Authorization": f"Bearer {self.premium_token}"}
        
        # Test Apple Pay
        apple_pay_data = {
            "token": "mock_apple_pay_token_12345",
            "amount": 6500,  # $65.00 in cents
            "currency": "USD",
            "items": [
                {
                    "id": "za-1",
                    "name": "Lemon Cherry Gelato",
                    "price": 25.00,
                    "quantity": 1,
                    "tier": "za",
                    "category": "flower"
                },
                {
                    "id": "deps-1", 
                    "name": "Blue Dream",
                    "price": 20.00,
                    "quantity": 2,
                    "tier": "deps",
                    "category": "flower"
                }
            ],
            "buyer_details": {
                "name": "Premium Demo User",
                "email": PREMIUM_USER_EMAIL
            },
            "user_email": PREMIUM_USER_EMAIL
        }
        
        success, apple_response, status = await self.make_request(
            "POST", 
            "/payments/apple-pay", 
            apple_pay_data, 
            headers_user
        )
        
        apple_payment_id = None
        if success and apple_response.get("success"):
            apple_payment_id = apple_response.get("payment_id")
            apple_payment_code = apple_response.get("payment_code")
            
            self.log_test(
                "Apple Pay Payment Processing",
                True,
                f"Successfully processed Apple Pay payment: ID {apple_payment_id}, Code {apple_payment_code}, Amount ${apple_response.get('amount')}"
            )
        else:
            self.log_test(
                "Apple Pay Payment Processing",
                False,
                f"Apple Pay payment failed: {apple_response}",
                apple_response
            )
        
        # Test Google Pay
        google_pay_data = {
            "token": "mock_google_pay_token_67890",
            "amount": 3000,  # $30.00 in cents
            "currency": "USD",
            "items": [
                {
                    "id": "lows-1",
                    "name": "Northern Lights",
                    "price": 15.00,
                    "quantity": 2,
                    "tier": "lows",
                    "category": "flower"
                }
            ],
            "buyer_details": {
                "name": "Premium Demo User",
                "email": PREMIUM_USER_EMAIL
            },
            "user_email": PREMIUM_USER_EMAIL
        }
        
        success, google_response, status = await self.make_request(
            "POST", 
            "/payments/google-pay", 
            google_pay_data, 
            headers_user
        )
        
        if success and google_response.get("success"):
            google_payment_id = google_response.get("payment_id")
            google_payment_code = google_response.get("payment_code")
            
            self.log_test(
                "Google Pay Payment Processing",
                True,
                f"Successfully processed Google Pay payment: ID {google_payment_id}, Code {google_payment_code}, Amount ${google_response.get('amount')}"
            )
        else:
            self.log_test(
                "Google Pay Payment Processing",
                False,
                f"Google Pay payment failed: {google_response}",
                google_response
            )
        
        return apple_payment_id

    async def test_payment_status_endpoints(self):
        """Test payment status and history endpoints."""
        print("\n=== TESTING PAYMENT STATUS AND HISTORY ENDPOINTS ===")
        
        if not self.premium_token:
            self.log_test("Payment Status Endpoints", False, "No premium user token available")
            return False
        
        headers_user = {"Authorization": f"Bearer {self.premium_token}"}
        
        # Test digital wallet payment history
        success, history_response, status = await self.make_request(
            "GET", 
            "/payments/digital-wallet/history?limit=10", 
            headers=headers_user
        )
        
        if success and isinstance(history_response, list):
            self.log_test(
                "Digital Wallet Payment History",
                True,
                f"Retrieved {len(history_response)} payment history records"
            )
            
            # Test payment status lookup if we have payments
            if history_response:
                test_payment_id = history_response[0].get("payment_id")
                if test_payment_id:
                    success, status_response, status_code = await self.make_request(
                        "GET", 
                        f"/payments/digital-wallet/status/{test_payment_id}", 
                        headers=headers_user
                    )
                    
                    if success:
                        self.log_test(
                            "Payment Status Lookup",
                            True,
                            f"Retrieved status for payment {test_payment_id}: {status_response.get('status')}"
                        )
                    else:
                        self.log_test(
                            "Payment Status Lookup",
                            False,
                            f"Failed to get payment status: {status_response}",
                            status_response
                        )
        else:
            self.log_test(
                "Digital Wallet Payment History",
                False,
                f"Failed to retrieve payment history: {history_response}",
                history_response
            )

    async def test_admin_payment_management(self):
        """Test admin payment management endpoints."""
        print("\n=== TESTING ADMIN PAYMENT MANAGEMENT ===")
        
        if not self.admin_token:
            self.log_test("Admin Payment Management", False, "No admin token available")
            return False
        
        headers_admin = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Test get user Square orders
        if self.premium_token:
            headers_user = {"Authorization": f"Bearer {self.premium_token}"}
            success, user_orders_response, status = await self.make_request(
                "GET", 
                "/square/orders", 
                headers=headers_user
            )
            
            if success and isinstance(user_orders_response, list):
                self.log_test(
                    "User Square Orders",
                    True,
                    f"Retrieved {len(user_orders_response)} user Square orders"
                )
            else:
                self.log_test(
                    "User Square Orders",
                    False,
                    f"Failed to retrieve user orders: {user_orders_response}",
                    user_orders_response
                )
        
        # Test get all Square orders (admin view)
        success, orders_response, status = await self.make_request(
            "GET", 
            "/square/admin/orders", 
            headers=headers_admin
        )
        
        if success and "orders" in orders_response:
            orders = orders_response["orders"]
            self.log_test(
                "Admin Square Orders",
                True,
                f"Retrieved {len(orders)} Square orders for admin management"
            )
        else:
            self.log_test(
                "Admin Square Orders",
                False,
                f"Failed to retrieve admin orders: {orders_response}",
                orders_response
            )

    async def test_payment_lookup(self, pickup_code: str):
        """Test payment lookup functionality with actual pickup code."""
        print(f"\n=== TESTING PAYMENT LOOKUP WITH CODE {pickup_code} ===")
        
        if not self.admin_token:
            self.log_test("Payment Lookup", False, "No admin token available")
            return False
        
        headers_admin = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Test admin prepaid order lookup with actual code
        success, lookup_response, status = await self.make_request(
            "GET", 
            f"/admin/prepaid-orders/lookup/{pickup_code}", 
            headers=headers_admin
        )
        
        if success:
            self.log_test(
                "Payment Code Lookup",
                True,
                f"Successfully found order for pickup code {pickup_code}"
            )
            
            # Verify response structure
            required_fields = ["user_email", "total_amount", "items", "status", "created_at"]
            missing_fields = [field for field in required_fields if field not in lookup_response]
            
            self.log_test(
                "Payment Lookup Response Structure",
                len(missing_fields) == 0,
                f"Response structure {'complete' if not missing_fields else f'missing: {missing_fields}'}"
            )
        else:
            self.log_test(
                "Payment Code Lookup",
                False,
                f"Failed to find order for pickup code {pickup_code}: {lookup_response}",
                lookup_response
            )

    async def test_square_payment_details(self, payment_id: str):
        """Test Square payment details endpoint."""
        print(f"\n=== TESTING SQUARE PAYMENT DETAILS FOR {payment_id} ===")
        
        success, response, status = await self.make_request(
            "GET", 
            f"/square/payment/{payment_id}"
        )
        
        if success:
            self.log_test(
                "Square Payment Details",
                True,
                f"Retrieved payment details for {payment_id}: Status {response.get('status')}"
            )
        else:
            self.log_test(
                "Square Payment Details",
                False,
                f"Failed to get payment details: {response}",
                response
            )

async def main():
    """Run comprehensive Square payment integration tests."""
    print("🔍 STARTING COMPREHENSIVE SQUARE PAYMENT INTEGRATION TESTING")
    print("=" * 80)
    print(f"Backend URL: {BACKEND_URL}")
    print(f"Testing Premium User: {PREMIUM_USER_EMAIL}")
    print("FOCUS: Square API Connection, Payment Processing, Digital Wallets, Admin Management")
    print("=" * 80)
    
    async with SquarePaymentTester() as tester:
        # Test authentication systems (required for payment testing)
        print("\n🔐 TESTING AUTHENTICATION SYSTEMS")
        if not await tester.test_admin_authentication():
            print("\n❌ Admin authentication failed - some tests may not work")
        
        premium_token = await tester.test_premium_user_authentication()
        if not premium_token:
            print("\n❌ Premium user authentication failed - payment tests may not work")
            return
        
        # Test Square API connection
        print("\n🟦 TESTING SQUARE API CONNECTION")
        if not await tester.test_square_api_connection():
            print("\n❌ Square API connection failed - payment tests may not work")
        
        # Test Square order creation and payment processing
        print("\n💳 TESTING SQUARE PAYMENT PROCESSING")
        order_result = await tester.test_square_order_creation()
        
        # Test digital wallet payments (Apple Pay/Google Pay)
        print("\n📱 TESTING DIGITAL WALLET PAYMENTS")
        await tester.test_digital_wallet_payments()
        
        # Test payment status and history endpoints
        print("\n📊 TESTING PAYMENT STATUS AND HISTORY")
        await tester.test_payment_status_endpoints()
        
        # Test admin payment management
        print("\n👨‍💼 TESTING ADMIN PAYMENT MANAGEMENT")
        await tester.test_admin_payment_management()
        
        # Test payment lookup functionality
        if order_result and order_result.get("pickup_code"):
            print("\n🔍 TESTING PAYMENT LOOKUP")
            await tester.test_payment_lookup(order_result["pickup_code"])
        
        # Test Square payment details
        if order_result and order_result.get("payment_id"):
            await tester.test_square_payment_details(order_result["payment_id"])
        
        # Print summary
        print("\n" + "=" * 80)
        print("🎯 SQUARE PAYMENT INTEGRATION TESTING SUMMARY")
        print("=" * 80)
        
        total_tests = len(tester.test_results)
        passed_tests = sum(1 for result in tester.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests} ✅")
        print(f"Failed: {failed_tests} ❌")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print(f"\n❌ FAILED TESTS:")
            for result in tester.test_results:
                if not result["success"]:
                    print(f"   - {result['test']}: {result['details']}")
        
        print("\n🎉 SQUARE PAYMENT INTEGRATION TESTING COMPLETE!")
        
        return failed_tests == 0

if __name__ == "__main__":
    success = asyncio.run(main())
    exit(0 if success else 1)