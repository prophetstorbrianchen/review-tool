"""
Repository for review history data access.
"""
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict
from app.models.review_history import ReviewHistory


class ReviewHistoryRepository:
    """Data access layer for review history."""

    def __init__(self, db: Session):
        self.db = db

    def create_review(self, review_data: dict) -> ReviewHistory:
        """Record a review in history."""
        db_review = ReviewHistory(**review_data)
        self.db.add(db_review)
        self.db.commit()
        self.db.refresh(db_review)
        return db_review

    def get_item_history(
        self,
        item_id: str,
        limit: int = 50
    ) -> List[ReviewHistory]:
        """Get review history for a specific item."""
        return self.db.query(ReviewHistory).filter(
            ReviewHistory.learning_item_id == item_id
        ).order_by(
            ReviewHistory.reviewed_at.desc()
        ).limit(limit).all()

    def get_total_reviews(self) -> int:
        """Get total count of all reviews."""
        return self.db.query(ReviewHistory).count()

    def get_reviews_by_interval(self) -> Dict[int, int]:
        """Get count of reviews grouped by interval."""
        results = self.db.query(
            ReviewHistory.interval_days,
            func.count(ReviewHistory.id)
        ).group_by(ReviewHistory.interval_days).all()

        return {interval: count for interval, count in results}
