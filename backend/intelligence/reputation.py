import os
import asyncio
import logging
import httpx
from typing import Optional
from schemas.intelligence import VTDomainReport, AbuseIPDBReport, ThreatIntelSummary

logger = logging.getLogger(__name__)

class ThreatIntelClient:
    def __init__(self):
        self.vt_api_key = os.getenv("VT_API_KEY")
        self.abuseipdb_api_key = os.getenv("ABUSEIPDB_API_KEY")

    async def check_virustotal_domain(self, domain: str) -> Optional[VTDomainReport]:
        if not self.vt_api_key:
            logger.warning("VT_API_KEY not configured. Skipping VirusTotal check.")
            return None
        
        url = f"https://www.virustotal.com/api/v3/domains/{domain}"
        headers = {"x-apikey": self.vt_api_key}
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, headers=headers, timeout=10.0)
                response.raise_for_status()
                data = response.json().get("data", {})
                attributes = data.get("attributes", {})
                
                stats = attributes.get("last_analysis_stats", {})
                return VTDomainReport(
                    malicious_votes=stats.get("malicious", 0),
                    suspicious_votes=stats.get("suspicious", 0),
                    harmless_votes=stats.get("harmless", 0),
                    creation_date=attributes.get("creation_date"),
                    registrar=attributes.get("registrar")
                )
        except httpx.HTTPStatusError as e:
            logger.error(f"VirusTotal HTTP error for domain {domain}: {e}")
        except Exception as e:
            logger.error(f"VirusTotal request failed for domain {domain}: {e}")
            
        return None

    async def check_abuseipdb(self, ip_address: str) -> Optional[AbuseIPDBReport]:
        if not self.abuseipdb_api_key:
            logger.warning("ABUSEIPDB_API_KEY not configured. Skipping AbuseIPDB check.")
            return None
            
        url = "https://api.abuseipdb.com/api/v2/check"
        headers = {
            "Key": self.abuseipdb_api_key,
            "Accept": "application/json"
        }
        params = {
            "ipAddress": ip_address,
            "maxAgeInDays": "90"
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, headers=headers, params=params, timeout=10.0)
                response.raise_for_status()
                data = response.json().get("data", {})
                
                return AbuseIPDBReport(
                    abuse_confidence_score=data.get("abuseConfidenceScore", 0),
                    total_reports=data.get("totalReports", 0),
                    country_code=data.get("countryCode"),
                    isp=data.get("isp")
                )
        except httpx.HTTPStatusError as e:
            logger.error(f"AbuseIPDB HTTP error for IP {ip_address}: {e}")
        except Exception as e:
            logger.error(f"AbuseIPDB request failed for IP {ip_address}: {e}")
            
        return None

    async def gather_intelligence(self, ioc_data: dict) -> ThreatIntelSummary:
        domain = ioc_data.get("domain")
        ip = ioc_data.get("ip")
        is_ip_address = ioc_data.get("is_ip_address", False)
        
        vt_task = None
        abuse_task = None
        
        # If it's a domain, check VT. 
        if domain and not is_ip_address:
            vt_task = self.check_virustotal_domain(domain)
            
        # If there is an IP, check AbuseIPDB.
        if ip:
            abuse_task = self.check_abuseipdb(ip)
            
        tasks = []
        if vt_task: tasks.append(vt_task)
        if abuse_task: tasks.append(abuse_task)
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        summary = ThreatIntelSummary()
        
        # Map results back based on appended tasks
        result_idx = 0
        if vt_task:
            res = results[result_idx]
            if not isinstance(res, Exception):
                summary.vt_data = res
            else:
                logger.error(f"VT Task exception: {res}")
            result_idx += 1
            
        if abuse_task:
            res = results[result_idx]
            if not isinstance(res, Exception):
                summary.abuse_data = res
            else:
                logger.error(f"AbuseIPDB Task exception: {res}")
                
        return summary
