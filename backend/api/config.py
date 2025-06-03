import os
from dotenv import load_dotenv


load_dotenv()

POSTGRES_USERS_URL = os.getenv("POSTGRES_USERS_URL")

SECRET_KEY_JWT = os.getenv("SECRET_KEY_JWT")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", 30))

FRONTEND_URL_ARRAY = os.getenv("FRONTEND_URL", "http://127.0.0.1:8085,http://localhost:8085").split(",")