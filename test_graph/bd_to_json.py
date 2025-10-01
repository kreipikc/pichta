from age import Age
import json
import psycopg2
from sqlalchemy import create_engine, Table, Column, Integer, MetaData, select
from sqlalchemy.orm import sessionmaker

# -------------------- Graph --------------------
class GraphImporter:
    def __init__(self, db_url, db_port):
        self.conn = None
        self.cursor = None
        self.db_url = db_url
        self.db_port = db_port

    def connect_to_db(self):
        self.conn = psycopg2.connect(
            dbname="devdb",
            user="riot",
            password="secret",
            host=self.db_url,
            port=5422
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


# -------------------- User skills --------------------
class UserSkills:
    def __init__(self, db_url, db_user, db_password, db_name, db_port=5422):
        self.engine = create_engine(f"postgresql://{db_user}:{db_password}@{db_url}:{db_port}/{db_name}")
        self.metadata = MetaData()
        self.metadata.reflect(self.engine, only=["skills", "user_skills"])
        self.skills_table = Table("skills", self.metadata, autoload_with=self.engine)
        self.user_skills_table = Table("user_skills", self.metadata, autoload_with=self.engine)
        Session = sessionmaker(bind=self.engine)
        self.session = Session()

    def get_user_skills(self, user_id):
        query = (
            select(self.skills_table.c.name, self.user_skills_table.c.proficiency)
            .select_from(self.user_skills_table.join(self.skills_table, self.user_skills_table.c.id_skill == self.skills_table.c.id))
            .where(self.user_skills_table.c.id_user == user_id)
        )
        res = self.session.execute(query).all()
        return {name: prof for name, prof in res}


# -------------------- Exporter --------------------
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


# -------------------- Main --------------------
def main(profession_id, user_id):
    # граф
    importer = GraphImporter(db_url="localhost", db_port=5422)
    importer.connect_to_db()
    nodes, relationships = importer.get_nodes_and_relationships(profession_id)
    importer.close()

    # навыки пользователя
    user_sk = UserSkills(db_url="localhost", db_user="riot", db_password="secret", db_name="devdb", db_port=5422)
    user_skills = user_sk.get_user_skills(user_id)

    # строим JSON
    exporter = GraphExporter(nodes, relationships, user_skills)
    hierarchy = exporter.export()

    output_file = r"C:\Users\Revenant\Desktop\graphs\user_prof.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(hierarchy, f, ensure_ascii=False, indent=2)

    print(f"JSON экспортирован: {output_file}")


if __name__ == "__main__":
    profession_id = 1
    user_id = 3
    main(profession_id, user_id)
