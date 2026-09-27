import ast
import json
import logging
import os
import posixpath
import re
from typing import Dict, List, Optional, Set, Tuple
from uuid import UUID

import yaml
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.code_generator import (
    CodeFileItem,
    CodeGenerateResponse,
    CodeValidationIssue,
    CodeValidationResponse,
)
from app.services.code_generator_service import CodeGeneratorService

logger = logging.getLogger("forgeai.code_validation_service")

# Regex to detect absolute paths or windows drive paths
WIN_DRIVE_PATTERN = re.compile(r"^[a-zA-Z]:")


def check_javascript_balanced_delimiters(content: str) -> Optional[str]:
    """
    Lightweight scanner to verify balanced delimiters in JS/TS files
    while ignoring strings, template literals, and comments.
    """
    stack: List[Tuple[str, int]] = []
    pairs = {")": "(", "}": "{", "]": "["}
    in_single_quote = False
    in_double_quote = False
    in_template_literal = False
    in_line_comment = False
    in_block_comment = False
    escape = False

    i = 0
    n = len(content)
    while i < n:
        c = content[i]
        next_c = content[i + 1] if i + 1 < n else ""

        if in_line_comment:
            if c == "\n":
                in_line_comment = False
            i += 1
            continue

        if in_block_comment:
            if c == "*" and next_c == "/":
                in_block_comment = False
                i += 2
                continue
            i += 1
            continue

        if escape:
            escape = False
            i += 1
            continue

        if c == "\\":
            escape = True
            i += 1
            continue

        if in_single_quote:
            if c == "'":
                in_single_quote = False
            i += 1
            continue

        if in_double_quote:
            if c == '"':
                in_double_quote = False
            i += 1
            continue

        if in_template_literal:
            if c == "`":
                in_template_literal = False
            i += 1
            continue

        # Check comment start
        if c == "/" and next_c == "/":
            in_line_comment = True
            i += 2
            continue
        if c == "/" and next_c == "*":
            in_block_comment = True
            i += 2
            continue

        # Check string start
        if c == "'":
            in_single_quote = True
            i += 1
            continue
        if c == '"':
            in_double_quote = True
            i += 1
            continue
        if c == "`":
            in_template_literal = True
            i += 1
            continue

        # Check brackets
        if c in "({[":
            stack.append((c, i))
        elif c in ")}]":
            if not stack or stack[-1][0] != pairs[c]:
                return f"Unmatched closing delimiter '{c}' at position {i}"
            stack.pop()

        i += 1

    if stack:
        unclosed = stack[-1][0]
        return f"Unclosed delimiter '{unclosed}' in file"
    return None


