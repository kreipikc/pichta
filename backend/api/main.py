from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from logger import app_logger
from routers.auth.ident.router import router as router_ident
from routers.auth.user.router import router as router_user
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

app.include_router(router_ident, prefix="/auth", tags=["Auth 👔"])
app.include_router(router_user, prefix="/user", tags=["User 👔"])
app.include_router(router_task, prefix="/task", tags=["Tasks"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_URL_ARRAY,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)