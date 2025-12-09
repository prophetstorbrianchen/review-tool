"""
Learning Item database model.
"""
from sqlalchemy import Column, String, Text, Integer, Boolean, Date, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import uuid


def generate_uuid():
    """Generate UUID string."""
    return str(uuid.uuid4())


class LearningItem(Base):
    """
    Model for learning items.
    Represents a single piece of learning material to be reviewed.
    """
    __tablename__ = "learning_items"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    subject = Column(String(255), nullable=False, index=True)
    title = Column(String(500), nullable=False)
    content = Column(Text, nullable=False)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Review tracking
    review_count = Column(Integer, default=0, nullable=False)
    next_review_date = Column(Date, nullable=False, index=True)
    current_interval_days = Column(Integer, default=0, nullable=False)

    # Manual review tracking (independent from scheduled reviews)
    manual_review_count = Column(Integer, default=0, nullable=False)

    # Soft delete
    is_deleted = Column(Boolean, default=False, nullable=False)

    # Relationships
    review_history = relationship("ReviewHistory", back_populates="learning_item", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<LearningItem(id={self.id}, subject={self.subject}, title={self.title})>"
