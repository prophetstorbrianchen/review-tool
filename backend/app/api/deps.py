"""
API dependencies.
"""
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.learning_item_service import LearningItemService


def get_learning_item_service(db: Session = None) -> LearningItemService:
    """
    Get learning item service instance.

    Args:
        db: Database session (will be injected by FastAPI Depends)

    Returns:
        LearningItemService instance
    """
    return LearningItemService(db)


# Export get_db for convenience
__all__ = ["get_db", "get_learning_item_service"]
