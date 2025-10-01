from age import Age
import json
import psycopg2
from psycopg2.extras import RealDictCursor

class GraphImporter:
    def __init__(self):
        self.conn = None
        self.cursor = None

    def connect_to_db(self):
        try:
            self.conn = psycopg2.connect(
                dbname="devdb",
                user="riot",
                password="secret",
                host="localhost",
                port=5422
            )
            self.cursor = self.conn.cursor()
            self.cursor.execute("LOAD 'age';")
            self.cursor.execute("SET search_path = ag_catalog, '$user', public;")
            self.conn.commit()
            print("Успешное подключение к базе данных")
        except Exception as e:
            print(f"Ошибка подключения к базе данных: {e}")
            raise

    def execute_cypher_with_return(self, cypher_query, columns=("v agtype",)):
        try:
            col_defs = ", ".join(columns)
            sql_query = f"SELECT * FROM cypher('professions_graph', $${cypher_query}$$) as ({col_defs});"
            self.cursor.execute(sql_query)
            result = self.cursor.fetchall()
            self.conn.commit()
            return result
        except Exception as e:
            print(f"Ошибка при выполнении Cypher запроса: {e}")
            print(f"Запрос: {cypher_query}")
            self.conn.rollback()
            return None

    def parse_agtype(self, value):
        if isinstance(value, str):
            if value.endswith("::vertex") or value.endswith("::edge"):
                value = value.rsplit("::", 1)[0]
            try:
                return json.loads(value)
            except:
                return value
        return value

    def get_all_nodes_for_profession(self, profession_id):
        cypher = f"""
            MATCH (n) 
            WHERE n.profession_id = {profession_id}
            RETURN n
        """
        result = self.execute_cypher_with_return(cypher, ("n agtype",))
        nodes = []
        if result:
            for row in result:
                node = self.parse_agtype(row[0])
                nodes.append(node)
        return nodes

    def get_all_relationships_for_profession(self, profession_id):
        cypher = f"""
            MATCH (a)-[r:CONTAINS]->(b)
            WHERE a.profession_id = {profession_id} AND b.profession_id = {profession_id}
            RETURN a, r, b
        """
        result = self.execute_cypher_with_return(cypher, ("a agtype", "r agtype", "b agtype"))
        relationships = []
        if result:
            for row in result:
                a = self.parse_agtype(row[0])
                r = self.parse_agtype(row[1])
                b = self.parse_agtype(row[2])
                relationships.append({"from": a["id"], "to": b["id"], "type": "CONTAINS"})
        return relationships

    def close_connections(self):
        if self.cursor:
            self.cursor.close()
        if self.conn:
            self.conn.close()


class GraphExporter:
    def __init__(self, nodes, relationships):
        self.nodes = {n["id"]: n for n in nodes}
        self.relationships = relationships
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

        if label == "Skill":
            entry = {"count": props["value"]}
        else:
            entry = {}

        for child_id in self.children_map.get(node_id, []):
            child = self.nodes[child_id]
            child_name = child["properties"]["name"]
            entry[child_name] = self.build_hierarchy(child_id)

        return entry

    def export(self):
        result = {}
        for node_id, node in self.nodes.items():
            if node["label"] == "Profession":
                name = node["properties"]["name"]
                result[name] = self.build_hierarchy(node_id)
        return result


def main():
    importer = GraphImporter()
    try:
        importer.connect_to_db()
        profession_id = 1   # нужный ID профессии

        # получаем ноды и связи
        nodes = importer.get_all_nodes_for_profession(profession_id)
        relationships = importer.get_all_relationships_for_profession(profession_id)

        # строим иерархию и сразу сохраняем
        exporter = GraphExporter(nodes, relationships)
        hierarchy = exporter.export()

        output_file = r"C:\Users\Revenant\Desktop\graphs\outputqq.json"
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(hierarchy, f, ensure_ascii=False, indent=2)

        print(f"JSON экспортирован: {output_file}")

    except Exception as e:
        print(f"Произошла ошибка: {e}")
        import traceback
        traceback.print_exc()
    finally:
        importer.close_connections()


if __name__ == "__main__":
    main()
