"""
Review History database model.
"""
from sqlalchemy import Column, String, Integer, Date, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import uuid


def generate_uuid():
    """Generate UUID string."""
    return str(uuid.uuid4())


class ReviewHistory(Base):
    """
    Model for review history.
    Records each time an item is reviewed.
    """
    __tablename__ = "review_history"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    learning_item_id = Column(String(36), ForeignKey("learning_items.id", ondelete="CASCADE"), nullable=False, index=True)

    # Review details
    reviewed_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    interval_days = Column(Integer, nullable=False)
    next_review_date = Column(Date, nullable=False)
    review_number = Column(Integer, nullable=False)

    # Manual review flag (True = manual, False = scheduled)
    is_manual = Column(Boolean, default=False, nullable=False)

    # Relationships
    learning_item = relationship("LearningItem", back_populates="review_history")

    def __repr__(self):
        return f"<ReviewHistory(id={self.id}, item_id={self.learning_item_id}, review_number={self.review_number})>"
