import os
from dotenv import load_dotenv


load_dotenv()

POSTGRES_USERS_URL = os.getenv("POSTGRES_USERS_URL")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

SECRET_KEY_JWT = os.getenv("SECRET_KEY_JWT")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", 30))

PASSWORD_RESET_CODE_EXPIRE_MINUTES = int(os.getenv("PASSWORD_RESET_CODE_EXPIRE_MINUTES", 5))

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.example.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 465))
SMTP_EMAIL = os.getenv("SMTP_EMAIL", "your_email@example.com")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "your_app_specific_password")

FRONTEND_URL_ARRAY = os.getenv("FRONTEND_URL", "http://127.0.0.1:8085,http://localhost:8085").split(",")