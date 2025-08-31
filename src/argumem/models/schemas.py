"""Pydantic models for data validation and serialization."""

from typing import Optional
from pydantic import BaseModel, Field
from typing import List

class Quotation(BaseModel):
    """One specific quotation."""
    text: str = Field(description="The extracted quotation text")

class Quotations_list(BaseModel):
    """List of quotations."""
    quotations: List[Quotation] = Field(description="The extracted quotations")
