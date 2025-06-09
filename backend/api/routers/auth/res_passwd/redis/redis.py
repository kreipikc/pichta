from typing import Optional
import redis.asyncio as redis
from config import PASSWORD_RESET_CODE_EXPIRE_MINUTES


class RedisTools:
    """
    Class for working with Redis
    """
    def __init__(self, url: str) -> None:
        self.__redis_connect = redis.from_url(url=url)

    async def ping(self):
        await self.__redis_connect.ping()

    async def add_password_reset_code(self, email: str, code: str) -> None:
        key = f"password_reset:{email}"
        await self.__redis_connect.setex(key, PASSWORD_RESET_CODE_EXPIRE_MINUTES * 60, code)

    async def get_password_reset_code(self, email: str) -> Optional[str]:
        key = f"password_reset:{email}"
        code = await self.__redis_connect.get(key)
        return code.decode('utf-8') if code else None

    async def delete_password_reset_code(self, email: str) -> None:
        key = f"password_reset:{email}"
        await self.__redis_connect.delete(key)

    async def close(self) -> None:
        await self.__redis_connect.close()