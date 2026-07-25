import urllib.parse
import ipaddress
from typing import Dict, Any

class URLEngine:
    def __init__(self):
        self.suspicious_keywords = [
            "login", "verify", "account", "secure", 
            "update", "banking", "signin", "credential"
        ]

    def extract_iocs(self, url: str) -> Dict[str, Any]:
        parsed = urllib.parse.urlparse(url)
        hostname = parsed.hostname or ""
        
        # Basic extractions
        scheme = parsed.scheme
        port = parsed.port
        path = parsed.path
        query_params = dict(urllib.parse.parse_qsl(parsed.query))
        
        # Feature Checks
        suspicious_flags = []
        is_raw_ip = False
        
        # Check if hostname is an IP
        if hostname:
            try:
                ipaddress.ip_address(hostname)
                is_raw_ip = True
                suspicious_flags.append("RAW_IP_HOSTNAME")
            except ValueError:
                pass

        # Subdomain count
        subdomain_count = 0
        if hostname and not is_raw_ip:
            # Simple heuristic: split by dot. E.g., www.example.com has 3 parts.
            parts = hostname.split('.')
            if len(parts) > 2:
                subdomain_count = len(parts) - 2
                if subdomain_count > 1:
                    suspicious_flags.append("EXCESSIVE_SUBDOMAINS")

        # Suspicious keywords
        has_suspicious_keywords = False
        url_lower = (hostname + path).lower()
        if any(keyword in url_lower for keyword in self.suspicious_keywords):
            has_suspicious_keywords = True
            suspicious_flags.append("SECURITY_KEYWORD_MATCH")
            
        return {
            "scheme": scheme,
            "hostname": hostname,
            "port": port,
            "path": path,
            "query_params": query_params,
            "is_raw_ip": is_raw_ip,
            "subdomain_count": subdomain_count,
            "has_suspicious_keywords": has_suspicious_keywords,
            "suspicious_flags": suspicious_flags
        }
