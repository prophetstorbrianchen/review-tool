"""
Repository for learning items data access.
"""
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, datetime, timezone
from app.models.learning_item import LearningItem


class LearningItemRepository:
    """Data access layer for learning items."""

    def __init__(self, db: Session):
        self.db = db

    def create(self, item_data: dict) -> LearningItem:
        """Create a new learning item."""
        db_item = LearningItem(**item_data)
        self.db.add(db_item)
        self.db.commit()
        self.db.refresh(db_item)
        return db_item

    def get_by_id(self, item_id: str) -> Optional[LearningItem]:
        """Get a single item by ID."""
        return self.db.query(LearningItem).filter(
            LearningItem.id == item_id,
            LearningItem.is_deleted == False
        ).first()

    def get_all(
        self,
        subject: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[LearningItem]:
        """Get all items with optional filtering."""
        query = self.db.query(LearningItem).filter(
            LearningItem.is_deleted == False
        )

        if subject:
            query = query.filter(LearningItem.subject == subject)

        return query.order_by(
            LearningItem.created_at.desc()
        ).offset(skip).limit(limit).all()

    def get_due_items(
        self,
        due_date: date,
        subject: Optional[str] = None
    ) -> List[LearningItem]:
        """Get all items due for review by date."""
        query = self.db.query(LearningItem).filter(
            LearningItem.is_deleted == False,
            LearningItem.next_review_date <= due_date
        )

        if subject:
            query = query.filter(LearningItem.subject == subject)

        return query.order_by(
            LearningItem.next_review_date.asc(),
            LearningItem.created_at.asc()
        ).all()

    def update(self, item_id: str, update_data: dict) -> Optional[LearningItem]:
        """Update an existing item."""
        db_item = self.get_by_id(item_id)
        if not db_item:
            return None

        for key, value in update_data.items():
            if value is not None and hasattr(db_item, key):
                setattr(db_item, key, value)

        db_item.updated_at = datetime.now(timezone.utc)
        self.db.commit()
        self.db.refresh(db_item)
        return db_item

    def soft_delete(self, item_id: str) -> bool:
        """Soft delete an item."""
        db_item = self.get_by_id(item_id)
        if not db_item:
            return False

        db_item.is_deleted = True
        db_item.updated_at = datetime.now(timezone.utc)
        self.db.commit()
        return True

    def get_all_subjects(self) -> List[str]:
        """Get all unique subjects."""
        results = self.db.query(LearningItem.subject).filter(
            LearningItem.is_deleted == False
        ).distinct().order_by(LearningItem.subject).all()
        return [s[0] for s in results]

    def update_review_tracking(
        self,
        item_id: str,
        review_count: int,
        next_review_date: date,
        interval_days: int
    ) -> Optional[LearningItem]:
        """Update review tracking fields after a review."""
        db_item = self.get_by_id(item_id)
        if not db_item:
            return None

        db_item.review_count = review_count
        db_item.next_review_date = next_review_date
        db_item.current_interval_days = interval_days
        db_item.updated_at = datetime.now(timezone.utc)

        self.db.commit()
        self.db.refresh(db_item)
        return db_item

    def update_manual_review_count(self, item_id: str, manual_review_count: int) -> Optional[LearningItem]:
        """Update manual review count after a manual review."""
        db_item = self.get_by_id(item_id)
        if not db_item:
            return None

        db_item.manual_review_count = manual_review_count
        db_item.updated_at = datetime.now(timezone.utc)

        self.db.commit()
        self.db.refresh(db_item)
        return db_item

    def count_all(self, subject: Optional[str] = None) -> int:
        """Count all items."""
        query = self.db.query(LearningItem).filter(
            LearningItem.is_deleted == False
        )
        if subject:
            query = query.filter(LearningItem.subject == subject)
        return query.count()
