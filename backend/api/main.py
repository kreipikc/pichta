import smtplib
import redis
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from logger import app_logger

from routers.auth.res_passwd.redis.redis import RedisTools
from routers.auth.res_passwd.smtp.smtp import SmtpTools

from routers.auth.ident.router import router as router_ident
from routers.auth.user.router import router as router_user
from routers.auth.res_passwd.router import router as router_res_passwd
from routers.task.router import router as router_task

from config import (
    FRONTEND_URL_ARRAY,
    SMTP_HOST, SMTP_PORT, SMTP_EMAIL, SMTP_PASSWORD,
    REDIS_URL
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        app.redis = RedisTools(url=REDIS_URL)
        await app.redis.ping()
        app_logger.info("Redis connection established successfully")

        if SMTP_HOST == "smtp.example.com" or SMTP_EMAIL == "your_email@example.com":
            app_logger.info("SMTP arguments are set by default - skip initialization")
        else:
            app.smtp = SmtpTools(SMTP_HOST, SMTP_PORT, SMTP_EMAIL, SMTP_PASSWORD)
            await app.smtp.ping()
            app_logger.info("SMTP connection established successfully")

        yield
    except (redis.ConnectionError, redis.TimeoutError) as e:
        app_logger.error(f"Redis connection failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Redis connection failed: {str(e)}"
        )
    except smtplib.SMTPException as e:
        app_logger.error(f"SMTP connection failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"SMTP connection failed: {str(e)}"
        )
    except Exception as e:
        app_logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Unexpected error: {str(e)}"
        )
    finally:
        await app.redis.close()
        app_logger.info("Redis connection closed")

        app.smtp.__del__()
        app_logger.info("SMTP connection closed")

app = FastAPI(lifespan=lifespan)

app.include_router(router_ident, prefix="/auth", tags=["Auth"])
app.include_router(router_user, prefix="/user", tags=["User 👔"])
app.include_router(router_task, prefix="/task", tags=["Tasks"])
app.include_router(router_res_passwd, prefix="/auth", tags=["Auth"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_URL_ARRAY,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)