"""
Pydantic schemas for Reviews.
"""
from pydantic import BaseModel, ConfigDict
from datetime import datetime, date
from typing import List, Dict
from app.schemas.learning_item import LearningItemResponse


class ReviewResponse(BaseModel):
    """Schema for review history response."""
    id: str
    learning_item_id: str
    reviewed_at: datetime
    interval_days: int
    next_review_date: date
    review_number: int
    is_manual: bool

    model_config = ConfigDict(from_attributes=True)


class DueItemsResponse(BaseModel):
    """Schema for due items response."""
    items: List[LearningItemResponse]
    total_due: int
    by_subject: Dict[str, int]


class ReviewStatsResponse(BaseModel):
    """Schema for review statistics response."""
    total_items: int
    total_reviews: int
    items_due_today: int
    items_due_this_week: int
    reviews_by_interval: Dict[int, int]
