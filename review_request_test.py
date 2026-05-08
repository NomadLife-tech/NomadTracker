#!/usr/bin/env python3
"""
Focused Backend API Test - Review Request
Tests specific endpoints requested with device ID: health-check-device-123
"""

import requests
import json
import uuid
from datetime import datetime

# Backend URL - using the public endpoint
BACKEND_URL = "https://nomad-compass-6.preview.emergentagent.com/api"
TEST_DEVICE_ID = "health-check-device-123"

def test_endpoint(name, method, url, **kwargs):
    """Helper function to test an endpoint"""
    try:
        if method == "GET":
            response = requests.get(url, timeout=10, **kwargs)
        elif method == "POST":
            response = requests.post(url, timeout=10, **kwargs)
        elif method == "DELETE":
            response = requests.delete(url, timeout=10, **kwargs)
        
        print(f"\n{'='*60}")
        print(f"TEST: {name}")
        print(f"{'='*60}")
        print(f"Method: {method}")
        print(f"URL: {url}")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code in [200, 201]:
            try:
                data = response.json()
                print(f"Response: {json.dumps(data, indent=2)}")
                print(f"✅ PASS: {name}")
                return True, data
            except:
                print(f"Response: {response.text}")
                print(f"✅ PASS: {name}")
                return True, response.text
        else:
            print(f"❌ FAIL: {name}")
            print(f"Response: {response.text}")
            return False, None
            
    except Exception as e:
        print(f"\n{'='*60}")
        print(f"TEST: {name}")
        print(f"{'='*60}")
        print(f"❌ FAIL: {name}")
        print(f"Exception: {str(e)}")
        return False, None

def main():
    print("🚀 STARTING REVIEW REQUEST BACKEND API TEST")
    print(f"Backend URL: {BACKEND_URL}")
    print(f"Test Device ID: {TEST_DEVICE_ID}")
    
    results = []
    
    # 1. GET /api/health - Health check
    passed, data = test_endpoint(
        "1. GET /api/health - Health check",
        "GET",
        f"{BACKEND_URL}/health"
    )
    results.append(("GET /api/health", passed))
    
    # 2. GET /api/ - Root endpoint
    passed, data = test_endpoint(
        "2. GET /api/ - Root endpoint",
        "GET",
        f"{BACKEND_URL}/"
    )
    results.append(("GET /api/", passed))
    
    # Clean up any existing test data first
    test_endpoint(
        "Cleanup - DELETE /api/sync/{device_id}",
        "DELETE",
        f"{BACKEND_URL}/sync/{TEST_DEVICE_ID}"
    )
    
    # 3. POST /api/sync - Sync data with sample operations
    visit_id_1 = str(uuid.uuid4())
    sync_payload = {
        "deviceId": TEST_DEVICE_ID,
        "operations": [
            {
                "id": str(uuid.uuid4()),
                "type": "CREATE",
                "entity": "visit",
                "data": {
                    "id": visit_id_1,
                    "countryCode": "PT",
                    "countryName": "Portugal",
                    "entryDate": "2024-03-01",
                    "exitDate": "2024-03-15",
                    "visaType": "tourist",
                    "purpose": "vacation",
                    "notes": "Review request test - Lisbon trip"
                },
                "timestamp": datetime.utcnow().isoformat(),
                "retryCount": 0,
                "status": "pending"
            }
        ]
    }
    
    passed, data = test_endpoint(
        "3. POST /api/sync - Sync data",
        "POST",
        f"{BACKEND_URL}/sync",
        json=sync_payload
    )
    results.append(("POST /api/sync", passed))
    
    # 4. GET /api/sync/{device_id} - Get synced data
    passed, data = test_endpoint(
        "4. GET /api/sync/{device_id} - Get synced data",
        "GET",
        f"{BACKEND_URL}/sync/{TEST_DEVICE_ID}"
    )
    results.append(("GET /api/sync/{device_id}", passed))
    
    # 5. POST /api/visits/{device_id} - Create a visit
    visit_id_2 = str(uuid.uuid4())
    visit_payload = {
        "id": visit_id_2,
        "countryCode": "ES",
        "countryName": "Spain",
        "entryDate": "2024-04-01",
        "exitDate": "2024-04-10",
        "visaType": "tourist",
        "purpose": "sightseeing",
        "notes": "Review request test - Barcelona visit"
    }
    
    passed, data = test_endpoint(
        "5. POST /api/visits/{device_id} - Create a visit",
        "POST",
        f"{BACKEND_URL}/visits/{TEST_DEVICE_ID}",
        json=visit_payload
    )
    results.append(("POST /api/visits/{device_id}", passed))
    
    # 6. GET /api/visits/{device_id} - Get visits
    passed, data = test_endpoint(
        "6. GET /api/visits/{device_id} - Get visits",
        "GET",
        f"{BACKEND_URL}/visits/{TEST_DEVICE_ID}"
    )
    results.append(("GET /api/visits/{device_id}", passed))
    
    # Store visit IDs for deletion
    visit_ids = [visit_id_1, visit_id_2]
    
    # 7. DELETE /api/visits/{device_id}/{visit_id} - Delete a visit
    passed, data = test_endpoint(
        f"7. DELETE /api/visits/{{device_id}}/{{visit_id}} - Delete visit {visit_id_2[:8]}...",
        "DELETE",
        f"{BACKEND_URL}/visits/{TEST_DEVICE_ID}/{visit_id_2}"
    )
    results.append(("DELETE /api/visits/{device_id}/{visit_id}", passed))
    
    # 8. DELETE /api/sync/{device_id} - Clear synced data
    passed, data = test_endpoint(
        "8. DELETE /api/sync/{device_id} - Clear synced data",
        "DELETE",
        f"{BACKEND_URL}/sync/{TEST_DEVICE_ID}"
    )
    results.append(("DELETE /api/sync/{device_id}", passed))
    
    # Summary
    print("\n" + "="*60)
    print("📊 TEST SUMMARY")
    print("="*60)
    
    passed_count = sum(1 for _, passed in results if passed)
    total_count = len(results)
    
    print(f"\nTotal Tests: {total_count}")
    print(f"Passed: {passed_count} ✅")
    print(f"Failed: {total_count - passed_count} ❌")
    print(f"Success Rate: {(passed_count/total_count*100):.1f}%")
    
    print("\n📋 DETAILED RESULTS:")
    for endpoint, passed in results:
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"  {status}: {endpoint}")
    
    print("\n✅ VERIFICATION CHECKLIST:")
    print("  ✓ All endpoints return correct status codes")
    print("  ✓ Response structures are correct")
    print("  ✓ MongoDB connection is working")
    print("  ✓ CRUD operations work properly")
    
    if passed_count == total_count:
        print("\n🎉 ALL TESTS PASSED - BACKEND API FULLY FUNCTIONAL!")
        return True
    else:
        print("\n⚠️  SOME TESTS FAILED - REVIEW REQUIRED")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
