import os
from dotenv import load_dotenv


load_dotenv()

POSTGRES_USER = os.getenv("POSTGRES_USER", "postgres")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD")
POSTGRES_DB = os.getenv("POSTGRES_DB", "testdb")
POSTGRES_HOST = os.getenv("POSTGRES_HOST", "pg_age")
POSTGRES_PORT = int(os.getenv("POSTGRES_PORT", 5432))
POSTGRES_URL = f"postgresql+asyncpg://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"

SECRET_KEY_JWT = os.getenv("SECRET_KEY_JWT")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", 30))

FRONTEND_URL_ARRAY = os.getenv("FRONTEND_URL", "http://127.0.0.1:8085,http://localhost:8085").split(",")