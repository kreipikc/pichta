from datetime import date
from unittest.mock import Mock

from routers.graphs.service import GraphImporter, GraphStatusExporter, get_user_skills_from_db


def make_graph_data():
    nodes = [
        {
            "id": 1,
            "label": "Profession",
            "properties": {"name": "Backend", "value": 0},
        },
        {
            "id": 2,
            "label": "Category",
            "properties": {"name": "Python", "value": 0},
        },
        {
            "id": 3,
            "label": "Skill",
            "properties": {"name": "FastAPI", "skill_id": 101, "value": 5},
        },
        {
            "id": 4,
            "label": "Skill",
            "properties": {"name": "SQLAlchemy", "skill_id": 102, "value": 4},
        },
    ]
    relationships = [
        {"from": 1, "to": 2, "type": "CONTAINS"},
        {"from": 2, "to": 3, "type": "CONTAINS"},
        {"from": 2, "to": 4, "type": "CONTAINS"},
    ]
    return nodes, relationships


def test_parse_agtype_parses_vertex_json():
    importer = GraphImporter()

    result = importer.parse_agtype('{"id": 3, "label": "Skill"}::vertex')

    assert result == {"id": 3, "label": "Skill"}


def test_parse_agtype_returns_original_value_for_non_json_string():
    importer = GraphImporter()

    result = importer.parse_agtype("not-json::vertex")

    assert result == "not-json"


def test_export_by_status_groups_known_and_missing_skills():
    nodes, relationships = make_graph_data()
    exporter = GraphStatusExporter(
        nodes,
        relationships,
        user_skills_data={
            101: {
                "proficiency": 10,
                "status": "process",
                "priority": "high",
                "start_date": "2026-04-01",
                "end_date": None,
            }
        },
    )

    result = exporter.export_by_status()

    assert result["process"] == [
        {
            "name": "FastAPI",
            "count": 5,
            "proficiency": 10,
            "percent": 100,
            "priority": "high",
            "start_date": "2026-04-01",
            "end_date": None,
            "status": "process",
        }
    ]
    assert result["gray_zone"] == [{"name": "SQLAlchemy", "count": 4}]
    assert result["inactive"] == []
    assert result["complete"] == []


def test_export_builds_nested_hierarchy_with_user_progress():
    nodes, relationships = make_graph_data()
    exporter = GraphStatusExporter(
        nodes,
        relationships,
        user_skills_data={},
        user_skills={"Backend": 0, "Python": 0, "FastAPI": 3, "SQLAlchemy": 2},
    )

    result = exporter.export()

    assert result["Backend"]["Python"]["FastAPI"]["user_proficiency"] == 3
    assert result["Backend"]["Python"]["FastAPI"]["percent"] == 60.0
    assert result["Backend"]["Python"]["SQLAlchemy"]["user_proficiency"] == 2
    assert result["Backend"]["Python"]["SQLAlchemy"]["percent"] == 50.0


def test_get_user_skills_from_db_builds_dict_with_iso_dates():
    cursor = Mock()
    cursor.fetchall.return_value = [
        {
            "id_skill": 101,
            "skill_name": "FastAPI",
            "proficiency": 4,
            "status": "process",
            "priority": "high",
            "start_date": date(2026, 4, 6),
            "end_date": None,
        }
    ]

    result = get_user_skills_from_db(7, cursor)

    cursor.execute.assert_called_once()
    assert result == {
        101: {
            "skill_name": "FastAPI",
            "proficiency": 4,
            "status": "process",
            "priority": "high",
            "start_date": "2026-04-06",
            "end_date": None,
        }
    }
