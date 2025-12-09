"""
Pydantic schemas for Learning Items.
"""
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime, date
from typing import List, Optional


class LearningItemCreate(BaseModel):
    """Schema for creating a learning item."""
    subject: str = Field(..., min_length=1, max_length=255, description="Subject/category")
    title: str = Field(..., min_length=1, max_length=500, description="Title of the learning item")
    content: str = Field(..., min_length=1, description="Main learning content")


class LearningItemUpdate(BaseModel):
    """Schema for updating a learning item."""
    subject: Optional[str] = Field(None, min_length=1, max_length=255)
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    content: Optional[str] = Field(None, min_length=1)


class LearningItemResponse(BaseModel):
    """Schema for learning item response."""
    id: str
    subject: str
    title: str
    content: str
    created_at: datetime
    updated_at: datetime
    review_count: int
    next_review_date: date
    current_interval_days: int
    manual_review_count: int
    is_deleted: bool

    model_config = ConfigDict(from_attributes=True)


class LearningItemListResponse(BaseModel):
    """Schema for list of learning items."""
    items: List[LearningItemResponse]
    total: int
