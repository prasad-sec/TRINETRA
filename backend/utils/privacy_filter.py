import re

def is_luhn_valid(cc_num: str) -> bool:
    """Check if a credit card number is valid according to the Luhn algorithm."""
    digits = [int(c) for c in cc_num if c.isdigit()]
    if not digits:
        return False
    checksum = 0
    reverse_digits = digits[::-1]
    for i, digit in enumerate(reverse_digits):
        if i % 2 == 1:
            digit *= 2
            if digit > 9:
                digit -= 9
        checksum += digit
    return checksum % 10 == 0

def mask_pii_for_forensics(text: str) -> str:
    """
    Mask PII (Credit Cards, Phone Numbers, Aadhaar) from unstructured text,
    while explicitly avoiding URLs, IPs, emails, and header domains.
    """
    try:
        if not isinstance(text, str):
            return text
            
        masked_text = text
        
        # 1. Mask Indian Aadhaar numbers: 4 digits, space, 4 digits, space, 4 digits
        masked_text = re.sub(r'\b\d{4}\s\d{4}\s\d{4}\b', '[AADHAAR_REDACTED]', masked_text)
        
        # 2. Mask Credit Cards (13-19 digits). We will find them, check Luhn, then replace.
        cc_pattern = re.compile(r'\b(?:\d[ -]*?){13,19}\b')
        def cc_repl(match):
            val = match.group(0)
            if is_luhn_valid(val):
                return '[CARD_REDACTED]'
            return val
        masked_text = cc_pattern.sub(cc_repl, masked_text)
        
        # 3. Mask 10-digit and international phone numbers.
        # Use negative lookbehind/lookahead to prevent masking inside IPs/URLs/Email
        phone_pattern = re.compile(r'(?<![\w:.])(?:\+\d{1,3}[-\s]?)?\d{10}(?![\w:.])')
        masked_text = phone_pattern.sub('[PHONE_REDACTED]', masked_text)

        return masked_text
    except Exception as e:
        # Fail-safe
        return text
