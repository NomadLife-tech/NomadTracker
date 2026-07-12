"""Smoke tests for Nomad Tracker backend after Cloud Save hide + data-integrity fix."""
import os
import pytest
import requests

BASE_URL = os.environ.get('EXPO_PUBLIC_BACKEND_URL', 'https://nomad-compass-6.preview.emergentagent.com').rstrip('/')


@pytest.fixture(scope="module")
def api_client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


class TestHealth:
    def test_health(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/health", timeout=10)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["status"] == "healthy"
        assert data["database"] == "connected"

    def test_root(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/", timeout=10)
        assert r.status_code == 200
        assert r.json()["status"] == "healthy"


class TestSyncSmoke:
    """Sync endpoints untouched - quick sanity check they still respond."""

    def test_get_sync_empty_device(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/sync/TEST_smoke_device", timeout=10)
        assert r.status_code == 200
        data = r.json()
        assert "visits" in data
        assert isinstance(data["visits"], list)

    def test_clear_sync_device(self, api_client):
        r = api_client.delete(f"{BASE_URL}/api/sync/TEST_smoke_device", timeout=10)
        assert r.status_code == 200
        assert r.json()["success"] is True
