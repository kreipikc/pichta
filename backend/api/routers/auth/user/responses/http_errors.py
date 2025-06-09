from fastapi import HTTPException, status
from error import ErrorDetail


class UserErrorCode:
    """Аll users error codes.

    Attributes:
        USER_NOT_FOUND: User not found.
    """
    USER_NOT_FOUND = "USER_NOT_FOUND"


class HTTPError:
    """Аll authentication and authorization errors.

    Methods:
        user_not_found_404: User not found.
    """
    @staticmethod
    def user_not_found_404():
        return HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=ErrorDetail(
                code=UserErrorCode.USER_NOT_FOUND,
                reason="User not found"
            ).model_dump(),
        )