from routers.auth.responses.responses import base_auth_responses
from utils import merge_responses, convert_to_example
from fastapi import status
from .http_errors import HTTPError as HTTPError_user


class UserResponse:
    """Users responses.

    Attributes:
        me_get: Responses for get me
        me_post: Responses for post me
    """
    me_get = merge_responses(
        base_auth_responses,
        {
            status.HTTP_404_NOT_FOUND: convert_to_example([
                HTTPError_user.user_not_found_404(),
            ]),
        }
    )

    me_post = merge_responses(
        base_auth_responses,
        {
            status.HTTP_404_NOT_FOUND: convert_to_example([
                HTTPError_user.user_not_found_404(),
            ]),
        }
    )
