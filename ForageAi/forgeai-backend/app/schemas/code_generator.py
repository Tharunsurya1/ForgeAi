from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class CodeFileItem(BaseModel):
    path: str = Field(..., description="Relative file path within the project scaffold")
    name: str = Field(..., description="File name")
    directory: str = Field(..., description="Directory containing the file")
    content: str = Field(..., description="File content")
    language: str = Field(..., description="Programming or markup language")
    size_bytes: int = Field(..., description="File size in bytes")
    source: str = Field(default="artifact", description="Source of the file (artifact, scaffold, generated)")
    artifact_type: Optional[str] = Field(None, description="Originating specialist agent artifact type")

    model_config = ConfigDict(from_attributes=True)


class CodeGenerateRequest(BaseModel):
    blueprint_id: UUID = Field(..., description="ID of the approved architecture blueprint")
    version: Optional[int] = Field(None, description="Optional blueprint version number")


class CodeGenerateResponse(BaseModel):
    generation_id: UUID = Field(..., description="Unique ID for this code generation run")
    blueprint_id: UUID = Field(..., description="Associated blueprint ID")
    project_id: UUID = Field(..., description="Associated project ID")
    project_name: str = Field(..., description="Project name")
    version: int = Field(..., description="Blueprint version used")
    total_files: int = Field(..., description="Total number of generated files")
    total_bytes: int = Field(..., description="Total size in bytes")
    directories: List[str] = Field(default_factory=list, description="Unique directory list")
    files: List[CodeFileItem] = Field(default_factory=list, description="All generated project files")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(from_attributes=True)


class CodeValidationIssue(BaseModel):
    path: Optional[str] = Field(None, description="Relative file path where the issue was found")
    type: str = Field(..., description="Classification of the issue (syntax_error, empty_file, unsafe_path, duplicate_path, missing_structure, invalid_metadata)")
    message: str = Field(..., description="Human-readable explanation of the validation failure")


class CodeValidationResponse(BaseModel):
    valid: bool = Field(..., description="Whether the generated project passed all validation checks")
    errors: List[CodeValidationIssue] = Field(default_factory=list, description="List of validation errors")
    warnings: List[CodeValidationIssue] = Field(default_factory=list, description="List of validation warnings")
    checked_files: int = Field(default=0, description="Total number of files evaluated")

    model_config = ConfigDict(from_attributes=True)

