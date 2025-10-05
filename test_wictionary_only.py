#!/usr/bin/env python3
"""
Test only the Wictionary comprehensive strain definitions
"""

import asyncio
import aiohttp
import json
from datetime import datetime

# Configuration
BACKEND_URL = "https://secure-pickup.preview.emergentagent.com/api"
ADMIN_EMAIL = "admin@statusxsmoakland.com"
ADMIN_PASSWORD = "Admin123!"

class WictionaryTester:
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
    
    async def authenticate_admin(self):
        """Authenticate as admin."""
        login_data = {
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        }
        
        success, response, status = await self.make_request("POST", "/admin-auth/login", login_data)
        
        if success and "access_token" in response:
            self.admin_token = response["access_token"]
            return True
        return False
    
    async def test_comprehensive_wictionary(self):
        """Test the comprehensive Wictionary strain definitions."""
        print("\n🌿 TESTING WICTIONARY COMPREHENSIVE STRAIN DEFINITIONS")
        print("=" * 60)
        
        if not await self.authenticate_admin():
            self.log_test("Admin Authentication", False, "Failed to authenticate admin")
            return
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Test 1: GET /api/wictionary/ to check total terms
        success, response, status = await self.make_request("GET", "/wictionary/", headers=headers)
        
        if success and isinstance(response, list):
            total_terms = len(response)
            self.log_test(
                "Total Terms Count", 
                total_terms >= 40, 
                f"Retrieved {total_terms} terms (expected 40+)"
            )
            
            # Test 2: Search for specific strains
            specific_strains = ['Lemon Cherry Gelato', 'Granddaddy Purple', 'Northern Lights', 'Gary Payton']
            found_strains = []
            
            for strain in specific_strains:
                success, search_response, status = await self.make_request(
                    "GET", 
                    f"/wictionary/search?q={strain}", 
                    headers=headers
                )
                
                if success and isinstance(search_response, list):
                    found_strain = any(strain.lower() in term.get('term', '').lower() for term in search_response)
                    if found_strain:
                        found_strains.append(strain)
                        # Show the found strain details
                        for term in search_response:
                            if strain.lower() in term.get('term', '').lower():
                                definition = term.get('definition', '')[:150] + '...' if len(term.get('definition', '')) > 150 else term.get('definition', '')
                                print(f"    Found: {term.get('term')} - {definition}")
                                break
                    
                    self.log_test(
                        f"Search: {strain}", 
                        found_strain, 
                        f"{'Found ✅' if found_strain else 'Not found ❌'}"
                    )
            
            # Test 3: Check comprehensive data quality
            comprehensive_count = 0
            for term in response:
                definition = term.get('definition', '')
                has_thc = 'thc:' in definition.lower() or '%' in definition
                has_effects = 'effects:' in definition.lower()
                has_taste = 'taste:' in definition.lower() or 'flavor' in definition.lower()
                has_ailments = 'helps with' in definition.lower()
                
                if has_thc and has_effects and has_taste and has_ailments:
                    comprehensive_count += 1
            
            self.log_test(
                "Comprehensive Data Quality", 
                comprehensive_count >= 20, 
                f"Found {comprehensive_count} strains with THC, effects, taste, and ailments data"
            )
            
            # Test 4: Category filtering
            categories = [
                ('culture', 'Za strains'),
                ('science', 'Deps strains'), 
                ('legal', 'Lows strains'),
                ('slang', 'tier definitions')
            ]
            
            for category, description in categories:
                success, cat_response, status = await self.make_request(
                    "GET", 
                    f"/wictionary/?category={category}", 
                    headers=headers
                )
                
                if success and isinstance(cat_response, list):
                    self.log_test(
                        f"Category: {category} ({description})", 
                        len(cat_response) > 0, 
                        f"Found {len(cat_response)} terms"
                    )
                    
                    # Show sample terms from each category
                    if len(cat_response) > 0:
                        sample_terms = cat_response[:3]  # Show first 3 terms
                        print(f"    Sample {description}:")
                        for term in sample_terms:
                            term_name = term.get('term', 'Unknown')
                            definition = term.get('definition', '')[:100] + '...' if len(term.get('definition', '')) > 100 else term.get('definition', '')
                            print(f"      • {term_name}: {definition}")
            
            # Test 5: Stats verification
            success, stats_response, status = await self.make_request("GET", "/wictionary/stats", headers=headers)
            
            if success and 'categories' in stats_response:
                categories = stats_response['categories']
                total_strain_terms = sum(categories.values())
                
                self.log_test(
                    "Stats Verification", 
                    total_strain_terms >= 40, 
                    f"Total: {total_strain_terms} terms across categories: {categories}"
                )
            
            # Final assessment
            is_comprehensive = (
                total_terms >= 40 and 
                comprehensive_count >= 20 and 
                len(found_strains) >= 3
            )
            
            self.log_test(
                "🎯 COMPREHENSIVE ASSESSMENT", 
                is_comprehensive, 
                f"{'✅ SUCCESS: Comprehensive strain definitions properly seeded' if is_comprehensive else '❌ FAILED: Comprehensive strain definitions not properly seeded'}"
            )
            
            print(f"\n📊 SUMMARY:")
            print(f"  • Total terms: {total_terms}")
            print(f"  • Comprehensive strains: {comprehensive_count}")
            print(f"  • Found specific strains: {len(found_strains)}/4 ({found_strains})")
            
        else:
            self.log_test("Get Wictionary Terms", False, f"Failed to retrieve terms: {response}")

async def main():
    async with WictionaryTester() as tester:
        await tester.test_comprehensive_wictionary()

if __name__ == "__main__":
    asyncio.run(main())