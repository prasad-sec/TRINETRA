"""
Compatibility shim for utils module.
Re-exports functions from the utils package.
"""
from utils import parse_msg_file, parse_llm_json, mask_pii_for_forensics

__all__ = ["parse_msg_file", "parse_llm_json", "mask_pii_for_forensics"]