class CodeValidationService:
    @classmethod
    def validate_files(
        cls,
        files: List[CodeFileItem],
        expected_artifacts: Optional[List[str]] = None,
    ) -> CodeValidationResponse:
        """
        Validate generated project files against structure, security, validity, and syntax rules.
        """
        errors: List[CodeValidationIssue] = []
        warnings: List[CodeValidationIssue] = []
        seen_normalized_paths: Set[str] = set()

        has_backend = False
        has_frontend = False
        has_database = False
        has_readme = False

        # Inspect provided artifacts to dynamically determine required components
        require_backend = False
        require_frontend = False
        require_database = False

        if expected_artifacts:
            for art_type in expected_artifacts:
                if art_type in ("backend", "architecture", "api"):
                    require_backend = True
                elif art_type in ("frontend", "ui_ux"):
                    require_frontend = True
                elif art_type == "database":
                    require_database = True

        for file_item in files:
            path = file_item.path
            content = file_item.content
            lang = (file_item.language or "").lower()

            # --- 1. Path & Metadata Validity ---
            if not path or not path.strip():
                errors.append(
                    CodeValidationIssue(
                        path=None,
                        type="missing_file_path",
                        message="File item is missing a valid relative file path.",
                    )
                )
                continue

            clean_path = path.strip()

            # Check invalid metadata
            if file_item.size_bytes is not None and file_item.size_bytes < 0:
                errors.append(
                    CodeValidationIssue(
                        path=clean_path,
                        type="invalid_metadata",
                        message=f"Invalid negative file size ({file_item.size_bytes} bytes).",
                    )
                )

            # --- 2. Path Security & Normalization ---
            # Reject absolute paths (POSIX and Windows)
            if (
                clean_path.startswith("/")
                or clean_path.startswith("\\")
                or WIN_DRIVE_PATTERN.match(clean_path)
                or os.path.isabs(clean_path)
            ):
                errors.append(
                    CodeValidationIssue(
                        path=clean_path,
                        type="unsafe_path",
                        message=f"Absolute path or filesystem root escape detected: {clean_path}",
                    )
                )
                continue

            # Normalize with POSIX forward slashes
            normalized = posixpath.normpath(clean_path.replace("\\", "/"))

            # Check traversal escaping project root
            if (
                normalized.startswith("../")
                or normalized == ".."
                or "/../" in clean_path
                or "\\..\\" in clean_path
            ):
                errors.append(
                    CodeValidationIssue(
                        path=clean_path,
                        type="unsafe_path",
                        message=f"Path traversal outside project root detected: {clean_path}",
                    )
                )
                continue

            # Duplicate file path detection
            if normalized in seen_normalized_paths:
                errors.append(
                    CodeValidationIssue(
                        path=clean_path,
                        type="duplicate_path",
                        message=f"Duplicate file path detected in project scaffold: {normalized}",
                    )
                )
            else:
                seen_normalized_paths.add(normalized)

            # Detect structural roles
            if normalized.startswith("backend/") or normalized.endswith(".py"):
                has_backend = True
            if normalized.startswith("frontend/") or normalized.endswith((".tsx", ".jsx", ".ts", ".js")):
                has_frontend = True
            if normalized.startswith("db/") or normalized.endswith(".sql"):
                has_database = True
            if normalized.lower() in ("readme.md", "readme.txt", "readme"):
                has_readme = True

            # If file has artifact_type, register requirements
            if getattr(file_item, "artifact_type", None):
                art_t = file_item.artifact_type
                if art_t in ("backend", "architecture", "api"):
                    require_backend = True
                elif art_t in ("frontend", "ui_ux"):
                    require_frontend = True
                elif art_t == "database":
                    require_database = True

            # --- 3. Content Checks ---
            if (content is None or not content.strip()) and file_item.name not in ("__init__.py", ".gitkeep"):
                errors.append(
                    CodeValidationIssue(
                        path=clean_path,
                        type="empty_file",
                        message=f"File content is empty: {clean_path}",
                    )
                )
                continue

            # --- 4. Language Syntax & Structural Validation ---
            # Python AST parsing
            if lang == "python" or normalized.endswith(".py"):
                try:
                    ast.parse(content, filename=clean_path)
                except SyntaxError as e:
                    errors.append(
                        CodeValidationIssue(
                            path=clean_path,
                            type="syntax_error",
                            message=f"Python syntax error at line {e.lineno}, col {e.offset}: {e.msg}",
                        )
                    )

            # JSON syntax parsing
            elif lang == "json" or normalized.endswith(".json"):
                try:
                    json.loads(content)
                except json.JSONDecodeError as e:
                    errors.append(
                        CodeValidationIssue(
                            path=clean_path,
                            type="syntax_error",
                            message=f"JSON syntax error at line {e.lineno}, col {e.colno}: {e.msg}",
                        )
                    )

            # YAML syntax parsing
            elif lang in ("yaml", "yml") or normalized.endswith((".yaml", ".yml")):
                try:
                    yaml.safe_load(content)
                except yaml.YAMLError as e:
                    errors.append(
                        CodeValidationIssue(
                            path=clean_path,
                            type="syntax_error",
                            message=f"YAML syntax error: {str(e)}",
                        )
                    )

            # SQL syntax / structure check
            elif lang == "sql" or normalized.endswith(".sql"):
                if len(content.strip()) < 5:
                    errors.append(
                        CodeValidationIssue(
                            path=clean_path,
                            type="syntax_error",
                            message=f"SQL file lacks valid DDL or query statements: {clean_path}",
                        )
                    )

            # TypeScript / JavaScript structural balance check
            elif lang in ("typescript", "javascript", "tsx", "jsx") or normalized.endswith(
                (".ts", ".tsx", ".js", ".jsx")
            ):
                delim_err = check_javascript_balanced_delimiters(content)
                if delim_err:
                    errors.append(
                        CodeValidationIssue(
                            path=clean_path,
                            type="syntax_error",
                            message=f"JavaScript/TypeScript structure error: {delim_err}",
                        )
                    )

        # --- 5. Required Structure Checks ---
        if require_backend and not has_backend:
            errors.append(
                CodeValidationIssue(
                    path="backend/",
                    type="missing_structure",
                    message="Missing backend structure required by architecture blueprint artifacts.",
                )
            )

        if require_frontend and not has_frontend:
            errors.append(
                CodeValidationIssue(
                    path="frontend/",
                    type="missing_structure",
                    message="Missing frontend structure required by UI/UX blueprint artifacts.",
                )
            )

        if require_database and not has_database:
            errors.append(
                CodeValidationIssue(
                    path="db/",
                    type="missing_structure",
                    message="Missing database DDL/schema required by database blueprint artifacts.",
                )
            )

        if not has_readme:
            warnings.append(
                CodeValidationIssue(
                    path="README.md",
                    type="missing_documentation",
                    message="Project does not contain a root README.md documentation file.",
                )
            )

        is_valid = len(errors) == 0
        return CodeValidationResponse(
            valid=is_valid,
            errors=errors,
            warnings=warnings,
            checked_files=len(files),
        )

    @classmethod
    def validate_code_response(
        cls,
        code_response: CodeGenerateResponse,
    ) -> CodeValidationResponse:
        """Validate a pre-generated CodeGenerateResponse."""
        expected_artifacts = [
            f.artifact_type for f in code_response.files if getattr(f, "artifact_type", None)
        ]
        return cls.validate_files(code_response.files, expected_artifacts=expected_artifacts)

    @classmethod
    def validate_blueprint_code(
        cls,
        db: Session,
        blueprint_id: UUID,
        user: User,
        version: Optional[int] = None,
    ) -> CodeValidationResponse:
        """
        Validate generated code for an authorized user and blueprint.
        Ensures tenant isolation and RBAC via CodeGeneratorService.
        """
        scaffold = CodeGeneratorService.generate_project_scaffold(
            db=db,
            blueprint_id=blueprint_id,
            user=user,
            version=version,
        )
        return cls.validate_code_response(scaffold)
