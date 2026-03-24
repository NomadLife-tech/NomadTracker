#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Nomad Compass Travel Tracker
Pre-App Store Health Check - Tests all backend endpoints with edge cases
"""

import requests
import json
import uuid
from datetime import datetime
from typing import Dict, Any, List
import time

# Get backend URL from frontend env
BACKEND_URL = "https://nomad-compass-6.preview.emergentagent.com/api"

class ComprehensiveAPITester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.test_device_id = f"test-device-{uuid.uuid4().hex[:8]}"
        self.test_results = []
        self.failed_tests = []
        
    def log_test(self, test_name: str, success: bool, details: str = ""):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {details}")
        
        if not success:
            self.failed_tests.append(f"{test_name}: {details}")
        
    # ═══════════════════════════════════════════════════════════════════════════
    # HEALTH CHECK TESTS
    # ═══════════════════════════════════════════════════════════════════════════
    
    def test_health_endpoint(self) -> bool:
        """Test GET /api/health - Verify backend and database connectivity"""
        try:
            response = requests.get(f"{self.base_url}/health", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "healthy" and data.get("database") == "connected":
                    self.log_test("Health Check", True, f"Backend healthy, DB connected. Timestamp: {data.get('timestamp')}")
                    return True
                else:
                    self.log_test("Health Check", False, f"Unhealthy status: {data}")
                    return False
            else:
                self.log_test("Health Check", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Health Check", False, f"Connection error: {str(e)}")
            return False
    
    def test_root_endpoint(self) -> bool:
        """Test GET /api/ - Root endpoint"""
        try:
            response = requests.get(f"{self.base_url}/", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if "Nomad Tracker API" in data.get("message", ""):
                    self.log_test("Root Endpoint", True, f"API message: {data.get('message')}")
                    return True
                else:
                    self.log_test("Root Endpoint", False, f"Unexpected response: {data}")
                    return False
            else:
                self.log_test("Root Endpoint", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Root Endpoint", False, f"Connection error: {str(e)}")
            return False
    
    # ═══════════════════════════════════════════════════════════════════════════
    # SYNC API TESTS
    # ═══════════════════════════════════════════════════════════════════════════
    
    def test_sync_create_operations(self) -> bool:
        """Test POST /api/sync - Creating visits and profiles"""
        try:
            # Create comprehensive test data
            test_visit = {
                "id": str(uuid.uuid4()),
                "countryCode": "JP",
                "countryName": "Japan",
                "entryDate": "2024-01-15T09:00:00.000Z",
                "exitDate": "2024-01-25T18:30:00.000Z",
                "visaType": "tourist",
                "purpose": "Tourism and cultural exploration",
                "notes": "Visited Tokyo, Kyoto, and Osaka. Amazing temples and food! 🍜🏯"
            }
            
            test_profile = {
                "id": str(uuid.uuid4()),
                "firstName": "María",
                "lastName": "González",
                "avatar": "🌸",
                "avatarType": "preset",
                "passports": [
                    {
                        "id": str(uuid.uuid4()),
                        "type": "primary",
                        "countryCode": "ES",
                        "countryName": "Spain",
                        "passportNumber": "ESP123456789",
                        "issueDate": "2020-03-15T00:00:00.000Z",
                        "expiryDate": "2030-03-15T00:00:00.000Z",
                        "attachments": []
                    }
                ],
                "insurances": [
                    {
                        "id": str(uuid.uuid4()),
                        "type": "medical",
                        "provider": "European Health Insurance",
                        "policyNumber": "EHI2024001",
                        "phone": "+34-900-123-456",
                        "notes": "Comprehensive medical coverage for EU citizens",
                        "attachments": []
                    }
                ]
            }
            
            sync_request = {
                "deviceId": self.test_device_id,
                "operations": [
                    {
                        "id": str(uuid.uuid4()),
                        "type": "CREATE",
                        "entity": "visit",
                        "data": test_visit,
                        "timestamp": datetime.now().isoformat(),
                        "retryCount": 0,
                        "status": "pending"
                    },
                    {
                        "id": str(uuid.uuid4()),
                        "type": "CREATE",
                        "entity": "profile",
                        "data": test_profile,
                        "timestamp": datetime.now().isoformat(),
                        "retryCount": 0,
                        "status": "pending"
                    }
                ]
            }
            
            response = requests.post(
                f"{self.base_url}/sync",
                json=sync_request,
                headers={"Content-Type": "application/json"},
                timeout=15
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("processedCount") == 2:
                    self.log_test("Sync Create Operations", True, f"Created 2 entities successfully. Failed IDs: {data.get('failedIds', [])}")
                    return True
                else:
                    self.log_test("Sync Create Operations", False, f"Sync failed: {data}")
                    return False
            else:
                self.log_test("Sync Create Operations", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Sync Create Operations", False, f"Error: {str(e)}")
            return False
    
    def test_sync_update_operations(self) -> bool:
        """Test POST /api/sync - Updating existing data"""
        try:
            # Update the visit with new information
            updated_visit = {
                "id": str(uuid.uuid4()),
                "countryCode": "TH",
                "countryName": "Thailand",
                "entryDate": "2024-02-01T14:00:00.000Z",
                "exitDate": "2024-02-14T10:30:00.000Z",
                "visaType": "visa_on_arrival",
                "purpose": "Beach vacation and cultural sites",
                "notes": "Visited Bangkok, Phuket, and Chiang Mai. Incredible street food and temples! 🏖️🛕"
            }
            
            sync_request = {
                "deviceId": self.test_device_id,
                "operations": [
                    {
                        "id": str(uuid.uuid4()),
                        "type": "UPDATE",
                        "entity": "visit",
                        "data": updated_visit,
                        "timestamp": datetime.now().isoformat(),
                        "retryCount": 0,
                        "status": "pending"
                    }
                ]
            }
            
            response = requests.post(
                f"{self.base_url}/sync",
                json=sync_request,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("processedCount") == 1:
                    self.log_test("Sync Update Operations", True, f"Updated 1 entity successfully")
                    return True
                else:
                    self.log_test("Sync Update Operations", False, f"Update failed: {data}")
                    return False
            else:
                self.log_test("Sync Update Operations", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Sync Update Operations", False, f"Error: {str(e)}")
            return False
    
    def test_get_synced_data(self) -> bool:
        """Test GET /api/sync/{device_id} - Retrieving synced data"""
        try:
            response = requests.get(
                f"{self.base_url}/sync/{self.test_device_id}",
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                visits = data.get("visits", [])
                profile = data.get("profile")
                
                # Verify data structure
                if isinstance(visits, list) and profile is not None:
                    visit_count = len(visits)
                    has_profile_data = bool(profile.get("firstName"))
                    self.log_test("Get Synced Data", True, 
                                f"Retrieved {visit_count} visits and profile data. Profile has name: {has_profile_data}")
                    return True
                else:
                    self.log_test("Get Synced Data", False, f"Invalid data structure: visits={type(visits)}, profile={type(profile)}")
                    return False
            else:
                self.log_test("Get Synced Data", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Get Synced Data", False, f"Error: {str(e)}")
            return False
    
    def test_sync_delete_operations(self) -> bool:
        """Test POST /api/sync - Deleting data"""
        try:
            # Delete a visit
            delete_request = {
                "deviceId": self.test_device_id,
                "operations": [
                    {
                        "id": str(uuid.uuid4()),
                        "type": "DELETE",
                        "entity": "visit",
                        "data": {"id": "some-visit-id-to-delete"},
                        "timestamp": datetime.now().isoformat(),
                        "retryCount": 0,
                        "status": "pending"
                    }
                ]
            }
            
            response = requests.post(
                f"{self.base_url}/sync",
                json=delete_request,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("processedCount") == 1:
                    self.log_test("Sync Delete Operations", True, f"Delete operation processed successfully")
                    return True
                else:
                    self.log_test("Sync Delete Operations", False, f"Delete failed: {data}")
                    return False
            else:
                self.log_test("Sync Delete Operations", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Sync Delete Operations", False, f"Error: {str(e)}")
            return False
    
    def test_delete_device_data(self) -> bool:
        """Test DELETE /api/sync/{device_id} - Deleting all device data"""
        try:
            response = requests.delete(
                f"{self.base_url}/sync/{self.test_device_id}",
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    self.log_test("Delete Device Data", True, f"Device data cleared: {data.get('message')}")
                    return True
                else:
                    self.log_test("Delete Device Data", False, f"Delete failed: {data}")
                    return False
            else:
                self.log_test("Delete Device Data", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Delete Device Data", False, f"Error: {str(e)}")
            return False
    
    # ═══════════════════════════════════════════════════════════════════════════
    # ERROR HANDLING TESTS
    # ═══════════════════════════════════════════════════════════════════════════
    
    def test_invalid_json(self) -> bool:
        """Test error handling with malformed JSON"""
        try:
            response = requests.post(
                f"{self.base_url}/sync",
                data="invalid json data",
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            # Should return 422 (Unprocessable Entity) for invalid JSON
            if response.status_code in [400, 422]:
                self.log_test("Invalid JSON Handling", True, f"Correctly rejected malformed JSON with HTTP {response.status_code}")
                return True
            else:
                self.log_test("Invalid JSON Handling", False, f"Unexpected status code {response.status_code} for invalid JSON")
                return False
                
        except Exception as e:
            self.log_test("Invalid JSON Handling", False, f"Error: {str(e)}")
            return False
    
    def test_missing_required_fields(self) -> bool:
        """Test error handling with missing required fields"""
        try:
            # Missing deviceId
            invalid_request = {
                "operations": [
                    {
                        "id": str(uuid.uuid4()),
                        "type": "CREATE",
                        "entity": "visit",
                        "data": {"countryCode": "US"},
                        "timestamp": datetime.now().isoformat()
                    }
                ]
            }
            
            response = requests.post(
                f"{self.base_url}/sync",
                json=invalid_request,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            # Should return 422 for missing required fields
            if response.status_code == 422:
                self.log_test("Missing Required Fields", True, f"Correctly rejected missing deviceId with HTTP 422")
                return True
            else:
                self.log_test("Missing Required Fields", False, f"Expected HTTP 422, got {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Missing Required Fields", False, f"Error: {str(e)}")
            return False
    
    def test_nonexistent_device_data(self) -> bool:
        """Test retrieving data for non-existent device"""
        try:
            fake_device_id = f"nonexistent-device-{uuid.uuid4().hex[:8]}"
            response = requests.get(
                f"{self.base_url}/sync/{fake_device_id}",
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                # Should return empty data structure
                if data.get("visits") == [] and data.get("profile") is None:
                    self.log_test("Nonexistent Device Data", True, "Correctly returned empty data for nonexistent device")
                    return True
                else:
                    self.log_test("Nonexistent Device Data", False, f"Unexpected data for nonexistent device: {data}")
                    return False
            else:
                self.log_test("Nonexistent Device Data", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Nonexistent Device Data", False, f"Error: {str(e)}")
            return False
    
    # ═══════════════════════════════════════════════════════════════════════════
    # EDGE CASE TESTS
    # ═══════════════════════════════════════════════════════════════════════════
    
    def test_large_payload(self) -> bool:
        """Test handling of large payloads (simulating attachments)"""
        try:
            # Create a large attachment (simulated base64 data)
            large_attachment = {
                "id": str(uuid.uuid4()),
                "name": "large_document.pdf",
                "type": "pdf",
                "mimeType": "application/pdf",
                "size": 5000000,  # 5MB
                "uri": "data:application/pdf;base64," + "A" * 10000,  # Large base64 string
                "createdAt": datetime.now().isoformat()
            }
            
            large_profile = {
                "id": str(uuid.uuid4()),
                "firstName": "Large",
                "lastName": "DataTest",
                "passports": [
                    {
                        "id": str(uuid.uuid4()),
                        "type": "primary",
                        "countryCode": "US",
                        "countryName": "United States",
                        "passportNumber": "LARGE123456",
                        "attachments": [large_attachment]
                    }
                ],
                "insurances": [
                    {
                        "id": str(uuid.uuid4()),
                        "type": "medical",
                        "provider": "Large Data Insurance",
                        "policyNumber": "LARGE001",
                        "attachments": [large_attachment]
                    }
                ]
            }
            
            sync_request = {
                "deviceId": f"large-test-{uuid.uuid4().hex[:8]}",
                "operations": [
                    {
                        "id": str(uuid.uuid4()),
                        "type": "CREATE",
                        "entity": "profile",
                        "data": large_profile,
                        "timestamp": datetime.now().isoformat(),
                        "retryCount": 0,
                        "status": "pending"
                    }
                ]
            }
            
            response = requests.post(
                f"{self.base_url}/sync",
                json=sync_request,
                headers={"Content-Type": "application/json"},
                timeout=30  # Longer timeout for large payload
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    self.log_test("Large Payload", True, f"Successfully handled large payload (~{len(json.dumps(sync_request))} bytes)")
                    return True
                else:
                    self.log_test("Large Payload", False, f"Large payload sync failed: {data}")
                    return False
            else:
                self.log_test("Large Payload", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Large Payload", False, f"Error: {str(e)}")
            return False
    
    def test_empty_arrays_and_objects(self) -> bool:
        """Test handling of empty arrays and objects"""
        try:
            empty_profile = {
                "id": str(uuid.uuid4()),
                "firstName": "",
                "lastName": "",
                "passports": [],
                "insurances": []
            }
            
            sync_request = {
                "deviceId": f"empty-test-{uuid.uuid4().hex[:8]}",
                "operations": [
                    {
                        "id": str(uuid.uuid4()),
                        "type": "CREATE",
                        "entity": "profile",
                        "data": empty_profile,
                        "timestamp": datetime.now().isoformat(),
                        "retryCount": 0,
                        "status": "pending"
                    }
                ]
            }
            
            response = requests.post(
                f"{self.base_url}/sync",
                json=sync_request,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    self.log_test("Empty Arrays and Objects", True, "Successfully handled empty arrays and objects")
                    return True
                else:
                    self.log_test("Empty Arrays and Objects", False, f"Empty data sync failed: {data}")
                    return False
            else:
                self.log_test("Empty Arrays and Objects", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Empty Arrays and Objects", False, f"Error: {str(e)}")
            return False
    
    def test_unicode_characters(self) -> bool:
        """Test handling of Unicode characters in names/notes"""
        try:
            unicode_profile = {
                "id": str(uuid.uuid4()),
                "firstName": "张伟",  # Chinese
                "lastName": "Müller",  # German with umlaut
                "passports": [
                    {
                        "id": str(uuid.uuid4()),
                        "type": "primary",
                        "countryCode": "CN",
                        "countryName": "中华人民共和国",  # China in Chinese
                        "passportNumber": "CN123456789"
                    }
                ],
                "insurances": []
            }
            
            unicode_visit = {
                "id": str(uuid.uuid4()),
                "countryCode": "RU",
                "countryName": "Россия",  # Russia in Russian
                "entryDate": "2024-03-01T12:00:00.000Z",
                "exitDate": "2024-03-10T15:00:00.000Z",
                "visaType": "tourist",
                "purpose": "Культурный туризм",  # Cultural tourism in Russian
                "notes": "Посетил Москву и Санкт-Петербург. Красивые соборы! 🏰⛪ Très beau voyage! 素晴らしい旅行でした！"
            }
            
            sync_request = {
                "deviceId": f"unicode-test-{uuid.uuid4().hex[:8]}",
                "operations": [
                    {
                        "id": str(uuid.uuid4()),
                        "type": "CREATE",
                        "entity": "profile",
                        "data": unicode_profile,
                        "timestamp": datetime.now().isoformat(),
                        "retryCount": 0,
                        "status": "pending"
                    },
                    {
                        "id": str(uuid.uuid4()),
                        "type": "CREATE",
                        "entity": "visit",
                        "data": unicode_visit,
                        "timestamp": datetime.now().isoformat(),
                        "retryCount": 0,
                        "status": "pending"
                    }
                ]
            }
            
            response = requests.post(
                f"{self.base_url}/sync",
                json=sync_request,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("processedCount") == 2:
                    self.log_test("Unicode Characters", True, "Successfully handled Unicode characters in multiple languages")
                    return True
                else:
                    self.log_test("Unicode Characters", False, f"Unicode data sync failed: {data}")
                    return False
            else:
                self.log_test("Unicode Characters", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Unicode Characters", False, f"Error: {str(e)}")
            return False
    
    # ═══════════════════════════════════════════════════════════════════════════
    # ADDITIONAL ENDPOINT TESTS
    # ═══════════════════════════════════════════════════════════════════════════
    
    def test_direct_visit_endpoints(self) -> bool:
        """Test direct visit CRUD endpoints"""
        try:
            test_device = f"visit-test-{uuid.uuid4().hex[:8]}"
            
            # Create a visit using direct endpoint
            visit_data = {
                "id": str(uuid.uuid4()),
                "countryCode": "FR",
                "countryName": "France",
                "entryDate": "2024-04-01T10:00:00.000Z",
                "exitDate": "2024-04-07T16:00:00.000Z",
                "visaType": "schengen",
                "purpose": "Business meeting",
                "notes": "Paris business trip - successful meetings with clients"
            }
            
            # POST /visits/{device_id}
            response = requests.post(
                f"{self.base_url}/visits/{test_device}",
                json=visit_data,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 200:
                create_data = response.json()
                if create_data.get("success"):
                    # GET /visits/{device_id}
                    get_response = requests.get(f"{self.base_url}/visits/{test_device}", timeout=10)
                    if get_response.status_code == 200:
                        visits = get_response.json().get("visits", [])
                        if len(visits) > 0:
                            self.log_test("Direct Visit Endpoints", True, f"Created and retrieved visit successfully. Found {len(visits)} visits")
                            return True
                        else:
                            self.log_test("Direct Visit Endpoints", False, "Visit created but not found in GET request")
                            return False
                    else:
                        self.log_test("Direct Visit Endpoints", False, f"GET failed: HTTP {get_response.status_code}")
                        return False
                else:
                    self.log_test("Direct Visit Endpoints", False, f"Create failed: {create_data}")
                    return False
            else:
                self.log_test("Direct Visit Endpoints", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Direct Visit Endpoints", False, f"Error: {str(e)}")
            return False
    
    def test_status_endpoints(self) -> bool:
        """Test status check endpoints"""
        try:
            # POST /status
            status_data = {
                "client_name": "Comprehensive Test Client"
            }
            
            response = requests.post(
                f"{self.base_url}/status",
                json=status_data,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("client_name") == status_data["client_name"]:
                    # GET /status
                    get_response = requests.get(f"{self.base_url}/status", timeout=10)
                    if get_response.status_code == 200:
                        status_list = get_response.json()
                        if isinstance(status_list, list):
                            self.log_test("Status Endpoints", True, f"Created and retrieved status checks. Found {len(status_list)} entries")
                            return True
                        else:
                            self.log_test("Status Endpoints", False, f"GET status returned non-list: {type(status_list)}")
                            return False
                    else:
                        self.log_test("Status Endpoints", False, f"GET status failed: HTTP {get_response.status_code}")
                        return False
                else:
                    self.log_test("Status Endpoints", False, f"Status creation failed: {data}")
                    return False
            else:
                self.log_test("Status Endpoints", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Status Endpoints", False, f"Error: {str(e)}")
            return False
    
    # ═══════════════════════════════════════════════════════════════════════════
    # TEST RUNNER
    # ═══════════════════════════════════════════════════════════════════════════
    
    def run_all_tests(self) -> Dict[str, Any]:
        """Run comprehensive backend API tests"""
        print(f"🧪 COMPREHENSIVE BACKEND API TESTS - PRE-APP STORE HEALTH CHECK")
        print(f"📡 Backend URL: {self.base_url}")
        print(f"🔧 Test Device ID: {self.test_device_id}")
        print("=" * 80)
        
        # Define test categories and tests
        test_categories = [
            ("Health Check Tests", [
                self.test_health_endpoint,
                self.test_root_endpoint
            ]),
            ("Sync API Tests", [
                self.test_sync_create_operations,
                self.test_sync_update_operations,
                self.test_get_synced_data,
                self.test_sync_delete_operations,
                self.test_delete_device_data
            ]),
            ("Error Handling Tests", [
                self.test_invalid_json,
                self.test_missing_required_fields,
                self.test_nonexistent_device_data
            ]),
            ("Edge Case Tests", [
                self.test_large_payload,
                self.test_empty_arrays_and_objects,
                self.test_unicode_characters
            ]),
            ("Additional Endpoint Tests", [
                self.test_direct_visit_endpoints,
                self.test_status_endpoints
            ])
        ]
        
        total_passed = 0
        total_failed = 0
        
        for category_name, tests in test_categories:
            print(f"\n🔍 {category_name}")
            print("-" * 50)
            
            category_passed = 0
            category_failed = 0
            
            for test in tests:
                try:
                    if test():
                        category_passed += 1
                        total_passed += 1
                    else:
                        category_failed += 1
                        total_failed += 1
                except Exception as e:
                    print(f"❌ FAIL {test.__name__}: Unexpected error: {str(e)}")
                    category_failed += 1
                    total_failed += 1
                    self.failed_tests.append(f"{test.__name__}: Unexpected error: {str(e)}")
            
            print(f"📊 {category_name} Results: {category_passed} passed, {category_failed} failed")
        
        print("=" * 80)
        print(f"🎯 OVERALL RESULTS: {total_passed} passed, {total_failed} failed")
        success_rate = (total_passed / (total_passed + total_failed)) * 100 if (total_passed + total_failed) > 0 else 0
        print(f"📈 Success Rate: {success_rate:.1f}%")
        
        return {
            "total_tests": total_passed + total_failed,
            "passed": total_passed,
            "failed": total_failed,
            "success_rate": success_rate,
            "test_results": self.test_results,
            "failed_tests": self.failed_tests
        }

def main():
    """Main test execution"""
    tester = ComprehensiveAPITester()
    results = tester.run_all_tests()
    
    # Print detailed failure summary
    if results['failed'] > 0:
        print(f"\n❌ FAILED TESTS SUMMARY:")
        print("=" * 50)
        for i, failure in enumerate(results['failed_tests'], 1):
            print(f"{i}. {failure}")
    else:
        print(f"\n✅ ALL TESTS PASSED! Backend is ready for App Store packaging.")
    
    return results['failed'] == 0

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)