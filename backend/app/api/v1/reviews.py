"""
Reviews API endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from app.api.deps import get_db
from app.services.learning_item_service import LearningItemService
from app.schemas.review import (
    ReviewResponse,
    DueItemsResponse,
    ReviewStatsResponse
)
from app.schemas.learning_item import LearningItemResponse
from app.core.exceptions import ItemNotFoundException

router = APIRouter(prefix="/reviews", tags=["reviews"])


@router.get("/due", response_model=DueItemsResponse)
def get_due_items(
    subject: Optional[str] = Query(None, description="Filter by subject"),
    target_date: Optional[date] = Query(None, description="Target date (default: today)"),
    db: Session = Depends(get_db)
):
    """
    Get all learning items due for review.

    Returns items with next_review_date <= target_date (or today).
    Includes count by subject for quick overview.

    - **subject**: Optional filter by subject
    - **target_date**: Optional target date (defaults to today)
    """
    service = LearningItemService(db)

    # Get due items
    due_items = service.get_due_items(subject=subject, target_date=target_date)
    by_subject = service.get_due_items_by_subject(target_date=target_date)

    return DueItemsResponse(
        items=[LearningItemResponse.model_validate(item) for item in due_items],
        total_due=len(due_items),
        by_subject=by_subject
    )


@router.post("/{item_id}", response_model=ReviewResponse, status_code=201)
def mark_item_reviewed(
    item_id: str,
    db: Session = Depends(get_db)
):
    """
    Mark a learning item as reviewed.

    This will:
    - Increment the review count
    - Calculate the next review date based on spaced repetition algorithm
    - Create a review history entry
    - Update the item's next_review_date

    Returns the created review record.
    """
    service = LearningItemService(db)
    try:
        updated_item, review = service.mark_as_reviewed(item_id)
        return review
    except ItemNotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/{item_id}/manual", response_model=ReviewResponse, status_code=201)
def manual_review_item(
    item_id: str,
    db: Session = Depends(get_db)
):
    """
    Manually review a learning item without affecting the schedule.

    This will:
    - Increment the manual review count
    - Create a review history entry marked as manual
    - Does NOT change next_review_date or current_interval_days
    - Schedule remains unchanged

    Returns the created review record.
    """
    service = LearningItemService(db)
    try:
        updated_item, review = service.manual_review(item_id)
        return review
    except ItemNotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/history/{item_id}", response_model=List[ReviewResponse])
def get_review_history(
    item_id: str,
    limit: int = Query(50, ge=1, le=200, description="Maximum number of reviews to return"),
    db: Session = Depends(get_db)
):
    """
    Get review history for a specific learning item.

    Returns up to `limit` most recent reviews in descending order.
    """
    service = LearningItemService(db)
    try:
        history = service.get_review_history(item_id, limit=limit)
        return [ReviewResponse.model_validate(review) for review in history]
    except ItemNotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/stats", response_model=ReviewStatsResponse)
def get_review_stats(db: Session = Depends(get_db)):
    """
    Get overall review statistics.

    Includes:
    - Total items and reviews
    - Items due today and this week
    - Reviews grouped by interval
    """
    service = LearningItemService(db)
    stats = service.get_review_stats()

    return ReviewStatsResponse(**stats)
