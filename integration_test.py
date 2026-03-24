#!/usr/bin/env python3
"""
Integration Testing for Nomad Tracker Profile Storage Functionality
Tests the complete flow from frontend storage to backend sync.
"""

import requests
import json
import uuid
from datetime import datetime
from typing import Dict, Any, List

# Get backend URL from frontend env
BACKEND_URL = "https://nomad-compass-6.preview.emergentagent.com/api"

class ProfileStorageIntegrationTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.test_device_id = f"integration-test-{uuid.uuid4().hex[:8]}"
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
        
    def test_passport_save_flow(self) -> bool:
        """Test the complete passport save flow"""
        try:
            # Simulate the savePassport function from profile.tsx
            passport_data = {
                "id": str(uuid.uuid4()),
                "type": "primary",
                "countryCode": "US",
                "countryName": "United States",
                "passportNumber": "A12345678",
                "issueDate": "2020-01-15T00:00:00.000Z",
                "expiryDate": "2030-01-15T00:00:00.000Z",
                "attachments": [
                    {
                        "id": str(uuid.uuid4()),
                        "name": "passport_photo.jpg",
                        "type": "jpg",
                        "mimeType": "image/jpeg",
                        "size": 2048000,
                        "uri": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
                        "createdAt": datetime.now().isoformat()
                    }
                ]
            }
            
            # Create profile with passport
            profile_data = {
                "id": str(uuid.uuid4()),
                "firstName": "John",
                "lastName": "Passport",
                "avatar": "🌍",
                "avatarType": "preset",
                "passports": [passport_data],
                "insurances": [],
                "createdAt": datetime.now().isoformat(),
                "updatedAt": datetime.now().isoformat()
            }
            
            # Sync to backend (simulating updateProfile -> storage.saveProfile -> sync)
            sync_request = {
                "deviceId": self.test_device_id,
                "operations": [
                    {
                        "id": str(uuid.uuid4()),
                        "type": "CREATE",
                        "entity": "profile",
                        "data": profile_data,
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
                    # Verify the passport was saved correctly
                    retrieve_response = requests.get(f"{self.base_url}/sync/{self.test_device_id}")
                    if retrieve_response.status_code == 200:
                        retrieved_data = retrieve_response.json()
                        profile = retrieved_data.get("profile", {})
                        passports = profile.get("passports", [])
                        
                        if len(passports) == 1:
                            saved_passport = passports[0]
                            if (saved_passport.get("passportNumber") == "A12345678" and
                                saved_passport.get("countryCode") == "US" and
                                len(saved_passport.get("attachments", [])) == 1):
                                self.log_test("Passport Save Flow", True, "Passport saved and retrieved successfully with attachments")
                                return True
                            else:
                                self.log_test("Passport Save Flow", False, "Passport data mismatch after save")
                                return False
                        else:
                            self.log_test("Passport Save Flow", False, f"Expected 1 passport, got {len(passports)}")
                            return False
                    else:
                        self.log_test("Passport Save Flow", False, "Failed to retrieve saved passport")
                        return False
                else:
                    self.log_test("Passport Save Flow", False, f"Sync failed: {data}")
                    return False
            else:
                self.log_test("Passport Save Flow", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Passport Save Flow", False, f"Error: {str(e)}")
            return False
    
    def test_insurance_save_flow(self) -> bool:
        """Test the complete insurance save flow"""
        try:
            # Simulate the saveInsurance function from profile.tsx
            insurance_data = {
                "id": str(uuid.uuid4()),
                "type": "medical",
                "provider": "Global Health Insurance Co.",
                "policyNumber": "GHI-2024-001",
                "phone": "+1-800-555-HEALTH",
                "notes": "Comprehensive worldwide medical coverage including emergency evacuation",
                "attachments": [
                    {
                        "id": str(uuid.uuid4()),
                        "name": "insurance_policy.pdf",
                        "type": "pdf",
                        "mimeType": "application/pdf",
                        "size": 5120000,
                        "uri": "data:application/pdf;base64,JVBERi0xLjQKJcOkw7zDtsO8CjIgMCBvYmoKPDwKL0xlbmd0aCAzIDAgUgovRmlsdGVyIC9GbGF0ZURlY29kZQo+PgpzdHJlYW0KeJxLy8nPS1WwULBVUEjNyclXyOUCAB2xBRkKZW5kc3RyZWFtCmVuZG9iagoKMyAwIG9iago5CmVuZG9iagoKNCAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMSAwIFIKPj4KZW5kb2JqCgo1IDAgb2JqCjw8Ci9UeXBlIC9QYWdlcwovS2lkcyBbNiAwIFJdCi9Db3VudCAxCj4+CmVuZG9iagoKNiAwIG9iago8PAovVHlwZSAvUGFnZQovUGFyZW50IDUgMCBSCi9NZWRpYUJveCBbMCAwIDYxMiA3OTJdCi9Db250ZW50cyAyIDAgUgo+PgplbmRvYmoKCnhyZWYKMCA3CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAwOSAwMDAwMCBuIAowMDAwMDAwMDc0IDAwMDAwIG4gCjAwMDAwMDAxNTMgMDAwMDAgbiAKMDAwMDAwMDE2MyAwMDAwMCBuIAowMDAwMDAwMjEwIDAwMDAwIG4gCjAwMDAwMDAyNjcgMDAwMDAgbiAKdHJhaWxlcgo8PAovU2l6ZSA3Ci9Sb290IDQgMCBSCj4+CnN0YXJ0eHJlZgozNjQKJSVFT0Y=",
                        "createdAt": datetime.now().isoformat()
                    }
                ]
            }
            
            # Create profile with insurance
            profile_data = {
                "id": str(uuid.uuid4()),
                "firstName": "Jane",
                "lastName": "Insurance",
                "avatar": "🏥",
                "avatarType": "preset",
                "passports": [],
                "insurances": [insurance_data],
                "createdAt": datetime.now().isoformat(),
                "updatedAt": datetime.now().isoformat()
            }
            
            # Sync to backend
            sync_request = {
                "deviceId": self.test_device_id,
                "operations": [
                    {
                        "id": str(uuid.uuid4()),
                        "type": "UPDATE",  # Test update operation
                        "entity": "profile",
                        "data": profile_data,
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
                    # Verify the insurance was saved correctly
                    retrieve_response = requests.get(f"{self.base_url}/sync/{self.test_device_id}")
                    if retrieve_response.status_code == 200:
                        retrieved_data = retrieve_response.json()
                        profile = retrieved_data.get("profile", {})
                        insurances = profile.get("insurances", [])
                        
                        if len(insurances) == 1:
                            saved_insurance = insurances[0]
                            if (saved_insurance.get("policyNumber") == "GHI-2024-001" and
                                saved_insurance.get("provider") == "Global Health Insurance Co." and
                                saved_insurance.get("type") == "medical" and
                                len(saved_insurance.get("attachments", [])) == 1):
                                self.log_test("Insurance Save Flow", True, "Insurance saved and retrieved successfully with attachments")
                                return True
                            else:
                                self.log_test("Insurance Save Flow", False, "Insurance data mismatch after save")
                                return False
                        else:
                            self.log_test("Insurance Save Flow", False, f"Expected 1 insurance, got {len(insurances)}")
                            return False
                    else:
                        self.log_test("Insurance Save Flow", False, "Failed to retrieve saved insurance")
                        return False
                else:
                    self.log_test("Insurance Save Flow", False, f"Sync failed: {data}")
                    return False
            else:
                self.log_test("Insurance Save Flow", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Insurance Save Flow", False, f"Error: {str(e)}")
            return False
    
    def test_multiple_passports_and_insurances(self) -> bool:
        """Test saving multiple passports and insurances"""
        try:
            # Create profile with multiple passports and insurances
            profile_data = {
                "id": str(uuid.uuid4()),
                "firstName": "Multi",
                "lastName": "Document",
                "avatar": "📄",
                "avatarType": "preset",
                "passports": [
                    {
                        "id": str(uuid.uuid4()),
                        "type": "primary",
                        "countryCode": "US",
                        "countryName": "United States",
                        "passportNumber": "US123456789",
                        "issueDate": "2020-01-01T00:00:00.000Z",
                        "expiryDate": "2030-01-01T00:00:00.000Z",
                        "attachments": []
                    },
                    {
                        "id": str(uuid.uuid4()),
                        "type": "secondary",
                        "countryCode": "CA",
                        "countryName": "Canada",
                        "passportNumber": "CA987654321",
                        "issueDate": "2019-06-01T00:00:00.000Z",
                        "expiryDate": "2029-06-01T00:00:00.000Z",
                        "attachments": []
                    },
                    {
                        "id": str(uuid.uuid4()),
                        "type": "tertiary",
                        "countryCode": "GB",
                        "countryName": "United Kingdom",
                        "passportNumber": "GB555666777",
                        "issueDate": "2021-03-15T00:00:00.000Z",
                        "expiryDate": "2031-03-15T00:00:00.000Z",
                        "attachments": []
                    }
                ],
                "insurances": [
                    {
                        "id": str(uuid.uuid4()),
                        "type": "medical",
                        "provider": "Primary Health Insurance",
                        "policyNumber": "PHI-001",
                        "phone": "+1-555-0001",
                        "attachments": []
                    },
                    {
                        "id": str(uuid.uuid4()),
                        "type": "travel",
                        "provider": "Adventure Travel Insurance",
                        "policyNumber": "ATI-002",
                        "phone": "+1-555-0002",
                        "notes": "Covers extreme sports and adventure activities",
                        "attachments": []
                    }
                ],
                "createdAt": datetime.now().isoformat(),
                "updatedAt": datetime.now().isoformat()
            }
            
            # Sync to backend
            sync_request = {
                "deviceId": self.test_device_id,
                "operations": [
                    {
                        "id": str(uuid.uuid4()),
                        "type": "UPDATE",
                        "entity": "profile",
                        "data": profile_data,
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
                    # Verify all documents were saved
                    retrieve_response = requests.get(f"{self.base_url}/sync/{self.test_device_id}")
                    if retrieve_response.status_code == 200:
                        retrieved_data = retrieve_response.json()
                        profile = retrieved_data.get("profile", {})
                        passports = profile.get("passports", [])
                        insurances = profile.get("insurances", [])
                        
                        if len(passports) == 3 and len(insurances) == 2:
                            # Verify passport types
                            passport_types = [p.get("type") for p in passports]
                            expected_types = ["primary", "secondary", "tertiary"]
                            
                            if all(t in passport_types for t in expected_types):
                                self.log_test("Multiple Documents", True, f"Successfully saved 3 passports and 2 insurances")
                                return True
                            else:
                                self.log_test("Multiple Documents", False, f"Passport types mismatch: {passport_types}")
                                return False
                        else:
                            self.log_test("Multiple Documents", False, f"Expected 3 passports and 2 insurances, got {len(passports)} and {len(insurances)}")
                            return False
                    else:
                        self.log_test("Multiple Documents", False, "Failed to retrieve saved documents")
                        return False
                else:
                    self.log_test("Multiple Documents", False, f"Sync failed: {data}")
                    return False
            else:
                self.log_test("Multiple Documents", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Multiple Documents", False, f"Error: {str(e)}")
            return False
    
    def test_data_validation_errors(self) -> bool:
        """Test data validation scenarios that should be handled gracefully"""
        try:
            # Test with missing required fields (simulating frontend validation bypass)
            invalid_profile = {
                "id": str(uuid.uuid4()),
                "firstName": "",  # Empty name
                "lastName": "",   # Empty name
                "passports": [
                    {
                        "id": str(uuid.uuid4()),
                        "type": "primary",
                        "countryCode": "",  # Empty country
                        "passportNumber": "",  # Empty passport number
                        "issueDate": "",  # Invalid date
                        "expiryDate": "",  # Invalid date
                    }
                ],
                "insurances": [
                    {
                        "id": str(uuid.uuid4()),
                        "type": "medical",
                        "provider": "",  # Empty provider
                        "policyNumber": "",  # Empty policy number
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
            
            # The backend should still accept the data (it's flexible)
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    self.log_test("Data Validation Handling", True, "Backend gracefully handles invalid data")
                    return True
                else:
                    self.log_test("Data Validation Handling", False, f"Backend rejected data: {data}")
                    return False
            else:
                self.log_test("Data Validation Handling", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Data Validation Handling", False, f"Error: {str(e)}")
            return False
    
    def test_large_attachment_handling(self) -> bool:
        """Test handling of large attachments"""
        try:
            # Create a large base64 attachment (simulating a large PDF or image)
            large_base64 = "data:application/pdf;base64," + "A" * 10000  # 10KB of A's
            
            profile_data = {
                "id": str(uuid.uuid4()),
                "firstName": "Large",
                "lastName": "Attachment",
                "passports": [
                    {
                        "id": str(uuid.uuid4()),
                        "type": "primary",
                        "countryCode": "US",
                        "countryName": "United States",
                        "passportNumber": "LARGE123",
                        "issueDate": "2020-01-01T00:00:00.000Z",
                        "expiryDate": "2030-01-01T00:00:00.000Z",
                        "attachments": [
                            {
                                "id": str(uuid.uuid4()),
                                "name": "large_passport_scan.pdf",
                                "type": "pdf",
                                "mimeType": "application/pdf",
                                "size": 10240000,  # 10MB
                                "uri": large_base64,
                                "createdAt": datetime.now().isoformat()
                            }
                        ]
                    }
                ],
                "insurances": []
            }
            
            sync_request = {
                "deviceId": self.test_device_id,
                "operations": [
                    {
                        "id": str(uuid.uuid4()),
                        "type": "UPDATE",
                        "entity": "profile",
                        "data": profile_data,
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
                timeout=30  # Longer timeout for large data
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    self.log_test("Large Attachment Handling", True, "Successfully handled large attachment")
                    return True
                else:
                    self.log_test("Large Attachment Handling", False, f"Failed to sync large attachment: {data}")
                    return False
            else:
                self.log_test("Large Attachment Handling", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Large Attachment Handling", False, f"Error: {str(e)}")
            return False
    
    def cleanup_test_data(self) -> bool:
        """Clean up test data"""
        try:
            response = requests.delete(
                f"{self.base_url}/sync/{self.test_device_id}",
                timeout=10
            )
            
            if response.status_code == 200:
                self.log_test("Cleanup Integration Test Data", True, "Test data cleaned up successfully")
                return True
            else:
                self.log_test("Cleanup Integration Test Data", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Cleanup Integration Test Data", False, f"Error: {str(e)}")
            return False
    
    def run_all_tests(self) -> Dict[str, Any]:
        """Run all integration tests"""
        print(f"🧪 Starting Profile Storage Integration Tests")
        print(f"📡 Backend URL: {self.base_url}")
        print(f"🔧 Test Device ID: {self.test_device_id}")
        print("=" * 60)
        
        # Run tests in order
        tests = [
            self.test_passport_save_flow,
            self.test_insurance_save_flow,
            self.test_multiple_passports_and_insurances,
            self.test_data_validation_errors,
            self.test_large_attachment_handling,
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
        print(f"📊 Integration Test Results: {passed} passed, {failed} failed")
        
        return {
            "total_tests": len(tests),
            "passed": passed,
            "failed": failed,
            "success_rate": (passed / len(tests)) * 100,
            "test_results": self.test_results
        }

def main():
    """Main test execution"""
    tester = ProfileStorageIntegrationTester()
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