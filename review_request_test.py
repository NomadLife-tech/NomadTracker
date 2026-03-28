#!/usr/bin/env python3
"""
Specific test for the review request - Cloud Sync functionality
Testing the exact endpoints and data format specified in the review request
"""

import requests
import json
from datetime import datetime

# Backend URL from environment
BACKEND_URL = "https://nomad-compass-6.preview.emergentagent.com/api"

def test_review_request_endpoints():
    """Test the exact endpoints and data format from the review request"""
    print("🧪 TESTING REVIEW REQUEST SPECIFIC ENDPOINTS")
    print("=" * 60)
    
    results = []
    
    # 1. Health Check - GET /api/health
    print("\n1. Testing GET /api/health")
    try:
        response = requests.get(f"{BACKEND_URL}/health", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get("status") == "healthy":
                print("✅ PASS: Health check returns status: healthy")
                results.append(("GET /api/health", True, f"Status: {data.get('status')}"))
            else:
                print(f"❌ FAIL: Health check status is {data.get('status')}")
                results.append(("GET /api/health", False, f"Status: {data.get('status')}"))
        else:
            print(f"❌ FAIL: Health check returned status code {response.status_code}")
            results.append(("GET /api/health", False, f"Status code: {response.status_code}"))
    except Exception as e:
        print(f"❌ FAIL: Health check exception: {str(e)}")
        results.append(("GET /api/health", False, f"Exception: {str(e)}"))
    
    # 2. Sync Batch Operations - POST /api/sync
    print("\n2. Testing POST /api/sync with exact test data")
    test_data = {
        "deviceId": "test-device-123",
        "operations": [
            {
                "id": "op-1",
                "type": "CREATE",
                "entity": "visit",
                "data": {
                    "id": "visit-1",
                    "countryCode": "PT",
                    "countryName": "Portugal",
                    "entryDate": "2025-01-01",
                    "exitDate": "2025-01-15",
                    "visaType": "Schengen C"
                },
                "timestamp": "2025-03-28T12:00:00Z",
                "retryCount": 0,
                "status": "pending"
            }
        ]
    }
    
    try:
        response = requests.post(f"{BACKEND_URL}/sync", json=test_data, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get("success") and data.get("processedCount") == 1:
                print("✅ PASS: Sync batch operation successful")
                results.append(("POST /api/sync", True, f"Processed {data.get('processedCount')} operations"))
            else:
                print(f"❌ FAIL: Sync batch operation failed: {data}")
                results.append(("POST /api/sync", False, f"Failed: {data}"))
        else:
            print(f"❌ FAIL: Sync batch operation returned status code {response.status_code}")
            results.append(("POST /api/sync", False, f"Status code: {response.status_code}"))
    except Exception as e:
        print(f"❌ FAIL: Sync batch operation exception: {str(e)}")
        results.append(("POST /api/sync", False, f"Exception: {str(e)}"))
    
    # 3. Get Synced Data - GET /api/sync/test-device-123
    print("\n3. Testing GET /api/sync/test-device-123")
    try:
        response = requests.get(f"{BACKEND_URL}/sync/test-device-123", timeout=10)
        if response.status_code == 200:
            data = response.json()
            visits = data.get("visits", [])
            if len(visits) > 0:
                visit = visits[0]
                if visit.get("id") == "visit-1" and visit.get("countryCode") == "PT":
                    print("✅ PASS: Retrieved synced visit data correctly")
                    results.append(("GET /api/sync/test-device-123", True, f"Found visit with ID: {visit.get('id')}"))
                else:
                    print(f"❌ FAIL: Visit data doesn't match expected values: {visit}")
                    results.append(("GET /api/sync/test-device-123", False, f"Incorrect visit data: {visit}"))
            else:
                print("❌ FAIL: No visits found in synced data")
                results.append(("GET /api/sync/test-device-123", False, "No visits found"))
        else:
            print(f"❌ FAIL: Get synced data returned status code {response.status_code}")
            results.append(("GET /api/sync/test-device-123", False, f"Status code: {response.status_code}"))
    except Exception as e:
        print(f"❌ FAIL: Get synced data exception: {str(e)}")
        results.append(("GET /api/sync/test-device-123", False, f"Exception: {str(e)}"))
    
    # 4. Direct Visit Operations - POST /api/visits/test-device-123
    print("\n4. Testing POST /api/visits/test-device-123")
    visit_data = {
        "id": "visit-2",
        "countryCode": "ES",
        "countryName": "Spain",
        "entryDate": "2025-02-01",
        "exitDate": "2025-02-10",
        "visaType": "Schengen C"
    }
    
    try:
        response = requests.post(f"{BACKEND_URL}/visits/test-device-123", json=visit_data, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get("success") and data.get("id") == "visit-2":
                print("✅ PASS: Direct visit creation successful")
                results.append(("POST /api/visits/test-device-123", True, f"Created visit: {data.get('id')}"))
            else:
                print(f"❌ FAIL: Direct visit creation failed: {data}")
                results.append(("POST /api/visits/test-device-123", False, f"Failed: {data}"))
        else:
            print(f"❌ FAIL: Direct visit creation returned status code {response.status_code}")
            results.append(("POST /api/visits/test-device-123", False, f"Status code: {response.status_code}"))
    except Exception as e:
        print(f"❌ FAIL: Direct visit creation exception: {str(e)}")
        results.append(("POST /api/visits/test-device-123", False, f"Exception: {str(e)}"))
    
    # 5. List all visits - GET /api/visits/test-device-123
    print("\n5. Testing GET /api/visits/test-device-123")
    try:
        response = requests.get(f"{BACKEND_URL}/visits/test-device-123", timeout=10)
        if response.status_code == 200:
            data = response.json()
            visits = data.get("visits", [])
            if len(visits) >= 2:  # Should have both visits now
                print(f"✅ PASS: Retrieved {len(visits)} visits")
                results.append(("GET /api/visits/test-device-123", True, f"Found {len(visits)} visits"))
            else:
                print(f"❌ FAIL: Expected at least 2 visits, found {len(visits)}")
                results.append(("GET /api/visits/test-device-123", False, f"Only found {len(visits)} visits"))
        else:
            print(f"❌ FAIL: List visits returned status code {response.status_code}")
            results.append(("GET /api/visits/test-device-123", False, f"Status code: {response.status_code}"))
    except Exception as e:
        print(f"❌ FAIL: List visits exception: {str(e)}")
        results.append(("GET /api/visits/test-device-123", False, f"Exception: {str(e)}"))
    
    # 6. Delete a visit - DELETE /api/visits/test-device-123/visit-2
    print("\n6. Testing DELETE /api/visits/test-device-123/visit-2")
    try:
        response = requests.delete(f"{BACKEND_URL}/visits/test-device-123/visit-2", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get("success"):
                print("✅ PASS: Visit deletion successful")
                results.append(("DELETE /api/visits/test-device-123/visit-2", True, "Visit deleted"))
            else:
                print(f"❌ FAIL: Visit deletion failed: {data}")
                results.append(("DELETE /api/visits/test-device-123/visit-2", False, f"Failed: {data}"))
        else:
            print(f"❌ FAIL: Visit deletion returned status code {response.status_code}")
            results.append(("DELETE /api/visits/test-device-123/visit-2", False, f"Status code: {response.status_code}"))
    except Exception as e:
        print(f"❌ FAIL: Visit deletion exception: {str(e)}")
        results.append(("DELETE /api/visits/test-device-123/visit-2", False, f"Exception: {str(e)}"))
    
    # 7. Clear Device Data - DELETE /api/sync/test-device-123
    print("\n7. Testing DELETE /api/sync/test-device-123")
    try:
        response = requests.delete(f"{BACKEND_URL}/sync/test-device-123", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get("success"):
                print("✅ PASS: Device data cleared successfully")
                results.append(("DELETE /api/sync/test-device-123", True, "Device data cleared"))
            else:
                print(f"❌ FAIL: Device data clear failed: {data}")
                results.append(("DELETE /api/sync/test-device-123", False, f"Failed: {data}"))
        else:
            print(f"❌ FAIL: Device data clear returned status code {response.status_code}")
            results.append(("DELETE /api/sync/test-device-123", False, f"Status code: {response.status_code}"))
    except Exception as e:
        print(f"❌ FAIL: Device data clear exception: {str(e)}")
        results.append(("DELETE /api/sync/test-device-123", False, f"Exception: {str(e)}"))
    
    # Summary
    print("\n" + "=" * 60)
    print("📋 REVIEW REQUEST TEST SUMMARY")
    print("=" * 60)
    
    passed = [r for r in results if r[1]]
    failed = [r for r in results if not r[1]]
    
    print(f"Total Tests: {len(results)}")
    print(f"Passed: {len(passed)} ✅")
    print(f"Failed: {len(failed)} ❌")
    print(f"Success Rate: {(len(passed)/len(results)*100):.1f}%")
    
    if failed:
        print("\n❌ FAILED TESTS:")
        for test_name, _, details in failed:
            print(f"  - {test_name}: {details}")
    
    print("\n✅ PASSED TESTS:")
    for test_name, _, details in passed:
        print(f"  - {test_name}: {details}")
    
    return len(failed) == 0

if __name__ == "__main__":
    success = test_review_request_endpoints()
    
    if success:
        print("\n🎉 ALL REVIEW REQUEST TESTS PASSED!")
    else:
        print("\n⚠️  SOME REVIEW REQUEST TESTS FAILED!")
        exit(1)