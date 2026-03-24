#!/usr/bin/env python3
"""
Backend API Testing for Nomad Tracker Profile Storage Functionality
Tests the backend APIs related to profile data storage and sync operations.
"""

import requests
import json
import uuid
from datetime import datetime
from typing import Dict, Any, List

# Get backend URL from frontend env
BACKEND_URL = "https://nomad-compass-6.preview.emergentagent.com/api"

class ProfileStorageAPITester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.test_device_id = f"test-device-{uuid.uuid4().hex[:8]}"
        self.test_results = []
        
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
        
    def test_health_endpoint(self) -> bool:
        """Test the backend health endpoint"""
        try:
            response = requests.get(f"{self.base_url}/health", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "healthy" and data.get("database") == "connected":
                    self.log_test("Health Check", True, "Backend and database are healthy")
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
        """Test the root API endpoint"""
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
    
    def test_sync_profile_data(self) -> bool:
        """Test syncing profile data with passport and insurance"""
        try:
            # Create test profile data with passport and insurance
            test_profile = {
                "id": str(uuid.uuid4()),
                "firstName": "John",
                "lastName": "Traveler",
                "avatar": "🌍",
                "avatarType": "preset",
                "passports": [
                    {
                        "id": str(uuid.uuid4()),
                        "type": "primary",
                        "countryCode": "US",
                        "countryName": "United States",
                        "passportNumber": "123456789",
                        "issueDate": "2020-01-01T00:00:00.000Z",
                        "expiryDate": "2030-01-01T00:00:00.000Z",
                        "attachments": []
                    }
                ],
                "insurances": [
                    {
                        "id": str(uuid.uuid4()),
                        "type": "medical",
                        "provider": "Global Health Insurance",
                        "policyNumber": "POL123456",
                        "phone": "+1-555-0123",
                        "notes": "Comprehensive medical coverage",
                        "attachments": []
                    }
                ],
                "createdAt": datetime.now().isoformat(),
                "updatedAt": datetime.now().isoformat()
            }
            
            # Create sync operation
            sync_request = {
                "deviceId": self.test_device_id,
                "operations": [
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
            
            # Send sync request
            response = requests.post(
                f"{self.base_url}/sync",
                json=sync_request,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("processedCount") == 1:
                    self.log_test("Sync Profile Data", True, f"Profile synced successfully: {data}")
                    return True
                else:
                    self.log_test("Sync Profile Data", False, f"Sync failed: {data}")
                    return False
            else:
                self.log_test("Sync Profile Data", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Sync Profile Data", False, f"Error: {str(e)}")
            return False
    
    def test_retrieve_synced_profile(self) -> bool:
        """Test retrieving synced profile data"""
        try:
            response = requests.get(
                f"{self.base_url}/sync/{self.test_device_id}",
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                profile = data.get("profile")
                
                if profile:
                    # Verify profile structure
                    required_fields = ["firstName", "lastName", "passports", "insurances"]
                    missing_fields = [field for field in required_fields if field not in profile]
                    
                    if not missing_fields:
                        passport_count = len(profile.get("passports", []))
                        insurance_count = len(profile.get("insurances", []))
                        self.log_test("Retrieve Synced Profile", True, 
                                    f"Profile retrieved with {passport_count} passports and {insurance_count} insurances")
                        return True
                    else:
                        self.log_test("Retrieve Synced Profile", False, 
                                    f"Missing required fields: {missing_fields}")
                        return False
                else:
                    self.log_test("Retrieve Synced Profile", False, "No profile data found")
                    return False
            else:
                self.log_test("Retrieve Synced Profile", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Retrieve Synced Profile", False, f"Error: {str(e)}")
            return False
    
    def test_update_profile_data(self) -> bool:
        """Test updating profile data"""
        try:
            # Create updated profile data
            updated_profile = {
                "id": str(uuid.uuid4()),
                "firstName": "Jane",
                "lastName": "Explorer",
                "avatar": "✈️",
                "avatarType": "preset",
                "passports": [
                    {
                        "id": str(uuid.uuid4()),
                        "type": "primary",
                        "countryCode": "CA",
                        "countryName": "Canada",
                        "passportNumber": "987654321",
                        "issueDate": "2021-01-01T00:00:00.000Z",
                        "expiryDate": "2031-01-01T00:00:00.000Z",
                        "attachments": []
                    },
                    {
                        "id": str(uuid.uuid4()),
                        "type": "secondary",
                        "countryCode": "GB",
                        "countryName": "United Kingdom",
                        "passportNumber": "UK123456",
                        "issueDate": "2019-06-01T00:00:00.000Z",
                        "expiryDate": "2029-06-01T00:00:00.000Z",
                        "attachments": []
                    }
                ],
                "insurances": [
                    {
                        "id": str(uuid.uuid4()),
                        "type": "travel",
                        "provider": "World Travel Insurance",
                        "policyNumber": "TRV789012",
                        "phone": "+1-555-9876",
                        "notes": "Comprehensive travel coverage worldwide",
                        "attachments": []
                    }
                ],
                "createdAt": datetime.now().isoformat(),
                "updatedAt": datetime.now().isoformat()
            }
            
            # Create update sync operation
            sync_request = {
                "deviceId": self.test_device_id,
                "operations": [
                    {
                        "id": str(uuid.uuid4()),
                        "type": "UPDATE",
                        "entity": "profile",
                        "data": updated_profile,
                        "timestamp": datetime.now().isoformat(),
                        "retryCount": 0,
                        "status": "pending"
                    }
                ]
            }
            
            # Send update request
            response = requests.post(
                f"{self.base_url}/sync",
                json=sync_request,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("processedCount") == 1:
                    self.log_test("Update Profile Data", True, f"Profile updated successfully: {data}")
                    return True
                else:
                    self.log_test("Update Profile Data", False, f"Update failed: {data}")
                    return False
            else:
                self.log_test("Update Profile Data", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Update Profile Data", False, f"Error: {str(e)}")
            return False
    
    def test_passport_data_structure(self) -> bool:
        """Test passport data structure validation"""
        try:
            # Test with invalid passport data (missing required fields)
            invalid_profile = {
                "id": str(uuid.uuid4()),
                "firstName": "Test",
                "lastName": "User",
                "passports": [
                    {
                        "id": str(uuid.uuid4()),
                        "type": "primary",
                        # Missing required fields: countryCode, passportNumber, etc.
                    }
                ],
                "insurances": []
            }
            
            sync_request = {
                "deviceId": self.test_device_id,
                "operations": [
                    {
                        "id": str(uuid.uuid4()),
                        "type": "CREATE",
                        "entity": "profile",
                        "data": invalid_profile,
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
            
            # The API should still accept the data (it's schema-less MongoDB)
            # But we can verify it was stored
            if response.status_code == 200:
                self.log_test("Passport Data Structure", True, "API accepts flexible passport data structure")
                return True
            else:
                self.log_test("Passport Data Structure", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Passport Data Structure", False, f"Error: {str(e)}")
            return False
    
    def test_insurance_data_structure(self) -> bool:
        """Test insurance data structure validation"""
        try:
            # Test with comprehensive insurance data
            comprehensive_profile = {
                "id": str(uuid.uuid4()),
                "firstName": "Insurance",
                "lastName": "Tester",
                "passports": [],
                "insurances": [
                    {
                        "id": str(uuid.uuid4()),
                        "type": "medical",
                        "provider": "Premium Health Corp",
                        "policyNumber": "MED2024001",
                        "phone": "+1-800-HEALTH",
                        "notes": "Premium medical coverage with worldwide emergency assistance",
                        "attachments": [
                            {
                                "id": str(uuid.uuid4()),
                                "name": "policy_document.pdf",
                                "type": "pdf",
                                "mimeType": "application/pdf",
                                "size": 1024000,
                                "uri": "data:application/pdf;base64,JVBERi0xLjQ...",
                                "createdAt": datetime.now().isoformat()
                            }
                        ]
                    },
                    {
                        "id": str(uuid.uuid4()),
                        "type": "travel",
                        "provider": "Adventure Travel Insurance",
                        "policyNumber": "TRV2024002",
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
                        "entity": "profile",
                        "data": comprehensive_profile,
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
                    self.log_test("Insurance Data Structure", True, "Complex insurance data with attachments synced successfully")
                    return True
                else:
                    self.log_test("Insurance Data Structure", False, f"Sync failed: {data}")
                    return False
            else:
                self.log_test("Insurance Data Structure", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Insurance Data Structure", False, f"Error: {str(e)}")
            return False
    
    def cleanup_test_data(self) -> bool:
        """Clean up test data"""
        try:
            response = requests.delete(
                f"{self.base_url}/sync/{self.test_device_id}",
                timeout=10
            )
            
            if response.status_code == 200:
                self.log_test("Cleanup Test Data", True, "Test data cleaned up successfully")
                return True
            else:
                self.log_test("Cleanup Test Data", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Cleanup Test Data", False, f"Error: {str(e)}")
            return False
    
    def run_all_tests(self) -> Dict[str, Any]:
        """Run all backend API tests"""
        print(f"🧪 Starting Backend API Tests for Profile Storage")
        print(f"📡 Backend URL: {self.base_url}")
        print(f"🔧 Test Device ID: {self.test_device_id}")
        print("=" * 60)
        
        # Run tests in order
        tests = [
            self.test_health_endpoint,
            self.test_root_endpoint,
            self.test_sync_profile_data,
            self.test_retrieve_synced_profile,
            self.test_update_profile_data,
            self.test_passport_data_structure,
            self.test_insurance_data_structure,
            self.cleanup_test_data
        ]
        
        passed = 0
        failed = 0
        
        for test in tests:
            try:
                if test():
                    passed += 1
                else:
                    failed += 1
            except Exception as e:
                print(f"❌ FAIL {test.__name__}: Unexpected error: {str(e)}")
                failed += 1
        
        print("=" * 60)
        print(f"📊 Test Results: {passed} passed, {failed} failed")
        
        return {
            "total_tests": len(tests),
            "passed": passed,
            "failed": failed,
            "success_rate": (passed / len(tests)) * 100,
            "test_results": self.test_results
        }

def main():
    """Main test execution"""
    tester = ProfileStorageAPITester()
    results = tester.run_all_tests()
    
    # Print summary
    print(f"\n🎯 Overall Success Rate: {results['success_rate']:.1f}%")
    
    if results['failed'] > 0:
        print("\n❌ Failed Tests:")
        for result in results['test_results']:
            if not result['success']:
                print(f"  - {result['test']}: {result['details']}")
    
    return results['failed'] == 0

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)