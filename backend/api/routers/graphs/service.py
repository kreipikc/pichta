from typing import Optional
from age import Age
import json
import psycopg2
import psycopg2.extras

from config import POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_HOST, POSTGRES_PORT


class GraphImporter:
    def __init__(self):
        self.conn = None
        self.cursor = None

    def connect_to_db(self):
        self.conn = psycopg2.connect(
            dbname=POSTGRES_DB,
            user=POSTGRES_USER,
            password=POSTGRES_PASSWORD,
            host=POSTGRES_HOST,
            port=POSTGRES_PORT
        )
        self.cursor = self.conn.cursor()
        self.cursor.execute("LOAD 'age';")
        self.cursor.execute("SET search_path = ag_catalog, '$user', public;")
        self.conn.commit()

    def execute_cypher_with_return(self, cypher_query, columns=("v agtype",)):
        col_defs = ", ".join(columns)
        sql_query = f"SELECT * FROM cypher('professions_graph', $${cypher_query}$$) as ({col_defs});"
        self.cursor.execute(sql_query)
        result = self.cursor.fetchall()
        self.conn.commit()
        return result

    def parse_agtype(self, value):
        if isinstance(value, str):
            if value.endswith("::vertex") or value.endswith("::edge"):
                value = value.rsplit("::", 1)[0]
            try:
                return json.loads(value)
            except:
                return value
        return value

    def get_nodes_and_relationships(self, profession_id):
        # ноды
        cypher_nodes = f"MATCH (n) WHERE n.profession_id = {profession_id} RETURN n"
        nodes_res = self.execute_cypher_with_return(cypher_nodes, ("n agtype",))
        nodes = [self.parse_agtype(r[0]) for r in nodes_res]

        # связи
        cypher_rels = f"""
            MATCH (a)-[r:CONTAINS]->(b)
            WHERE a.profession_id = {profession_id} AND b.profession_id = {profession_id}
            RETURN a,r,b
        """
        rel_res = self.execute_cypher_with_return(cypher_rels, ("a agtype", "r agtype", "b agtype"))
        relationships = [{"from": self.parse_agtype(r[0])["id"],
                          "to": self.parse_agtype(r[2])["id"],
                          "type": "CONTAINS"} for r in rel_res]
        return nodes, relationships

    def close(self):
        if self.cursor:
            self.cursor.close()
        if self.conn:
            self.conn.close()


def get_graph_importer() -> GraphImporter:
    importer = GraphImporter()
    importer.connect_to_db()
    return importer


