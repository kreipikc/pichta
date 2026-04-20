import pytest

from routers.auth.ident.utils import get_password_hash, verify_password


def test_password_hashing():
    password = "test-pass1"
    
    hashed = get_password_hash(password)
    
    assert verify_password(password, hashed) is True
    assert verify_password("wrong-password", hashed) is False
