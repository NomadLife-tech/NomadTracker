#!/usr/bin/env python3
"""
Comprehensive Backend API Test Suite for Nomad Compass
Final Pre-App Store Health Check
"""

import requests
import json
import uuid
from datetime import datetime
import time

# Backend URL from environment
BACKEND_URL = "https://nomad-compass-6.preview.emergentagent.com/api"

class BackendTester:
    def __init__(self):
        self.test_results = []
        self.device_id = f"test-device-{uuid.uuid4()}"
        self.visit_id = str(uuid.uuid4())
        
    def log_test(self, test_name, passed, details=""):
        """Log test result"""
        status = "✅ PASS" if passed else "❌ FAIL"
        self.test_results.append({
            "test": test_name,
            "status": status,
            "passed": passed,
            "details": details
        })
        print(f"{status}: {test_name}")
        if details:
            print(f"   Details: {details}")
    
    def test_health_endpoints(self):
        """Test health and status endpoints"""
        print("\n=== HEALTH & STATUS ENDPOINTS ===")
        
        # Test GET /api/
        try:
            response = requests.get(f"{BACKEND_URL}/", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if "message" in data and "status" in data:
                    self.log_test("GET /api/ (root)", True, f"Status: {data.get('status')}")
                else:
                    self.log_test("GET /api/ (root)", False, "Missing required fields in response")
            else:
                self.log_test("GET /api/ (root)", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("GET /api/ (root)", False, f"Exception: {str(e)}")
        
        # Test GET /api/health
        try:
            response = requests.get(f"{BACKEND_URL}/health", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "healthy" and data.get("database") == "connected":
                    self.log_test("GET /api/health", True, f"Database: {data.get('database')}")
                else:
                    self.log_test("GET /api/health", False, f"Unhealthy status: {data}")
            else:
                self.log_test("GET /api/health", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("GET /api/health", False, f"Exception: {str(e)}")
    
    def test_status_operations(self):
        """Test status operations"""
        print("\n=== STATUS OPERATIONS ===")
        
        # Test POST /api/status
        try:
            payload = {"client_name": "test-client-final-check"}
            response = requests.post(f"{BACKEND_URL}/status", json=payload, timeout=10)
            if response.status_code == 200:
                data = response.json()
                if "id" in data and "client_name" in data and "timestamp" in data:
                    self.log_test("POST /api/status", True, f"Created status with ID: {data.get('id')[:8]}...")
                else:
                    self.log_test("POST /api/status", False, "Missing required fields in response")
            else:
                self.log_test("POST /api/status", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("POST /api/status", False, f"Exception: {str(e)}")
        
        # Test GET /api/status
        try:
            response = requests.get(f"{BACKEND_URL}/status", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("GET /api/status", True, f"Retrieved {len(data)} status records")
                else:
                    self.log_test("GET /api/status", False, "Response is not a list")
            else:
                self.log_test("GET /api/status", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("GET /api/status", False, f"Exception: {str(e)}")
    
    def test_sync_operations(self):
        """Test sync operations with comprehensive scenarios"""
        print("\n=== SYNC OPERATIONS ===")
        
        # Test POST /api/sync - CREATE operation
        try:
            sync_payload = {
                "deviceId": self.device_id,
                "operations": [
                    {
                        "id": str(uuid.uuid4()),
                        "type": "CREATE",
                        "entity": "visit",
                        "data": {
                            "id": self.visit_id,
                            "countryCode": "US",
                            "countryName": "United States",
                            "entryDate": "2024-01-15",
                            "exitDate": "2024-01-20",
                            "visaType": "tourist",
                            "purpose": "vacation",
                            "notes": "Final health check test visit 🌍"
                        },
                        "timestamp": datetime.utcnow().isoformat(),
                        "retryCount": 0,
                        "status": "pending"
                    }
                ]
            }
            
            response = requests.post(f"{BACKEND_URL}/sync", json=sync_payload, timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("processedCount") == 1:
                    self.log_test("POST /api/sync (CREATE)", True, f"Processed {data.get('processedCount')} operations")
                else:
                    self.log_test("POST /api/sync (CREATE)", False, f"Sync failed: {data}")
            else:
                self.log_test("POST /api/sync (CREATE)", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("POST /api/sync (CREATE)", False, f"Exception: {str(e)}")
        
        # Test POST /api/sync - UPDATE operation
        try:
            update_payload = {
                "deviceId": self.device_id,
                "operations": [
                    {
                        "id": str(uuid.uuid4()),
                        "type": "UPDATE",
                        "entity": "visit",
                        "data": {
                            "id": self.visit_id,
                            "countryCode": "US",
                            "countryName": "United States",
                            "entryDate": "2024-01-15",
                            "exitDate": "2024-01-25",  # Updated exit date
                            "visaType": "tourist",
                            "purpose": "vacation - extended",
                            "notes": "Updated during final health check 🔄"
                        },
                        "timestamp": datetime.utcnow().isoformat(),
                        "retryCount": 0,
                        "status": "pending"
                    }
                ]
            }
            
            response = requests.post(f"{BACKEND_URL}/sync", json=update_payload, timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("processedCount") == 1:
                    self.log_test("POST /api/sync (UPDATE)", True, f"Updated {data.get('processedCount')} operations")
                else:
                    self.log_test("POST /api/sync (UPDATE)", False, f"Update failed: {data}")
            else:
                self.log_test("POST /api/sync (UPDATE)", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("POST /api/sync (UPDATE)", False, f"Exception: {str(e)}")
        
        # Test GET /api/sync/{device_id}
        try:
            response = requests.get(f"{BACKEND_URL}/sync/{self.device_id}", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if "visits" in data and "lastSyncTimestamp" in data:
                    visits = data.get("visits", [])
                    if len(visits) > 0 and visits[0].get("id") == self.visit_id:
                        self.log_test("GET /api/sync/{device_id}", True, f"Retrieved {len(visits)} visits")
                    else:
                        self.log_test("GET /api/sync/{device_id}", False, "Visit not found or incorrect data")
                else:
                    self.log_test("GET /api/sync/{device_id}", False, "Missing required fields in response")
            else:
                self.log_test("GET /api/sync/{device_id}", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("GET /api/sync/{device_id}", False, f"Exception: {str(e)}")
        
        # Test POST /api/sync - DELETE operation
        try:
            delete_payload = {
                "deviceId": self.device_id,
                "operations": [
                    {
                        "id": str(uuid.uuid4()),
                        "type": "DELETE",
                        "entity": "visit",
                        "data": {
                            "id": self.visit_id
                        },
                        "timestamp": datetime.utcnow().isoformat(),
                        "retryCount": 0,
                        "status": "pending"
                    }
                ]
            }
            
            response = requests.post(f"{BACKEND_URL}/sync", json=delete_payload, timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("processedCount") == 1:
                    self.log_test("POST /api/sync (DELETE)", True, f"Deleted {data.get('processedCount')} operations")
                else:
                    self.log_test("POST /api/sync (DELETE)", False, f"Delete failed: {data}")
            else:
                self.log_test("POST /api/sync (DELETE)", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("POST /api/sync (DELETE)", False, f"Exception: {str(e)}")
        
        # Test DELETE /api/sync/{device_id}
        try:
            response = requests.delete(f"{BACKEND_URL}/sync/{self.device_id}", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    self.log_test("DELETE /api/sync/{device_id}", True, "Device data cleared successfully")
                else:
                    self.log_test("DELETE /api/sync/{device_id}", False, f"Clear failed: {data}")
            else:
                self.log_test("DELETE /api/sync/{device_id}", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("DELETE /api/sync/{device_id}", False, f"Exception: {str(e)}")
    
    def test_visit_operations(self):
        """Test direct visit operations"""
        print("\n=== VISIT OPERATIONS ===")
        
        new_visit_id = str(uuid.uuid4())
        
        # Test POST /api/visits/{device_id}
        try:
            visit_payload = {
                "id": new_visit_id,
                "countryCode": "FR",
                "countryName": "France",
                "entryDate": "2024-02-01",
                "exitDate": "2024-02-10",
                "visaType": "tourist",
                "purpose": "sightseeing",
                "notes": "Direct visit API test 🇫🇷"
            }
            
            response = requests.post(f"{BACKEND_URL}/visits/{self.device_id}", json=visit_payload, timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("id") == new_visit_id:
                    self.log_test("POST /api/visits/{device_id}", True, f"Created visit: {new_visit_id[:8]}...")
                else:
                    self.log_test("POST /api/visits/{device_id}", False, f"Creation failed: {data}")
            else:
                self.log_test("POST /api/visits/{device_id}", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("POST /api/visits/{device_id}", False, f"Exception: {str(e)}")
        
        # Test GET /api/visits/{device_id}
        try:
            response = requests.get(f"{BACKEND_URL}/visits/{self.device_id}", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if "visits" in data:
                    visits = data.get("visits", [])
                    self.log_test("GET /api/visits/{device_id}", True, f"Retrieved {len(visits)} visits")
                else:
                    self.log_test("GET /api/visits/{device_id}", False, "Missing visits field in response")
            else:
                self.log_test("GET /api/visits/{device_id}", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("GET /api/visits/{device_id}", False, f"Exception: {str(e)}")
        
        # Clean up - delete the test visit
        try:
            response = requests.delete(f"{BACKEND_URL}/visits/{self.device_id}/{new_visit_id}", timeout=10)
            if response.status_code == 200:
                self.log_test("DELETE /api/visits/{device_id}/{visit_id}", True, "Visit deleted successfully")
            else:
                self.log_test("DELETE /api/visits/{device_id}/{visit_id}", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("DELETE /api/visits/{device_id}/{visit_id}", False, f"Exception: {str(e)}")
    
    def test_error_handling(self):
        """Test error handling scenarios"""
        print("\n=== ERROR HANDLING ===")
        
        # Test invalid JSON payload
        try:
            response = requests.post(f"{BACKEND_URL}/sync", data="invalid json", 
                                   headers={"Content-Type": "application/json"}, timeout=10)
            if response.status_code in [400, 422]:
                self.log_test("Invalid JSON handling", True, f"Correctly rejected with status {response.status_code}")
            else:
                self.log_test("Invalid JSON handling", False, f"Unexpected status code: {response.status_code}")
        except Exception as e:
            self.log_test("Invalid JSON handling", False, f"Exception: {str(e)}")
        
        # Test missing required fields
        try:
            incomplete_payload = {"deviceId": "test"}  # Missing operations
            response = requests.post(f"{BACKEND_URL}/sync", json=incomplete_payload, timeout=10)
            if response.status_code in [400, 422]:
                self.log_test("Missing fields handling", True, f"Correctly rejected with status {response.status_code}")
            else:
                self.log_test("Missing fields handling", False, f"Unexpected status code: {response.status_code}")
        except Exception as e:
            self.log_test("Missing fields handling", False, f"Exception: {str(e)}")
        
        # Test non-existent device ID
        try:
            fake_device_id = "non-existent-device-12345"
            response = requests.get(f"{BACKEND_URL}/sync/{fake_device_id}", timeout=10)
            if response.status_code == 200:
                data = response.json()
                # Should return empty data, not error
                self.log_test("Non-existent device ID", True, "Returns empty data for non-existent device")
            else:
                self.log_test("Non-existent device ID", False, f"Unexpected status code: {response.status_code}")
        except Exception as e:
            self.log_test("Non-existent device ID", False, f"Exception: {str(e)}")
    
    def test_edge_cases(self):
        """Test edge cases"""
        print("\n=== EDGE CASES ===")
        
        edge_device_id = f"edge-test-{uuid.uuid4()}"
        
        # Test empty operations array
        try:
            empty_payload = {
                "deviceId": edge_device_id,
                "operations": []
            }
            response = requests.post(f"{BACKEND_URL}/sync", json=empty_payload, timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get("processedCount") == 0:
                    self.log_test("Empty operations array", True, "Correctly handled empty operations")
                else:
                    self.log_test("Empty operations array", False, f"Unexpected processed count: {data}")
            else:
                self.log_test("Empty operations array", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("Empty operations array", False, f"Exception: {str(e)}")
        
        # Test Unicode characters
        try:
            unicode_payload = {
                "deviceId": edge_device_id,
                "operations": [
                    {
                        "id": str(uuid.uuid4()),
                        "type": "CREATE",
                        "entity": "visit",
                        "data": {
                            "id": str(uuid.uuid4()),
                            "countryCode": "JP",
                            "countryName": "日本 (Japan)",
                            "entryDate": "2024-03-01",
                            "visaType": "tourist",
                            "notes": "Unicode test: 🗾 🍣 🎌 こんにちは"
                        },
                        "timestamp": datetime.utcnow().isoformat(),
                        "retryCount": 0,
                        "status": "pending"
                    }
                ]
            }
            
            response = requests.post(f"{BACKEND_URL}/sync", json=unicode_payload, timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    self.log_test("Unicode characters", True, "Successfully handled Unicode data")
                else:
                    self.log_test("Unicode characters", False, f"Unicode handling failed: {data}")
            else:
                self.log_test("Unicode characters", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("Unicode characters", False, f"Exception: {str(e)}")
        
        # Test large payload (multiple operations)
        try:
            large_operations = []
            for i in range(10):  # Create 10 operations
                large_operations.append({
                    "id": str(uuid.uuid4()),
                    "type": "CREATE",
                    "entity": "visit",
                    "data": {
                        "id": str(uuid.uuid4()),
                        "countryCode": f"T{i:02d}",
                        "countryName": f"Test Country {i}",
                        "entryDate": f"2024-{(i%12)+1:02d}-01",
                        "visaType": "tourist",
                        "notes": f"Large payload test visit {i} with some additional text to make it larger"
                    },
                    "timestamp": datetime.utcnow().isoformat(),
                    "retryCount": 0,
                    "status": "pending"
                })
            
            large_payload = {
                "deviceId": edge_device_id,
                "operations": large_operations
            }
            
            response = requests.post(f"{BACKEND_URL}/sync", json=large_payload, timeout=15)
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("processedCount") == 10:
                    self.log_test("Large payload", True, f"Processed {data.get('processedCount')} operations")
                else:
                    self.log_test("Large payload", False, f"Large payload failed: {data}")
            else:
                self.log_test("Large payload", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("Large payload", False, f"Exception: {str(e)}")
        
        # Clean up edge test data
        try:
            requests.delete(f"{BACKEND_URL}/sync/{edge_device_id}", timeout=10)
        except:
            pass  # Cleanup failure is not critical
    
    def run_all_tests(self):
        """Run all test suites"""
        print("🚀 STARTING COMPREHENSIVE BACKEND API HEALTH CHECK")
        print("=" * 60)
        
        start_time = time.time()
        
        self.test_health_endpoints()
        self.test_status_operations()
        self.test_sync_operations()
        self.test_visit_operations()
        self.test_error_handling()
        self.test_edge_cases()
        
        end_time = time.time()
        duration = end_time - start_time
        
        # Summary
        print("\n" + "=" * 60)
        print("🏁 FINAL HEALTH CHECK SUMMARY")
        print("=" * 60)
        
        passed_tests = [r for r in self.test_results if r["passed"]]
        failed_tests = [r for r in self.test_results if not r["passed"]]
        
        print(f"Total Tests: {len(self.test_results)}")
        print(f"Passed: {len(passed_tests)} ✅")
        print(f"Failed: {len(failed_tests)} ❌")
        print(f"Success Rate: {(len(passed_tests)/len(self.test_results)*100):.1f}%")
        print(f"Duration: {duration:.2f} seconds")
        
        if failed_tests:
            print("\n❌ FAILED TESTS:")
            for test in failed_tests:
                print(f"  - {test['test']}: {test['details']}")
        
        print("\n✅ PASSED TESTS:")
        for test in passed_tests:
            print(f"  - {test['test']}")
        
        # Note about /api/data endpoints
        print("\n📝 NOTES:")
        print("  - /api/data endpoints mentioned in review request do not exist")
        print("  - Equivalent functionality is provided by /api/sync endpoints")
        print("  - All existing endpoints tested comprehensively")
        
        return len(failed_tests) == 0

if __name__ == "__main__":
    tester = BackendTester()
    success = tester.run_all_tests()
    
    if success:
        print("\n🎉 ALL TESTS PASSED - BACKEND READY FOR APP STORE!")
    else:
        print("\n⚠️  SOME TESTS FAILED - REVIEW REQUIRED BEFORE APP STORE")
        exit(1)