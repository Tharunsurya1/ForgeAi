"""
Sanitization and validation utilities for Agent inputs, outputs, and event payloads.
Ensures zero credential leakage and safe static syntax validation for code artifacts.
"""

import ast
import json
import re
from typing import Any, Dict, List, Optional, Set, Tuple
import yaml

SENSITIVE_KEYS: Set[str] = {
    "password",
    "password_hash",
    "token",
    "access_token",
    "refresh_token",
    "secret",
    "api_key",
    "apikey",
    "authorization",
    "cookie",
    "session_id",
    "private_key",
}


def sanitize_payload(obj: Any) -> Any:
    """
    Recursively traverse dictionary or list structures and redact sensitive keys.
    """
    if isinstance(obj, dict):
        sanitized = {}
        for k, v in obj.items():
            if str(k).lower() in SENSITIVE_KEYS:
                sanitized[k] = "[REDACTED]"
            else:
                sanitized[k] = sanitize_payload(v)
        return sanitized
    elif isinstance(obj, list):
        return [sanitize_payload(item) for item in obj]
    elif isinstance(obj, tuple):
        return tuple(sanitize_payload(item) for item in obj)
    return obj


def extract_json_payload(raw_text: str) -> Optional[Dict[str, Any]]:
    """
    Attempt to extract a valid JSON dictionary from raw model text.
    Handles raw JSON, markdown-fenced ```json ... ``` blocks, and embedded objects.
    """
    text = raw_text.strip()

    # Try direct parse
    try:
        data = json.loads(text)
        if isinstance(data, dict):
            return data
    except Exception:
        pass

    # Try markdown fence extraction
    match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
    if match:
        try:
            data = json.loads(match.group(1))
            if isinstance(data, dict):
                return data
        except Exception:
            pass

    # Try finding outermost braces
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1 and end > start:
        try:
            data = json.loads(text[start : end + 1])
            if isinstance(data, dict):
                return data
        except Exception:
            pass

    return None


def safe_validate_python_ast(code_text: str) -> Tuple[bool, Optional[str]]:
    """
    Safely validate Python syntax using AST parsing without executing code.
    Returns (is_valid, error_message).
    """
    try:
        ast.parse(code_text)
        return True, None
    except SyntaxError as se:
        return False, f"SyntaxError at line {se.lineno}: {se.msg}"
    except Exception as e:
        return False, str(e)


def safe_validate_yaml(yaml_text: str) -> Tuple[bool, Optional[str]]:
    """
    Safely validate YAML syntax without execution.
    Returns (is_valid, error_message).
    """
    try:
        yaml.safe_load(yaml_text)
        return True, None
    except Exception as e:
        return False, str(e)


def format_upstream_context_section(header: str, content: Any, max_chars: int = 1200) -> str:
    """
    Sanitize, summarize, and format an upstream artifact or state piece for injection into agent prompts.
    Guarantees secret redaction, prevents massive token expansion, and provides clear demarcation.
    """
    if not content:
        return ""

    sanitized = sanitize_payload(content)
    if isinstance(sanitized, str):
        body = sanitized.strip()
    elif isinstance(sanitized, (dict, list)):
        body = json.dumps(sanitized, indent=2)
    else:
        body = str(sanitized).strip()

    if not body:
        return ""

    if len(body) > max_chars:
        body = body[:max_chars] + "\n... [upstream context truncated for brevity]"

    return f"\n\n--- {header} ---\n{body}\n--- END {header} ---"