class GraphStatusExporter:
    def __init__(self, nodes, relationships, user_skills_data = None, user_skills = None):
        self.nodes = {n["id"]: n for n in nodes}
        self.relationships = relationships
        self.user_skills_data = user_skills_data  # Теперь это dict: {skill_id: данные}
        self.user_skills = user_skills
        self.children_map = {}
        self.build_children_map()

    def build_children_map(self):
        for rel in self.relationships:
            f, t = rel["from"], rel["to"]
            self.children_map.setdefault(f, []).append(t)

    def build_hierarchy(self, node_id):
        node = self.nodes[node_id]
        label = node["label"]
        props = node["properties"]
        name = props.get("name")

        node_value = props.get("value", 0)
        user_prof = self.user_skills.get(name, 0)
        percent = min(round((user_prof / node_value * 100) if node_value else 0, 2), 100)

        entry = {
            "count": node_value,
            "user_proficiency": user_prof,
            "percent": percent
        }

        for child_id in self.children_map.get(node_id, []):
            child = self.nodes[child_id]
            child_name = child["properties"]["name"]
            entry[child_name] = self.build_hierarchy(child_id)

        return entry

    def collect_skill_nodes(self, node_id):
        """Рекурсивно собирает только Skill узлы, игнорируя Category"""
        skills = []
        node = self.nodes[node_id]

        # Добавляем только Skill узлы (не Profession и не Category)
        if node["label"] == "Skill":
            skills.append({
                "id": node_id,
                "name": node["properties"]["name"],
                "skill_id": node["properties"].get("skill_id"),  # ID из таблицы skills
                "count": node["properties"].get("value", 0)
            })

        # Рекурсивно обходим детей
        for child_id in self.children_map.get(node_id, []):
            child_skills = self.collect_skill_nodes(child_id)
            skills.extend(child_skills)

        return skills

    def export(self):
        result = {}
        for node_id, node in self.nodes.items():
            if node["label"] == "Profession":
                prof_name = node["properties"]["name"]
                result[prof_name] = self.build_hierarchy(node_id)
        return result

    def export_by_status(self):
        # Собираем все Skill узлы из графа
        all_skills = []
        for node_id, node in self.nodes.items():
            if node["label"] == "Profession":
                profession_skills = self.collect_skill_nodes(node_id)
                all_skills.extend(profession_skills)

        # Группируем по статусам
        result = {
            "process": [],
            "inactive": [],
            "complete": [],
            "gray_zone": []
        }

        for skill in all_skills:
            skill_id = skill["skill_id"]
            skill_name = skill["name"]

            # Ищем навык пользователя по skill_id
            user_skill_data = self.user_skills_data.get(skill_id)

            if user_skill_data:
                # Навык есть у пользователя
                status = user_skill_data["status"]
                user_prof = user_skill_data["proficiency"]
                required_level = skill["count"]

                skill_entry = {
                    "name": skill_name,
                    "count": required_level,
                    "proficiency": user_prof,
                    "percent": min(round((user_prof / required_level * 100) if required_level else 0, 2), 100),
                    "priority": user_skill_data.get("priority"),
                    "start_date": user_skill_data.get("start_date"),
                    "end_date": user_skill_data.get("end_date"),
                    "status": status
                }

                # Добавляем в соответствующую группу
                if status in result:
                    result[status].append(skill_entry)

            else:
                # Серая зона - навыка нет у пользователя
                gray_skill = {
                    "name": skill_name,
                    "count": skill["count"]
                }
                result["gray_zone"].append(gray_skill)

        return result


def get_user_skills_from_db(user_id, db_cursor):
    """Получаем навыки пользователя из обычной БД с JOIN таблицы skills"""
    query = """
    SELECT 
        us.id_skill,
        s.name as skill_name,
        us.proficiency, 
        us.status, 
        us.priority, 
        us.start_date, 
        us.end_date 
    FROM user_skills us
    JOIN skills s ON us.id_skill = s.id
    WHERE us.id_user = %s
    """
    db_cursor.execute(query, (user_id,))

    user_skills = {}
    for row in db_cursor.fetchall():
        user_skills[row['id_skill']] = {
            'skill_name': row['skill_name'],
            'proficiency': row['proficiency'],
            'status': row['status'],  # 'process', 'waiting', 'ended'
            'priority': row['priority'],
            'start_date': row['start_date'].isoformat() if row['start_date'] else None,
            'end_date': row['end_date'].isoformat() if row['end_date'] else None
        }

    return user_skills


def get_skills_by_status(profession_id: int, user_id: int) ->  Optional[dict[str, list]]:
    """Основная функция для получения навыков по статусам"""
    ordinary_conn = psycopg2.connect(
        dbname=POSTGRES_DB,
        user=POSTGRES_USER,
        password=POSTGRES_PASSWORD,
        host=POSTGRES_HOST,
        port=POSTGRES_PORT
    )
    ordinary_cursor = ordinary_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    try:
        # Получаем данные из графа
        importer = get_graph_importer()
        nodes, relationships = importer.get_nodes_and_relationships(profession_id)
        importer.close()

        # Получаем данные пользователя из обычной БД
        user_skills_data = get_user_skills_from_db(user_id, ordinary_cursor)

        # Экспортируем по статусам
        exporter = GraphStatusExporter(nodes, relationships, user_skills_data)
        result = exporter.export_by_status()

        return result
    finally:
        ordinary_cursor.close()
        ordinary_conn.close()
