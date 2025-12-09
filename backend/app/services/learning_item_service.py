"""
Learning Item Service - Business logic for managing learning items.
"""
from datetime import date, datetime, timezone
from typing import List, Optional, Dict, Tuple
from sqlalchemy.orm import Session

from app.models.learning_item import LearningItem
from app.models.review_history import ReviewHistory
from app.repositories.learning_item_repository import LearningItemRepository
from app.repositories.review_history_repository import ReviewHistoryRepository
from app.services.spaced_repetition_service import SpacedRepetitionService
from app.core.exceptions import ItemNotFoundException


class LearningItemService:
    """
    Business logic for learning items management.
    Orchestrates repositories and applies business rules.
    """

    def __init__(self, db: Session):
        self.item_repo = LearningItemRepository(db)
        self.review_repo = ReviewHistoryRepository(db)
        self.sr_service = SpacedRepetitionService()

    def create_item(
        self,
        subject: str,
        title: str,
        content: str
    ) -> LearningItem:
        """
        Create a new learning item.
        Initial review is set for today (day 0).

        Args:
            subject: Category/subject of the learning item
            title: Title of the learning item
            content: Main content to learn

        Returns:
            Created LearningItem
        """
        db_item = self.item_repo.create({
            "subject": subject.strip(),
            "title": title.strip(),
            "content": content.strip(),
            "review_count": 0,
            "next_review_date": date.today(),  # Day 0 review
            "current_interval_days": 0
        })
        return db_item

    def get_item_by_id(self, item_id: str) -> LearningItem:
        """Get a single item by ID."""
        item = self.item_repo.get_by_id(item_id)
        if not item:
            raise ItemNotFoundException(f"Learning item with ID {item_id} not found")
        return item

    def get_all_items(
        self,
        subject: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[LearningItem]:
        """Get all items with optional filtering."""
        return self.item_repo.get_all(subject=subject, skip=skip, limit=limit)

    def update_item(
        self,
        item_id: str,
        subject: Optional[str] = None,
        title: Optional[str] = None,
        content: Optional[str] = None
    ) -> LearningItem:
        """Update an existing item."""
        update_data = {}
        if subject is not None:
            update_data["subject"] = subject.strip()
        if title is not None:
            update_data["title"] = title.strip()
        if content is not None:
            update_data["content"] = content.strip()

        item = self.item_repo.update(item_id, update_data)
        if not item:
            raise ItemNotFoundException(f"Learning item with ID {item_id} not found")
        return item

    def delete_item(self, item_id: str) -> bool:
        """Soft delete an item."""
        success = self.item_repo.soft_delete(item_id)
        if not success:
            raise ItemNotFoundException(f"Learning item with ID {item_id} not found")
        return True

    def mark_as_reviewed(self, item_id: str) -> Tuple[LearningItem, ReviewHistory]:
        """
        Mark an item as reviewed and calculate next review date.
        Creates review history entry and updates item.

        Args:
            item_id: ID of the item to mark as reviewed

        Returns:
            Tuple of (updated_item, review_history)

        Raises:
            ItemNotFoundException: If item not found
        """
        # Get the item
        item = self.get_item_by_id(item_id)

        # Calculate next review
        reviewed_at = datetime.now(timezone.utc)
        new_review_count = item.review_count + 1
        next_review_date, interval_days = self.sr_service.calculate_next_review(
            current_review_count=new_review_count,
            reviewed_at=reviewed_at
        )

        # Create review history entry
        review = self.review_repo.create_review({
            "learning_item_id": item_id,
            "reviewed_at": reviewed_at,
            "interval_days": interval_days,
            "next_review_date": next_review_date,
            "review_number": new_review_count
        })

        # Update item with new review tracking
        updated_item = self.item_repo.update_review_tracking(
            item_id=item_id,
            review_count=new_review_count,
            next_review_date=next_review_date,
            interval_days=interval_days
        )

        return updated_item, review

    def manual_review(self, item_id: str) -> Tuple[LearningItem, ReviewHistory]:
        """
        Record a manual review without affecting the schedule.
        Only increments manual_review_count.
        Does NOT change next_review_date or current_interval_days.

        Args:
            item_id: ID of the item to manually review

        Returns:
            Tuple of (updated_item, review_history)

        Raises:
            ItemNotFoundException: If item not found
        """
        # Get the item
        item = self.get_item_by_id(item_id)

        # Calculate new manual review count
        reviewed_at = datetime.now(timezone.utc)
        new_manual_count = item.manual_review_count + 1

        # Create review history entry with is_manual=True
        review = self.review_repo.create_review({
            "learning_item_id": item_id,
            "reviewed_at": reviewed_at,
            "interval_days": item.current_interval_days,  # Keep current interval
            "next_review_date": item.next_review_date,  # Keep current schedule
            "review_number": new_manual_count,
            "is_manual": True  # Mark as manual review
        })

        # Update item with new manual review count only
        updated_item = self.item_repo.update_manual_review_count(
            item_id=item_id,
            manual_review_count=new_manual_count
        )

        return updated_item, review

    def get_due_items(
        self,
        subject: Optional[str] = None,
        target_date: Optional[date] = None
    ) -> List[LearningItem]:
        """
        Get all items due for review.

        Args:
            subject: Optional filter by subject
            target_date: Optional target date (defaults to today)

        Returns:
            List of items due for review
        """
        due_date = target_date or date.today()
        return self.item_repo.get_due_items(due_date, subject)

    def get_due_items_by_subject(
        self,
        target_date: Optional[date] = None
    ) -> Dict[str, int]:
        """
        Get count of due items grouped by subject.

        Args:
            target_date: Optional target date (defaults to today)

        Returns:
            Dictionary mapping subject to count
        """
        due_items = self.get_due_items(target_date=target_date)

        by_subject = {}
        for item in due_items:
            by_subject[item.subject] = by_subject.get(item.subject, 0) + 1

        return by_subject

    def get_review_stats(self) -> Dict:
        """
        Get overall review statistics.

        Returns:
            Dictionary with various statistics
        """
        total_items = self.item_repo.count_all()
        total_reviews = self.review_repo.get_total_reviews()
        items_due_today = len(self.get_due_items())

        # Items due this week
        from datetime import timedelta
        week_from_now = date.today() + timedelta(days=7)
        items_due_week = len(self.item_repo.get_due_items(week_from_now))

        reviews_by_interval = self.review_repo.get_reviews_by_interval()

        return {
            "total_items": total_items,
            "total_reviews": total_reviews,
            "items_due_today": items_due_today,
            "items_due_this_week": items_due_week,
            "reviews_by_interval": reviews_by_interval
        }

    def get_all_subjects(self) -> List[str]:
        """Get all unique subjects."""
        return self.item_repo.get_all_subjects()

    def get_review_history(self, item_id: str, limit: int = 50) -> List[ReviewHistory]:
        """Get review history for a specific item."""
        # Verify item exists
        self.get_item_by_id(item_id)
        return self.review_repo.get_item_history(item_id, limit)
