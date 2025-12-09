"""
Custom exceptions for the application.
"""

class AppException(Exception):
    """Base exception for all application errors."""
    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class ItemNotFoundException(AppException):
    """Raised when a learning item is not found."""
    def __init__(self, message: str):
        super().__init__(message, status_code=404)


class ValidationException(AppException):
    """Raised for validation errors."""
    def __init__(self, message: str):
        super().__init__(message, status_code=400)


class DatabaseException(AppException):
    """Raised for database errors."""
    def __init__(self, message: str):
        super().__init__(message, status_code=500)
