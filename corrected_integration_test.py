#!/usr/bin/env python3
"""
Corrected Integration Testing for Nomad Tracker Profile Storage Functionality
Tests the complete flow simulating actual frontend behavior.
"""

import requests
import json
import uuid
from datetime import datetime
from typing import Dict, Any, List

# Get backend URL from frontend env
BACKEND_URL = "https://nomad-compass-6.preview.emergentagent.com/api"

class CorrectedProfileStorageIntegrationTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.test_device_id = f"corrected-test-{uuid.uuid4().hex[:8]}"
        self.test_results = []
        self.current_profile = None
        
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
        
    def create_initial_profile(self) -> bool:
        """Create initial empty profile"""
        try:
            self.current_profile = {
                "id": str(uuid.uuid4()),
                "firstName": "Test",
                "lastName": "User",
                "avatar": "🌍",
                "avatarType": "preset",
                "passports": [],
                "insurances": [],
                "createdAt": datetime.now().isoformat(),
                "updatedAt": datetime.now().isoformat()
            }
            
            sync_request = {
                "deviceId": self.test_device_id,
                "operations": [
                    {
                        "id": str(uuid.uuid4()),
                        "type": "CREATE",
                        "entity": "profile",
                        "data": self.current_profile,
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
                    self.log_test("Create Initial Profile", True, "Initial profile created successfully")
                    return True
                else:
                    self.log_test("Create Initial Profile", False, f"Failed to create profile: {data}")
                    return False
            else:
                self.log_test("Create Initial Profile", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Create Initial Profile", False, f"Error: {str(e)}")
            return False
    
    def test_add_passport_to_profile(self) -> bool:
        """Test adding a passport to existing profile (simulating savePassport function)"""
        try:
            # Simulate the savePassport function behavior
            new_passport = {
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
            
            # Add passport to current profile (simulating frontend logic)
            updated_profile = self.current_profile.copy()
            updated_profile["passports"] = [new_passport]
            updated_profile["updatedAt"] = datetime.now().isoformat()
            
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
            
            response = requests.post(
                f"{self.base_url}/sync",
                json=sync_request,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    # Update local state
                    self.current_profile = updated_profile
                    
                    # Verify the passport was saved
                    retrieve_response = requests.get(f"{self.base_url}/sync/{self.test_device_id}")
                    if retrieve_response.status_code == 200:
                        retrieved_data = retrieve_response.json()
                        profile = retrieved_data.get("profile", {})
                        passports = profile.get("passports", [])
                        
                        if len(passports) == 1 and passports[0].get("passportNumber") == "A12345678":
                            self.log_test("Add Passport to Profile", True, "Passport added successfully")
                            return True
                        else:
                            self.log_test("Add Passport to Profile", False, f"Passport not found or incorrect: {passports}")
                            return False
                    else:
                        self.log_test("Add Passport to Profile", False, "Failed to retrieve updated profile")
                        return False
                else:
                    self.log_test("Add Passport to Profile", False, f"Sync failed: {data}")
                    return False
            else:
                self.log_test("Add Passport to Profile", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Add Passport to Profile", False, f"Error: {str(e)}")
            return False
    
    def test_add_insurance_to_profile(self) -> bool:
        """Test adding insurance to existing profile (simulating saveInsurance function)"""
        try:
            # Simulate the saveInsurance function behavior
            new_insurance = {
                "id": str(uuid.uuid4()),
                "type": "medical",
                "provider": "Global Health Insurance Co.",
                "policyNumber": "GHI-2024-001",
                "phone": "+1-800-555-HEALTH",
                "notes": "Comprehensive worldwide medical coverage",
                "attachments": []
            }
            
            # Add insurance to current profile (simulating frontend logic)
            updated_profile = self.current_profile.copy()
            updated_profile["insurances"] = [new_insurance]
            updated_profile["updatedAt"] = datetime.now().isoformat()
            
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
            
            response = requests.post(
                f"{self.base_url}/sync",
                json=sync_request,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    # Update local state
                    self.current_profile = updated_profile
                    
                    # Verify both passport and insurance are present
                    retrieve_response = requests.get(f"{self.base_url}/sync/{self.test_device_id}")
                    if retrieve_response.status_code == 200:
                        retrieved_data = retrieve_response.json()
                        profile = retrieved_data.get("profile", {})
                        passports = profile.get("passports", [])
                        insurances = profile.get("insurances", [])
                        
                        if (len(passports) == 1 and len(insurances) == 1 and
                            insurances[0].get("policyNumber") == "GHI-2024-001"):
                            self.log_test("Add Insurance to Profile", True, "Insurance added successfully, passport preserved")
                            return True
                        else:
                            self.log_test("Add Insurance to Profile", False, 
                                        f"Data mismatch - passports: {len(passports)}, insurances: {len(insurances)}")
                            return False
                    else:
                        self.log_test("Add Insurance to Profile", False, "Failed to retrieve updated profile")
                        return False
                else:
                    self.log_test("Add Insurance to Profile", False, f"Sync failed: {data}")
                    return False
            else:
                self.log_test("Add Insurance to Profile", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Add Insurance to Profile", False, f"Error: {str(e)}")
            return False
    
    def test_add_second_passport(self) -> bool:
        """Test adding a second passport to profile"""
        try:
            # Add second passport
            second_passport = {
                "id": str(uuid.uuid4()),
                "type": "secondary",
                "countryCode": "CA",
                "countryName": "Canada",
                "passportNumber": "CA987654321",
                "issueDate": "2019-06-01T00:00:00.000Z",
                "expiryDate": "2029-06-01T00:00:00.000Z",
                "attachments": []
            }
            
            # Add to existing passports
            updated_profile = self.current_profile.copy()
            updated_profile["passports"] = updated_profile["passports"] + [second_passport]
            updated_profile["updatedAt"] = datetime.now().isoformat()
            
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
            
            response = requests.post(
                f"{self.base_url}/sync",
                json=sync_request,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    # Update local state
                    self.current_profile = updated_profile
                    
                    # Verify all data is present
                    retrieve_response = requests.get(f"{self.base_url}/sync/{self.test_device_id}")
                    if retrieve_response.status_code == 200:
                        retrieved_data = retrieve_response.json()
                        profile = retrieved_data.get("profile", {})
                        passports = profile.get("passports", [])
                        insurances = profile.get("insurances", [])
                        
                        if len(passports) == 2 and len(insurances) == 1:
                            passport_numbers = [p.get("passportNumber") for p in passports]
                            if "A12345678" in passport_numbers and "CA987654321" in passport_numbers:
                                self.log_test("Add Second Passport", True, "Second passport added, all data preserved")
                                return True
                            else:
                                self.log_test("Add Second Passport", False, f"Passport numbers incorrect: {passport_numbers}")
                                return False
                        else:
                            self.log_test("Add Second Passport", False, 
                                        f"Count mismatch - passports: {len(passports)}, insurances: {len(insurances)}")
                            return False
                    else:
                        self.log_test("Add Second Passport", False, "Failed to retrieve updated profile")
                        return False
                else:
                    self.log_test("Add Second Passport", False, f"Sync failed: {data}")
                    return False
            else:
                self.log_test("Add Second Passport", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Add Second Passport", False, f"Error: {str(e)}")
            return False
    
    def test_edit_existing_passport(self) -> bool:
        """Test editing an existing passport"""
        try:
            # Edit the first passport
            updated_profile = self.current_profile.copy()
            if len(updated_profile["passports"]) > 0:
                updated_profile["passports"][0]["passportNumber"] = "A99999999"  # Changed number
                updated_profile["passports"][0]["notes"] = "Updated passport number"
                updated_profile["updatedAt"] = datetime.now().isoformat()
                
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
                
                response = requests.post(
                    f"{self.base_url}/sync",
                    json=sync_request,
                    headers={"Content-Type": "application/json"},
                    timeout=10
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("success"):
                        # Update local state
                        self.current_profile = updated_profile
                        
                        # Verify the edit was saved
                        retrieve_response = requests.get(f"{self.base_url}/sync/{self.test_device_id}")
                        if retrieve_response.status_code == 200:
                            retrieved_data = retrieve_response.json()
                            profile = retrieved_data.get("profile", {})
                            passports = profile.get("passports", [])
                            
                            if len(passports) == 2:
                                passport_numbers = [p.get("passportNumber") for p in passports]
                                if "A99999999" in passport_numbers and "CA987654321" in passport_numbers:
                                    self.log_test("Edit Existing Passport", True, "Passport edited successfully")
                                    return True
                                else:
                                    self.log_test("Edit Existing Passport", False, f"Edit not reflected: {passport_numbers}")
                                    return False
                            else:
                                self.log_test("Edit Existing Passport", False, f"Passport count changed: {len(passports)}")
                                return False
                        else:
                            self.log_test("Edit Existing Passport", False, "Failed to retrieve updated profile")
                            return False
                    else:
                        self.log_test("Edit Existing Passport", False, f"Sync failed: {data}")
                        return False
                else:
                    self.log_test("Edit Existing Passport", False, f"HTTP {response.status_code}: {response.text}")
                    return False
            else:
                self.log_test("Edit Existing Passport", False, "No passports to edit")
                return False
                
        except Exception as e:
            self.log_test("Edit Existing Passport", False, f"Error: {str(e)}")
            return False
    
    def test_delete_passport(self) -> bool:
        """Test deleting a passport"""
        try:
            # Remove the first passport
            updated_profile = self.current_profile.copy()
            if len(updated_profile["passports"]) > 1:
                updated_profile["passports"] = updated_profile["passports"][1:]  # Remove first passport
                updated_profile["updatedAt"] = datetime.now().isoformat()
                
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
                
                response = requests.post(
                    f"{self.base_url}/sync",
                    json=sync_request,
                    headers={"Content-Type": "application/json"},
                    timeout=10
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("success"):
                        # Update local state
                        self.current_profile = updated_profile
                        
                        # Verify the deletion
                        retrieve_response = requests.get(f"{self.base_url}/sync/{self.test_device_id}")
                        if retrieve_response.status_code == 200:
                            retrieved_data = retrieve_response.json()
                            profile = retrieved_data.get("profile", {})
                            passports = profile.get("passports", [])
                            insurances = profile.get("insurances", [])
                            
                            if len(passports) == 1 and len(insurances) == 1:
                                remaining_passport = passports[0]
                                if remaining_passport.get("passportNumber") == "CA987654321":
                                    self.log_test("Delete Passport", True, "Passport deleted successfully, other data preserved")
                                    return True
                                else:
                                    self.log_test("Delete Passport", False, f"Wrong passport remained: {remaining_passport.get('passportNumber')}")
                                    return False
                            else:
                                self.log_test("Delete Passport", False, f"Unexpected counts - passports: {len(passports)}, insurances: {len(insurances)}")
                                return False
                        else:
                            self.log_test("Delete Passport", False, "Failed to retrieve updated profile")
                            return False
                    else:
                        self.log_test("Delete Passport", False, f"Sync failed: {data}")
                        return False
                else:
                    self.log_test("Delete Passport", False, f"HTTP {response.status_code}: {response.text}")
                    return False
            else:
                self.log_test("Delete Passport", False, "Not enough passports to delete")
                return False
                
        except Exception as e:
            self.log_test("Delete Passport", False, f"Error: {str(e)}")
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
        """Run all corrected integration tests"""
        print(f"🧪 Starting Corrected Profile Storage Integration Tests")
        print(f"📡 Backend URL: {self.base_url}")
        print(f"🔧 Test Device ID: {self.test_device_id}")
        print("=" * 60)
        
        # Run tests in order
        tests = [
            self.create_initial_profile,
            self.test_add_passport_to_profile,
            self.test_add_insurance_to_profile,
            self.test_add_second_passport,
            self.test_edit_existing_passport,
            self.test_delete_passport,
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
                    # Stop on first failure to avoid cascading issues
                    break
            except Exception as e:
                print(f"❌ FAIL {test.__name__}: Unexpected error: {str(e)}")
                failed += 1
                break
        
        print("=" * 60)
        print(f"📊 Corrected Integration Test Results: {passed} passed, {failed} failed")
        
        return {
            "total_tests": len(tests),
            "passed": passed,
            "failed": failed,
            "success_rate": (passed / len(tests)) * 100,
            "test_results": self.test_results
        }

def main():
    """Main test execution"""
    tester = CorrectedProfileStorageIntegrationTester()
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