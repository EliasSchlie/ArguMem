"""Pydantic models for data validation and serialization."""

from typing import Optional
from pydantic import BaseModel, Field


class Quotation(BaseModel):
    """Schema for extracted quotations."""
    text: str = Field(description="The exact quotation text")
    locator: Optional[str] = Field(default=None, description="Location/reference within the source (page, paragraph, etc.)")
