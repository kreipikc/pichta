from functools import wraps
from typing import List, Callable, Coroutine, Any, TypeVar
from fastapi import HTTPException, status
from error import ErrorModel
from logger import app_logger
from routers.auth.responses.http_errors import (
    HTTPError as HTTPError_auth,
    AuthErrorCode
)
from routers.user.responses.http_errors import (
    HTTPError as HTTPError_user,
    UserErrorCode
)


T = TypeVar('T')


def handle_catch_error(func: Callable[..., Coroutine[Any, Any, T]]) -> Callable[..., Coroutine[Any, Any, T]]:
    """ A decorator for catching errors """
    @wraps(func)
    async def wrapper(*args: Any, **kwargs: Any) -> T:
        try:
            return await func(*args, **kwargs)
        except HTTPException as e:
            match (e.status_code, e.detail.get("code")):
                # -------------------- Auth errors --------------------
                case (status.HTTP_400_BAD_REQUEST, AuthErrorCode.BAD_CREDENTIALS):
                    raise HTTPError_auth.bad_credentials_400()

                case (status.HTTP_401_UNAUTHORIZED, AuthErrorCode.BAD_CREDENTIALS):
                    raise HTTPError_auth.bad_credentials_401()

                case (status.HTTP_401_UNAUTHORIZED, AuthErrorCode.INVALID_TOKEN):
                    raise HTTPError_auth.invalid_token_401()

                case (status.HTTP_401_UNAUTHORIZED, AuthErrorCode.REFRESH_TOKEN_IN_BLACK_LIST):
                    raise HTTPError_auth.refresh_token_in_black_list_401()

                case (status.HTTP_403_FORBIDDEN, AuthErrorCode.BAD_CREDENTIALS):
                    raise HTTPError_auth.bad_credentials_403()

                case (status.HTTP_403_FORBIDDEN, AuthErrorCode.NO_ACCESS_RIGHTS):
                    raise HTTPError_auth.no_access_rights_403()

                case (status.HTTP_403_FORBIDDEN, AuthErrorCode.USER_NOT_ACTIVE):
                    raise HTTPError_auth.user_not_active_403()

                case (status.HTTP_403_FORBIDDEN, AuthErrorCode.DATA_OUT_OF_DATE):
                    raise HTTPError_auth.data_out_of_date_403()

                case (status.HTTP_409_CONFLICT, AuthErrorCode.EMAIL_OR_PHONE_ALREADY_EXISTS):
                    raise HTTPError_auth.email_or_phone_already_exists_409()

                # -------------------- Not Found errors --------------------
                case (status.HTTP_404_NOT_FOUND, UserErrorCode.USER_NOT_FOUND):
                    raise HTTPError_user.user_not_found_404()

            raise

        # -------------------- Other error --------------------
        except Exception as e:
            app_logger.error(f"Unexpected error in {func.__name__}: {str(e)}", exc_info=True)
            raise HTTPError_auth.endpoint_not_found_500()

    return wrapper


def convert_to_example(http_exceptions: List[HTTPException]) -> dict:
    """Converts from list of HTTPException to dict response for swagger documentation.

    Args:
        http_exceptions: HTTP exceptions

    Returns:
        A dict of HTTP responses for swagger documentation.
    """
    examples = {}
    for http_exception in http_exceptions:
        examples[http_exception.detail.get("code")] = {
            "summary": http_exception.detail.get("code"),
            "value": {
                "detail": http_exception.detail
            }
        }

    return {
        "model": ErrorModel,
        "content": {
            "application/json": {
                "examples": examples
            }
        }
    }


def merge_responses(base: dict, additional: dict) -> dict:
    """Combines two dictionaries with answers, creating one new one, without duplicates

    Args:
        base: Basic dict of responses.
        additional: Additional dict answers for merging.

    Returns:
        A new dict that includes all statuses from base and additional, with combined examples
        for matching status codes.
    """
    result = base.copy()
    for status_code, new_response in additional.items():
        if status_code in result:
            # Объединяем examples для существующего кода состояния
            result[status_code]["content"]["application/json"]["examples"].update(
                new_response["content"]["application/json"]["examples"]
            )
        else:
            # Добавляем новый код состояния
            result[status_code] = new_response
    return result