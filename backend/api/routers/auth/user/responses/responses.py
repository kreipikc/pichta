from routers.auth.ident.responses.responses import base_auth_responses
from utils import merge_responses, convert_to_example
from fastapi import status
from .http_errors import HTTPError as HTTPError_user


class UserResponse:
    """Users responses.

    Attributes:
        me_get: Responses for get me
        change_pass: Responses for change_pass
    """
    me_get = merge_responses(
        base_auth_responses,
        {
            status.HTTP_404_NOT_FOUND: convert_to_example([
                HTTPError_user.user_not_found_404(),
            ]),
        }
    )

    change_pass = merge_responses(
        base_auth_responses,
        {
            status.HTTP_404_NOT_FOUND: convert_to_example([
                HTTPError_user.user_not_found_404(),
            ]),
        }
    )
