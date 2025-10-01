from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import close_db_connection
from logger import app_logger

from routers.auth.ident.router import router as router_ident
from routers.auth.user.router import router as router_user
from routers.auth.admin.router import router as router_admin
from routers.education.router import router as router_education
from routers.experience.router import router as router_experience
from routers.for_myself.router import router as router_myself
from routers.graphs.router import router as router_graphs
from routers.profession.router import router as router_profession
from routers.skill.router import router as router_skill
from routers.task.router import router as router_task

from config import (
    FRONTEND_URL_ARRAY,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        yield
    except Exception as e:
        app_logger.error(f"Unexpected error: {str(e)}")
    finally:
        await close_db_connection()
        app_logger.info("Database connection closed")

app = FastAPI(lifespan=lifespan)

app.include_router(router_ident, prefix="/auth", tags=["Auth"])
app.include_router(router_user, prefix="/user", tags=["User"])
app.include_router(router_admin, prefix="/user", tags=["Admin"])
app.include_router(router_myself, prefix="/me", tags=["For Myself"])
app.include_router(router_graphs, prefix="/graph", tags=["Graphs"])
app.include_router(router_education, prefix="/educ", tags=["Education"])
app.include_router(router_experience, prefix="/exper", tags=["Experience"])
app.include_router(router_profession, prefix="/prof", tags=["Profession"])
app.include_router(router_skill, prefix="/skill", tags=["Skills"])
app.include_router(router_task, prefix="/task", tags=["Tasks"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_URL_ARRAY,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)