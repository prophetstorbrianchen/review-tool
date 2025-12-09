"""
Learning Items API endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.api.deps import get_db
from app.services.learning_item_service import LearningItemService
from app.schemas.learning_item import (
    LearningItemCreate,
    LearningItemUpdate,
    LearningItemResponse,
    LearningItemListResponse
)
from app.core.exceptions import ItemNotFoundException

router = APIRouter(prefix="/learning-items", tags=["learning-items"])


@router.post("/", response_model=LearningItemResponse, status_code=201)
def create_learning_item(
    item_data: LearningItemCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new learning item.

    The item will be automatically set for review today (Day 0).
    Timestamp is automatically added.
    """
    service = LearningItemService(db)
    item = service.create_item(
        subject=item_data.subject,
        title=item_data.title,
        content=item_data.content
    )
    return item


@router.get("/", response_model=LearningItemListResponse)
def get_learning_items(
    subject: Optional[str] = Query(None, description="Filter by subject"),
    skip: int = Query(0, ge=0, description="Number of items to skip"),
    limit: int = Query(100, ge=1, le=500, description="Number of items to return"),
    db: Session = Depends(get_db)
):
    """
    Get all learning items with optional filtering.

    - **subject**: Filter by subject
    - **skip**: Pagination offset
    - **limit**: Maximum number of items to return
    """
    service = LearningItemService(db)
    items = service.get_all_items(subject=subject, skip=skip, limit=limit)
    total = service.item_repo.count_all(subject=subject)

    return LearningItemListResponse(items=items, total=total)


@router.get("/subjects", response_model=List[str])
def get_subjects(db: Session = Depends(get_db)):
    """
    Get all unique subjects.

    Returns a list of all subjects currently in use.
    """
    service = LearningItemService(db)
    return service.get_all_subjects()


@router.get("/{item_id}", response_model=LearningItemResponse)
def get_learning_item(
    item_id: str,
    db: Session = Depends(get_db)
):
    """
    Get a single learning item by ID.
    """
    service = LearningItemService(db)
    try:
        item = service.get_item_by_id(item_id)
        return item
    except ItemNotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.put("/{item_id}", response_model=LearningItemResponse)
def update_learning_item(
    item_id: str,
    item_data: LearningItemUpdate,
    db: Session = Depends(get_db)
):
    """
    Update an existing learning item.

    Only provided fields will be updated.
    """
    service = LearningItemService(db)
    try:
        item = service.update_item(
            item_id=item_id,
            subject=item_data.subject,
            title=item_data.title,
            content=item_data.content
        )
        return item
    except ItemNotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/{item_id}", status_code=204)
def delete_learning_item(
    item_id: str,
    db: Session = Depends(get_db)
):
    """
    Delete a learning item (soft delete).

    The item will be marked as deleted but not removed from the database.
    """
    service = LearningItemService(db)
    try:
        service.delete_item(item_id)
        return None
    except ItemNotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
