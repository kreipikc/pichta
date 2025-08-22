from fastapi import HTTPException, status
from error import ErrorDetail


class IdentErrorCode:
    """Аll authentication and authorization error codes.

    Attributes:
        BAD_CREDENTIALS: Bad credentials.
        USER_NOT_ACTIVE: User is not active.
        INVALID_TOKEN: Invalid token.
        ENDPOINT_NOT_FOUND: Endpoint not found.
        NO_ACCESS_RIGHTS: No required access rights.
        DATA_OUT_OF_DATE: The data is out of date.
        LOGIN_ALREADY_EXISTS: Login is already taken.
        REFRESH_TOKEN_IN_BLACK_LIST: Refresh_token in black list.
    """
    BAD_CREDENTIALS = "BAD_CREDENTIALS"
    USER_NOT_ACTIVE = "USER_NOT_ACTIVE"
    INVALID_TOKEN = "INVALID_TOKEN"
    ENDPOINT_NOT_FOUND = "ENDPOINT_NOT_FOUND"
    NO_ACCESS_RIGHTS = "NO_ACCESS_RIGHTS"
    DATA_OUT_OF_DATE = "DATA_OUT_OF_DATE"
    LOGIN_ALREADY_EXISTS = "LOGIN_ALREADY_EXISTS"
    REFRESH_TOKEN_IN_BLACK_LIST = "REFRESH_TOKEN_IN_BLACK_LIST"


class HTTPError:
    """Аll authentication and authorization errors.

    Methods:
        bad_credentials_400: Bad credentials.
        bad_credentials_401: Could not validate credentials.
        invalid_token_401: Invalid token.
        refresh_token_in_black_list_401: Refresh_token in black list.
        bad_credentials_403: Access token expires but refresh exists.
        user_not_active_403: User is not active.
        no_access_rights_403: No required access rights.
        data_out_of_date_403: User data is out of date, please re-login.
        login_already_exists_409: Login is already taken.
        endpoint_not_found_500: Endpoint not found.
    """
    @staticmethod
    def bad_credentials_400():
        return HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=ErrorDetail(
                code=IdentErrorCode.BAD_CREDENTIALS,
                reason="Bad credentials"
            ).model_dump(),
        )

    @staticmethod
    def bad_credentials_401():
        return HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=ErrorDetail(
                code=IdentErrorCode.BAD_CREDENTIALS,
                reason="Could not validate credentials"
            ).model_dump(),
        )

    @staticmethod
    def invalid_token_401():
        return HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=ErrorDetail(
                code=IdentErrorCode.INVALID_TOKEN,
                reason="Invalid token"
            ).model_dump(),
        )

    @staticmethod
    def refresh_token_in_black_list_401():
        return HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=ErrorDetail(
                code=IdentErrorCode.REFRESH_TOKEN_IN_BLACK_LIST,
                reason="Refresh_token in black list"
            ).model_dump(),
        )

    @staticmethod
    def bad_credentials_403():
        return HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=ErrorDetail(
                code=IdentErrorCode.BAD_CREDENTIALS,
                reason="Access token expires but refresh exists"
            ).model_dump(),
        )

    @staticmethod
    def user_not_active_403():
        return HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=ErrorDetail(
                code=IdentErrorCode.USER_NOT_ACTIVE,
                reason="User is not active"
            ).model_dump(),
        )

    @staticmethod
    def no_access_rights_403():
        return HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=ErrorDetail(
                code=IdentErrorCode.NO_ACCESS_RIGHTS,
                reason="No required access rights"
            ).model_dump(),
        )

    @staticmethod
    def data_out_of_date_403():
        return HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=ErrorDetail(
                code=IdentErrorCode.DATA_OUT_OF_DATE,
                reason="User data is out of date, please re-login"
            ).model_dump(),
        )

    @staticmethod
    def login_already_exists_409():
        return HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=ErrorDetail(
                code=IdentErrorCode.LOGIN_ALREADY_EXISTS,
                reason="Login is already taken"
            ).model_dump(),
        )

    @staticmethod
    def endpoint_not_found_500():
        return HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=ErrorDetail(
                code=IdentErrorCode.ENDPOINT_NOT_FOUND,
                reason="Endpoint not found"
            ).model_dump(),
        )