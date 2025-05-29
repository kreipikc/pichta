from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from logger import app_logger
from routers.auth.router import router as router_auth
from routers.user.router import router as router_user
from routers.task.router import router as router_task
from config import (
    FRONTEND_URL_ARRAY
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        yield
    finally:
        pass

app = FastAPI(lifespan=lifespan)

app.include_router(router_auth)
app.include_router(router_user)
app.include_router(router_task)

app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_URL_ARRAY,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)