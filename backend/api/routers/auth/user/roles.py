from enum import Enum


class UserRole(str, Enum):
    """ Enum class for users roles """
    user = "user"
    manager = "manager"
    admin = "admin"