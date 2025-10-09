from fastapi import status
from utils import convert_to_example, merge_responses

from .http_errors import HTTPError as HTTPError_auth
from ...user.responses.http_errors import HTTPError as HTTPError_user


""" Base authorization responses """
base_auth_responses = {
    status.HTTP_401_UNAUTHORIZED: convert_to_example([
        HTTPError_auth.bad_credentials_401(),
        HTTPError_auth.invalid_token_401(),
    ]),
    status.HTTP_403_FORBIDDEN: convert_to_example([
        HTTPError_auth.bad_credentials_403(),
        HTTPError_auth.user_not_active_403(),
        HTTPError_auth.data_out_of_date_403(),
    ]),
    status.HTTP_500_INTERNAL_SERVER_ERROR: convert_to_example([
        HTTPError_auth.endpoint_not_found_500(),
    ]),
}


class IdentResponse:
    """Ident responses.

    Attributes:
        register_post: Responses for register
        login_post: Responses for login
        refresh_post: Responses for refresh token
    """
    register_post = {
        status.HTTP_409_CONFLICT: convert_to_example([
            HTTPError_auth.login_already_exists_409(),
        ]),
    }

    login_post = {
        status.HTTP_400_BAD_REQUEST: convert_to_example([
            HTTPError_auth.bad_credentials_400(),
        ]),
    }

    refresh_post = {
        status.HTTP_401_UNAUTHORIZED: convert_to_example([
            HTTPError_auth.bad_credentials_401(),
            HTTPError_auth.invalid_token_401(),
            HTTPError_auth.refresh_token_in_black_list_401(),
        ]),
        status.HTTP_403_FORBIDDEN: convert_to_example([
            HTTPError_auth.bad_credentials_403(),
            HTTPError_auth.data_out_of_date_403(),
            HTTPError_auth.user_not_active_403(),
        ])
    }

    change_pass = merge_responses(
        base_auth_responses,
        {
            status.HTTP_400_BAD_REQUEST: convert_to_example([
                HTTPError_auth.bad_credentials_400()
            ]),
            status.HTTP_404_NOT_FOUND: convert_to_example([
                HTTPError_user.user_not_found_404(),
            ]),
        }
    )