import ipaddress
import urllib.parse
from typing import Optional
from schemas.investigation import IOCData
from intelligence.reputation import ThreatIntelClient

# List of suspicious keywords commonly used in phishing
SUSPICIOUS_KEYWORDS = ["login", "verify", "account", "secure", "update", "banking", "support", "auth"]

class URLEngine:
    def __init__(self, url: str):
        self.raw_url = url
        # Ensure it has a scheme if not provided for parsing
        if not self.raw_url.startswith(("http://", "https://", "ftp://")):
            self.raw_url = "http://" + self.raw_url
            
    def is_ip(self, hostname: str) -> bool:
        try:
            ipaddress.ip_address(hostname)
            return True
        except ValueError:
            return False

    def check_suspicious_keywords(self, url_string: str) -> bool:
        url_lower = url_string.lower()
        for kw in SUSPICIOUS_KEYWORDS:
            if kw in url_lower:
                return True
        return False

    async def analyze(self) -> IOCData:
        parsed_url = urllib.parse.urlparse(self.raw_url)
        
        scheme = parsed_url.scheme
        hostname = parsed_url.hostname or ""
        port = parsed_url.port
        path = parsed_url.path
        
        is_ip_address = self.is_ip(hostname)
        
        # IP heuristics check
        ip_addr: Optional[str] = hostname if is_ip_address else None
            
        # Basic reputation heuristics
        suspicious_score = 0
        
        if is_ip_address:
            suspicious_score += 2 # Raw IPs are suspicious for standard web traffic
            
        if self.check_suspicious_keywords(hostname) or self.check_suspicious_keywords(path):
            suspicious_score += 1
            
        # Basic check for excessive subdomains (e.g., login.verify.paypal.com.scammer.com)
        parts = hostname.split(".")
        if not is_ip_address and len(parts) > 3:
            suspicious_score += 1

        if suspicious_score >= 2:
            reputation = "MALICIOUS"
        elif suspicious_score == 1:
            reputation = "SUSPICIOUS"
        else:
            reputation = "BENIGN"

        ioc_dict = {
            "domain": hostname,
            "ip": ip_addr,
            "is_ip_address": is_ip_address
        }
        intel_client = ThreatIntelClient()
        intel_summary = await intel_client.gather_intelligence(ioc_dict)

        return IOCData(
            domain=hostname,
            ip=ip_addr,
            scheme=scheme,
            port=port,
            domain_age_days=None,  # Requires external WHOIS lookup not in phase 2 scope
            is_ip_address=is_ip_address,
            reputation_status=reputation,
            intel=intel_summary
        )
