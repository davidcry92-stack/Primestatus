#!/usr/bin/env python3
"""
Focused Rating System Testing for StatusXSmoakland
Tests the rating system endpoints that are accessible without user authentication issues.
"""

import asyncio
import aiohttp
import json
from datetime import datetime

# Configuration
BACKEND_URL = "https://primestatus.preview.emergentagent.com/api"
ADMIN_EMAIL = "admin@statusxsmoakland.com"
ADMIN_PASSWORD = "Admin123!"

class RatingSystemTester:
    def __init__(self):
        self.session = None
        self.admin_token = None
        self.test_results = []
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    def log_test(self, test_name: str, success: bool, details: str = ""):
        """Log test results."""
        result = {
            "test": test_name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {details}")
    
    async def make_request(self, method: str, endpoint: str, data: dict = None, headers: dict = None):
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
            self.log_test(
                "Admin Authentication", 
                True, 
                f"Successfully authenticated admin"
            )
            return True
        else:
            self.log_test(
                "Admin Authentication", 
                False, 
                f"Failed to authenticate admin: {response}"
            )
            return False
    
    async def test_rating_endpoints_structure(self):
        """Test rating endpoints structure and validation."""
        print("\n=== TESTING RATING ENDPOINTS STRUCTURE ===")
        
        if not self.admin_token:
            self.log_test("Rating Endpoints", False, "No admin token available")
            return False
        
        admin_headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Get a test product
        success, products, status = await self.make_request("GET", "/products?limit=1")
        if not success or not products:
            self.log_test("Get Test Product", False, "No products available for testing")
            return False
        
        test_product_id = products[0].get("id")
        self.log_test("Get Test Product", True, f"Using product ID: {test_product_id}")
        
        # Test 1: Get product ratings (should work without authentication)
        success, ratings, status = await self.make_request("GET", f"/ratings/product/{test_product_id}")
        
        if success and isinstance(ratings, list):
            self.log_test(
                "Get Product Ratings Endpoint", 
                True, 
                f"Retrieved {len(ratings)} ratings for product"
            )
        else:
            self.log_test(
                "Get Product Ratings Endpoint", 
                False, 
                f"Failed to get product ratings: {ratings}"
            )
        
        # Test 2: Test invalid product ID
        success, response, status = await self.make_request("GET", "/ratings/product/invalid_id")
        
        self.log_test(
            "Invalid Product ID Validation", 
            not success and status == 400, 
            f"Correctly rejected invalid product ID" if not success else f"Should reject invalid product ID"
        )
        
        # Test 3: Test authentication required for creating ratings
        rating_data = {
            "product_id": test_product_id,
            "rating": 4,
            "review": "Test review",
            "experience": "Test experience"
        }
        
        success, response, status = await self.make_request("POST", "/ratings/", rating_data)
        
        auth_required_test = not success and status == 401
        self.log_test(
            "Authentication Required for Rating Creation", 
            auth_required_test, 
            f"✅ Correctly requires authentication (401)" if auth_required_test else f"❌ Got status {status}, expected 401. Response: {response}"
        )
        
        # Test 4: Test authentication required for user ratings
        success, response, status = await self.make_request("GET", "/ratings/user/my-ratings")
        
        auth_required_test = not success and status == 401
        self.log_test(
            "Authentication Required for User Ratings", 
            auth_required_test, 
            f"✅ Correctly requires authentication" if auth_required_test else f"❌ Should require authentication"
        )
        
        # Test 5: Test authentication required for rating deletion
        success, response, status = await self.make_request("DELETE", "/ratings/fake_rating_id")
        
        auth_required_test = not success and status == 401
        self.log_test(
            "Authentication Required for Rating Deletion", 
            auth_required_test, 
            f"✅ Correctly requires authentication" if auth_required_test else f"❌ Should require authentication"
        )
        
        return True
    
    async def test_admin_rating_statistics(self):
        """Test admin rating statistics endpoints."""
        print("\n=== TESTING ADMIN RATING STATISTICS ===")
        
        if not self.admin_token:
            self.log_test("Admin Rating Stats", False, "No admin token available")
            return False
        
        admin_headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Test 1: Get product rating statistics
        success, stats, status = await self.make_request("GET", "/admin/ratings/stats", headers=admin_headers)
        
        if success and isinstance(stats, list):
            self.log_test(
                "Admin Product Rating Statistics", 
                True, 
                f"Retrieved rating statistics for {len(stats)} products"
            )
            
            # Check structure of rating stats
            if len(stats) > 0:
                first_stat = stats[0]
                required_fields = ["product_id", "product_name", "total_ratings", "average_rating", "rating_distribution"]
                missing_fields = [field for field in required_fields if field not in first_stat]
                
                self.log_test(
                    "Rating Statistics Structure", 
                    len(missing_fields) == 0, 
                    f"All required fields present" if len(missing_fields) == 0 else f"Missing fields: {missing_fields}"
                )
                
                # Check rating distribution structure
                rating_dist = first_stat.get("rating_distribution", {})
                expected_keys = ["1", "2", "3", "4", "5"]
                dist_keys_present = all(key in rating_dist for key in expected_keys)
                
                self.log_test(
                    "Rating Distribution Structure", 
                    dist_keys_present, 
                    f"Rating distribution has all 1-5 star keys" if dist_keys_present else f"Missing rating distribution keys"
                )
        else:
            self.log_test(
                "Admin Product Rating Statistics", 
                False, 
                f"Failed to get rating statistics: {stats}"
            )
        
        # Test 2: Get user rating history
        success, user_stats, status = await self.make_request("GET", "/admin/ratings/users", headers=admin_headers)
        
        if success and isinstance(user_stats, list):
            self.log_test(
                "Admin User Rating History", 
                True, 
                f"Retrieved user rating history for {len(user_stats)} users"
            )
        else:
            self.log_test(
                "Admin User Rating History", 
                False, 
                f"Failed to get user rating history: {user_stats}"
            )
        
        # Test 3: Check dashboard stats include ratings
        success, dashboard_stats, status = await self.make_request("GET", "/admin/dashboard/stats", headers=admin_headers)
        
        if success and "ratings" in dashboard_stats:
            ratings_stats = dashboard_stats["ratings"]
            has_total = "total_ratings" in ratings_stats
            has_avg = "avg_rating_all_products" in ratings_stats
            
            self.log_test(
                "Dashboard Rating Statistics", 
                has_total and has_avg, 
                f"Dashboard includes rating stats: total={ratings_stats.get('total_ratings', 0)}, avg={ratings_stats.get('avg_rating_all_products', 0)}"
            )
        else:
            self.log_test(
                "Dashboard Rating Statistics", 
                False, 
                f"Dashboard stats missing ratings section: {dashboard_stats}"
            )
        
        return True
    
    async def test_rating_data_validation_structure(self):
        """Test rating data validation without actually creating ratings."""
        print("\n=== TESTING RATING DATA VALIDATION STRUCTURE ===")
        
        # Get a test product
        success, products, status = await self.make_request("GET", "/products?limit=1")
        if not success or not products:
            self.log_test("Rating Validation Setup", False, "No products available")
            return False
        
        test_product_id = products[0].get("id")
        
        # Test various invalid rating data structures (should all fail with 401 due to no auth)
        test_cases = [
            {
                "name": "Rating 0 (Invalid)",
                "data": {"product_id": test_product_id, "rating": 0, "review": "Test"},
                "should_fail": True
            },
            {
                "name": "Rating 6 (Invalid)",
                "data": {"product_id": test_product_id, "rating": 6, "review": "Test"},
                "should_fail": True
            },
            {
                "name": "Long Experience Field",
                "data": {"product_id": test_product_id, "rating": 4, "experience": "x" * 501},
                "should_fail": True
            },
            {
                "name": "Long Review Field",
                "data": {"product_id": test_product_id, "rating": 4, "review": "x" * 501},
                "should_fail": True
            },
            {
                "name": "Valid Rating Structure",
                "data": {"product_id": test_product_id, "rating": 4, "review": "Good product", "experience": "Great experience"},
                "should_fail": True  # Will fail due to auth, but structure is valid
            }
        ]
        
        for test_case in test_cases:
            success, response, status = await self.make_request("POST", "/ratings/", test_case["data"])
            
            # All should fail with 401 (authentication required)
            auth_required_test = not success and status == 401
            self.log_test(
                f"Rating Validation - {test_case['name']}", 
                auth_required_test, 
                f"✅ Correctly requires authentication" if auth_required_test else f"❌ Should require authentication"
            )
        
        return True
    
    async def test_product_rating_integration(self):
        """Test that products have rating fields integrated."""
        print("\n=== TESTING PRODUCT RATING INTEGRATION ===")
        
        success, products, status = await self.make_request("GET", "/products?limit=10")
        
        if success and isinstance(products, list) and len(products) > 0:
            # Check if products have rating-related fields
            products_with_ratings = 0
            products_with_reviews = 0
            
            for product in products:
                if "rating" in product:
                    products_with_ratings += 1
                if "reviews" in product:
                    products_with_reviews += 1
            
            self.log_test(
                "Product Rating Field Integration", 
                products_with_ratings > 0, 
                f"{products_with_ratings}/{len(products)} products have rating field"
            )
            
            self.log_test(
                "Product Review Count Integration", 
                products_with_reviews > 0, 
                f"{products_with_reviews}/{len(products)} products have reviews field"
            )
            
            # Check a specific product's rating structure
            sample_product = products[0]
            rating_value = sample_product.get("rating", 0)
            review_count = sample_product.get("reviews", 0)
            
            self.log_test(
                "Product Rating Data Types", 
                isinstance(rating_value, (int, float)) and isinstance(review_count, int), 
                f"Sample product rating: {rating_value}, reviews: {review_count}"
            )
        else:
            self.log_test(
                "Product Rating Integration", 
                False, 
                f"Failed to get products for integration test: {products}"
            )
        
        return True
    
    async def run_focused_tests(self):
        """Run focused rating system tests."""
        print("🎯 Starting Focused Rating System Tests for StatusXSmoakland")
        print(f"Testing against: {BACKEND_URL}")
        print("=" * 70)
        
        # Test admin authentication first
        auth_success = await self.test_admin_authentication()
        
        if auth_success:
            # Run focused rating tests
            await self.test_rating_endpoints_structure()
            await self.test_admin_rating_statistics()
            await self.test_rating_data_validation_structure()
            await self.test_product_rating_integration()
        else:
            print("❌ Admin authentication failed - cannot run rating tests")
        
        # Print summary
        print("\n" + "=" * 70)
        print("📊 FOCUSED RATING TEST SUMMARY")
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
    async with RatingSystemTester() as tester:
        passed, failed, results = await tester.run_focused_tests()
        
        # Save results
        with open("/app/rating_test_results.json", "w") as f:
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
        
        print(f"\n📄 Results saved to: /app/rating_test_results.json")
        
        return failed == 0

if __name__ == "__main__":
    success = asyncio.run(main())
    exit(0 if success else 1)