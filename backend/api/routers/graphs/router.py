import json
from typing import Any, AnyStr

from fastapi import APIRouter, status, Depends, HTTPException

from logger import app_logger
from routers.auth.ident.dependencies import get_current_user
from routers.auth.user.schemas import UserInfo
from .schemas import SkillsProfForGanttGraph
#from .schemas import SkillsProfForGanttGraph
from .service import get_graph_importer, GraphImporter, GraphStatusExporter, get_user_skills_from_db, \
    get_skills_by_status
from ..skill.service import SkillRepository, get_skill_repository


router = APIRouter()


@router.get(
    path="/get/{prof_id}",
    summary="Get json graph by profession for user",
    description="Get json graph by profession for user",
    response_description="JSON graph",
    status_code=status.HTTP_200_OK,
)
async def get_prof_graph(
        user_id: int,
        prof_id: int,
        importer: GraphImporter = Depends(get_graph_importer),
        skill_repo: SkillRepository = Depends(get_skill_repository),
        current_user: UserInfo = Depends(get_current_user)
):
    try:
        nodes, relationships = importer.get_nodes_and_relationships(prof_id)
        importer.close()

        user_skills = await skill_repo.get_user_skills_dict_name_prof(user_id)

        exporter = GraphStatusExporter(nodes, relationships, user_skills=user_skills)
        hierarchy = exporter.export()
        return hierarchy
    except Exception as e:
        app_logger.error(f"Error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)


@router.get(
    path="/get/{prof_id}/gantt",
    summary="All skills for the profession from graph to Gantt",
    description="All skills for the profession from the Gantt graph, taking into account the user's study",
    response_description="Four array: complete, process, inactive and gray_zone",
    status_code=status.HTTP_200_OK,
    response_model=SkillsProfForGanttGraph
)
async def get_prof_graph(
        user_id: int,
        prof_id: int,
        current_user: UserInfo = Depends(get_current_user)
) -> SkillsProfForGanttGraph:
    try:
        result = get_skills_by_status(profession_id=prof_id, user_id=user_id)
        return SkillsProfForGanttGraph.model_validate(result)
    except Exception as e:
        app_logger.error(f"Error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)
