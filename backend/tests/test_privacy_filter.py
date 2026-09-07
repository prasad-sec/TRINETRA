import sys
import os
import importlib.util

module_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../utils/privacy_filter.py'))
spec = importlib.util.spec_from_file_location("privacy_filter", module_path)
privacy_filter = importlib.util.module_from_spec(spec)
sys.modules["privacy_filter"] = privacy_filter
spec.loader.exec_module(privacy_filter)

mask_pii_for_forensics = privacy_filter.mask_pii_for_forensics

def test_preservation():
    # URLs
    url = "https://filipkart-security.test/login?token=abc"
    assert mask_pii_for_forensics(url) == url, f"Failed URL preservation"

    # IPs
    ip_port = "192.168.1.1:8000"
    assert mask_pii_for_forensics(ip_port) == ip_port, f"Failed IP preservation"

    # Emails
    email = "support@amazon.com"
    assert mask_pii_for_forensics(email) == email, f"Failed Email preservation"

def test_masking():
    # Aadhaar
    aadhaar = "1234 5678 9012"
    assert mask_pii_for_forensics(aadhaar) == "[AADHAAR_REDACTED]", f"Failed Aadhaar masking"

    # Mobile phone
    phone = "9876543210"
    assert mask_pii_for_forensics(phone) == "[PHONE_REDACTED]", f"Failed Phone masking"

    # Mobile phone international
    phone_int = "+91 9876543210"
    assert mask_pii_for_forensics(phone_int) == "[PHONE_REDACTED]", f"Failed International Phone masking: {mask_pii_for_forensics(phone_int)}"

    # Credit card passing Luhn
    cc = "4012888888881881"
    assert mask_pii_for_forensics(cc) == "[CARD_REDACTED]", f"Failed Credit Card masking"
    
    # Credit card failing Luhn
    cc_invalid = "4012888888881882"
    assert mask_pii_for_forensics(cc_invalid) == cc_invalid, f"Masked invalid credit card"

if __name__ == "__main__":
    try:
        test_preservation()
        test_masking()
        print("ALL TESTS PASSED")
    except AssertionError as e:
        print(f"TEST FAILED: {e}")
        sys.exit(1)
