from fastapi.testclient import TestClient
from main import app  # Adjust import if your main file is named differently

client = TestClient(app)

def test_server_health():
    # Ping the server to ensure it boots up and accepts requests
    # Adjust the endpoint to match your actual health/root route (e.g., "/" or "/health")
    response = client.get("/status")
    assert response.status_code == 200
    assert "system" in response.json() or response.json() is not None

def test_payload_size_rejection():
    # Simulate the 10MB middleware block by sending a fake oversized header
    headers = {"Content-Length": "15000000"}  # 15MB
    response = client.post("/api/investigate/pdf", headers=headers)
    
    # The server should intercept and reject this before processing
    assert response.status_code == 413 or response.status_code == 400
