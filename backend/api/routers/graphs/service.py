from age import Age
import json
import psycopg2

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
        rel_res = self.execute_cypher_with_return(cypher_rels, ("a agtype","r agtype","b agtype"))
        relationships = [{"from": self.parse_agtype(r[0])["id"],
                          "to": self.parse_agtype(r[2])["id"],
                          "type": "CONTAINS"} for r in rel_res]
        return nodes, relationships

    def close(self):
        if self.cursor:
            self.cursor.close()
        if self.conn:
            self.conn.close()


class GraphExporter:
    def __init__(self, nodes, relationships, user_skills):
        self.nodes = {n["id"]: n for n in nodes}
        self.relationships = relationships
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
        percent = round((user_prof / node_value * 100) if node_value else 0, 2)

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

    def export(self):
        result = {}
        for node_id, node in self.nodes.items():
            if node["label"] == "Profession":
                prof_name = node["properties"]["name"]
                result[prof_name] = self.build_hierarchy(node_id)
        return result


def get_graph_importer() -> GraphImporter:
    importer = GraphImporter()
    importer.connect_to_db()
    return importer