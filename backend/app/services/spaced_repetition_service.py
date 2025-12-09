"""
Spaced Repetition Service - Core algorithm for review scheduling.
"""
from datetime import datetime, timedelta, date
from typing import Tuple
from app.core.constants import REVIEW_INTERVALS, CYCLE_BACK_TO_LEVEL


class SpacedRepetitionService:
    """
    Core business logic for spaced repetition algorithm.
    Stateless service that calculates review schedules.
    """

    def __init__(self):
        self.intervals = REVIEW_INTERVALS

    def calculate_next_review(
        self,
        current_review_count: int,
        reviewed_at: datetime
    ) -> Tuple[date, int]:
        """
        Calculate next review date and interval based on review count.

        The algorithm uses fixed intervals:
        - Review 0 (creation): Day 0 (same day)
        - Review 1: Day 1 (next day)
        - Review 2: Day 3
        - Review 3: Day 7
        - Review 4: Day 30
        - Review 5+: Cycle back to Day 7 for continuous reinforcement

        Args:
            current_review_count: Number of reviews completed (after this review)
            reviewed_at: Timestamp of current review

        Returns:
            Tuple of (next_review_date, interval_days)
        """
        # Determine interval index
        if current_review_count >= len(self.intervals):
            # After completing all intervals, cycle back to maintain knowledge
            interval_days = self.intervals[CYCLE_BACK_TO_LEVEL]
        else:
            interval_days = self.intervals[current_review_count]

        # Calculate next review date
        next_review_date = (reviewed_at + timedelta(days=interval_days)).date()

        return next_review_date, interval_days

    def get_due_filter_date(self, target_date: date = None) -> date:
        """
        Get the cutoff date for due items.
        Items with next_review_date <= target_date are due.

        Args:
            target_date: Target date (defaults to today)

        Returns:
            The target date for filtering
        """
        return target_date or date.today()
