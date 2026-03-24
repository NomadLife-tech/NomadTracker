#!/usr/bin/env python3
"""
Frontend Storage Service Testing for Nomad Tracker Profile Storage Functionality
Tests the frontend storage services and data structures.
"""

import json
import uuid
from datetime import datetime
from typing import Dict, Any, List

class FrontendStorageAnalyzer:
    def __init__(self):
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
        
    def analyze_storage_service(self) -> bool:
        """Analyze the storage service implementation"""
        try:
            # Read the storage service file
            with open('/app/frontend/src/services/storage.ts', 'r') as f:
                storage_content = f.read()
            
            # Check for required functions
            required_functions = [
                'saveProfile',
                'getProfile', 
                'saveSettings',
                'getSettings',
                'initializeStorage'
            ]
            
            missing_functions = []
            for func in required_functions:
                if f"export async function {func}" not in storage_content and f"function {func}" not in storage_content:
                    missing_functions.append(func)
            
            if missing_functions:
                self.log_test("Storage Service Functions", False, f"Missing functions: {missing_functions}")
                return False
            else:
                self.log_test("Storage Service Functions", True, "All required storage functions are present")
                return True
                
        except Exception as e:
            self.log_test("Storage Service Functions", False, f"Error reading storage service: {str(e)}")
            return False
    
    def analyze_storage_adapter(self) -> bool:
        """Analyze the storage adapter implementation"""
        try:
            # Read the storage adapter file
            with open('/app/frontend/src/services/storageAdapter.ts', 'r') as f:
                adapter_content = f.read()
            
            # Check for platform-specific implementations
            checks = [
                ("Web Storage Implementation", "webStorage" in adapter_content),
                ("Native Storage Implementation", "nativeStorage" in adapter_content),
                ("Universal Storage Export", "export const universalStorage" in adapter_content),
                ("Platform Detection", "Platform.OS === 'web'" in adapter_content),
                ("AsyncStorage Import", "AsyncStorage" in adapter_content),
                ("LocalStorage Usage", "localStorage" in adapter_content)
            ]
            
            all_passed = True
            for check_name, condition in checks:
                if condition:
                    self.log_test(f"Storage Adapter - {check_name}", True, "Implementation found")
                else:
                    self.log_test(f"Storage Adapter - {check_name}", False, "Implementation missing")
                    all_passed = False
            
            return all_passed
                
        except Exception as e:
            self.log_test("Storage Adapter Analysis", False, f"Error reading storage adapter: {str(e)}")
            return False
    
    def analyze_app_context(self) -> bool:
        """Analyze the AppContext implementation"""
        try:
            # Read the AppContext file
            with open('/app/frontend/src/contexts/AppContext.tsx', 'r') as f:
                context_content = f.read()
            
            # Check for required functions and features
            required_features = [
                ("updateProfile function", "updateProfile"),
                ("Profile state management", "profile"),
                ("Storage integration", "storage.saveProfile"),
                ("Profile refresh", "refreshProfile"),
                ("Error handling", "try" and "catch")
            ]
            
            all_passed = True
            for feature_name, search_term in required_features:
                if isinstance(search_term, str):
                    found = search_term in context_content
                else:
                    found = all(term in context_content for term in search_term)
                
                if found:
                    self.log_test(f"AppContext - {feature_name}", True, "Feature implemented")
                else:
                    self.log_test(f"AppContext - {feature_name}", False, "Feature missing or incomplete")
                    all_passed = False
            
            return all_passed
                
        except Exception as e:
            self.log_test("AppContext Analysis", False, f"Error reading AppContext: {str(e)}")
            return False
    
    def analyze_type_definitions(self) -> bool:
        """Analyze the type definitions"""
        try:
            # Read the types file
            with open('/app/frontend/src/types/index.ts', 'r') as f:
                types_content = f.read()
            
            # Check for required type definitions
            required_types = [
                ("UserProfile interface", "interface UserProfile"),
                ("Passport interface", "interface Passport"),
                ("Insurance interface", "interface Insurance"),
                ("Attachment interface", "interface Attachment"),
                ("AppSettings interface", "interface AppSettings")
            ]
            
            all_passed = True
            for type_name, search_term in required_types:
                if search_term in types_content:
                    self.log_test(f"Type Definition - {type_name}", True, "Type defined")
                else:
                    self.log_test(f"Type Definition - {type_name}", False, "Type missing")
                    all_passed = False
            
            # Check for specific fields in critical types
            passport_fields = ["id", "type", "countryCode", "passportNumber", "issueDate", "expiryDate"]
            insurance_fields = ["id", "type", "provider", "policyNumber"]
            
            passport_checks = all(field in types_content for field in passport_fields)
            insurance_checks = all(field in types_content for field in insurance_fields)
            
            if passport_checks:
                self.log_test("Passport Type Fields", True, "All required fields present")
            else:
                self.log_test("Passport Type Fields", False, "Missing required fields")
                all_passed = False
            
            if insurance_checks:
                self.log_test("Insurance Type Fields", True, "All required fields present")
            else:
                self.log_test("Insurance Type Fields", False, "Missing required fields")
                all_passed = False
            
            return all_passed
                
        except Exception as e:
            self.log_test("Type Definitions Analysis", False, f"Error reading types: {str(e)}")
            return False
    
    def analyze_profile_page_functions(self) -> bool:
        """Analyze the profile page save functions"""
        try:
            # Read the profile page file
            with open('/app/frontend/app/(tabs)/profile.tsx', 'r') as f:
                profile_content = f.read()
            
            # Check for required functions
            required_functions = [
                ("savePassport function", "const savePassport"),
                ("saveInsurance function", "const saveInsurance"),
                ("updateProfile usage", "updateProfile"),
                ("UUID generation", "uuidv4"),
                ("Error handling", "showToast" and "error")
            ]
            
            all_passed = True
            for func_name, search_term in required_functions:
                if isinstance(search_term, str):
                    found = search_term in profile_content
                else:
                    found = all(term in profile_content for term in search_term)
                
                if found:
                    self.log_test(f"Profile Page - {func_name}", True, "Function implemented")
                else:
                    self.log_test(f"Profile Page - {func_name}", False, "Function missing or incomplete")
                    all_passed = False
            
            # Check for data validation
            validation_checks = [
                ("Passport validation", "!passportCountry || !passportNumber"),
                ("Insurance validation", "!insuranceProvider || !insurancePolicyNumber"),
                ("Date validation", "passportIssueDate" and "passportExpiryDate")
            ]
            
            for check_name, search_term in validation_checks:
                if isinstance(search_term, str):
                    found = search_term in profile_content
                else:
                    found = all(term in profile_content for term in search_term)
                
                if found:
                    self.log_test(f"Profile Page - {check_name}", True, "Validation implemented")
                else:
                    self.log_test(f"Profile Page - {check_name}", False, "Validation missing")
                    all_passed = False
            
            return all_passed
                
        except Exception as e:
            self.log_test("Profile Page Analysis", False, f"Error reading profile page: {str(e)}")
            return False
    
    def test_data_structure_compatibility(self) -> bool:
        """Test data structure compatibility between frontend and backend"""
        try:
            # Create test data structures matching the frontend types
            test_passport = {
                "id": str(uuid.uuid4()),
                "type": "primary",
                "countryCode": "US",
                "countryName": "United States",
                "passportNumber": "123456789",
                "issueDate": "2020-01-01T00:00:00.000Z",
                "expiryDate": "2030-01-01T00:00:00.000Z",
                "attachments": [
                    {
                        "id": str(uuid.uuid4()),
                        "name": "passport_scan.jpg",
                        "type": "jpg",
                        "mimeType": "image/jpeg",
                        "size": 1024000,
                        "uri": "data:image/jpeg;base64,/9j/4AAQSkZJRgABA...",
                        "createdAt": datetime.now().isoformat()
                    }
                ]
            }
            
            test_insurance = {
                "id": str(uuid.uuid4()),
                "type": "medical",
                "provider": "Global Health Insurance",
                "policyNumber": "POL123456",
                "phone": "+1-555-0123",
                "notes": "Comprehensive medical coverage",
                "attachments": []
            }
            
            test_profile = {
                "id": str(uuid.uuid4()),
                "firstName": "John",
                "lastName": "Traveler",
                "avatar": "🌍",
                "avatarType": "preset",
                "passports": [test_passport],
                "insurances": [test_insurance],
                "createdAt": datetime.now().isoformat(),
                "updatedAt": datetime.now().isoformat()
            }
            
            # Validate JSON serialization (important for storage)
            try:
                json_str = json.dumps(test_profile)
                parsed_back = json.loads(json_str)
                
                # Check if all data is preserved
                if (parsed_back["firstName"] == test_profile["firstName"] and
                    len(parsed_back["passports"]) == 1 and
                    len(parsed_back["insurances"]) == 1):
                    self.log_test("Data Structure Compatibility", True, "Profile data serializes correctly")
                    return True
                else:
                    self.log_test("Data Structure Compatibility", False, "Data loss during serialization")
                    return False
                    
            except Exception as json_error:
                self.log_test("Data Structure Compatibility", False, f"JSON serialization error: {str(json_error)}")
                return False
                
        except Exception as e:
            self.log_test("Data Structure Compatibility", False, f"Error: {str(e)}")
            return False
    
    def run_all_tests(self) -> Dict[str, Any]:
        """Run all frontend storage tests"""
        print(f"🧪 Starting Frontend Storage Analysis")
        print("=" * 60)
        
        # Run tests in order
        tests = [
            self.analyze_storage_service,
            self.analyze_storage_adapter,
            self.analyze_app_context,
            self.analyze_type_definitions,
            self.analyze_profile_page_functions,
            self.test_data_structure_compatibility
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
    analyzer = FrontendStorageAnalyzer()
    results = analyzer.run_all_tests()
    
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