from age import Age
import json
import psycopg2
import argparse
import os
from psycopg2.extras import RealDictCursor

# Заменить на свои данные от PostgreSQL
POSTGRES_USER = "postgres"
POSTGRES_PASSWORD = "postgrespass"
POSTGRES_DB = "testdb"
POSTGRES_HOST = "localhost"
POSTGRES_PORT = 5432


class GraphImporter:
    def __init__(self):
        self.conn = None
        self.cursor = None
        self.created_nodes = {}  # Словарь для хранения созданных узлов
        
    def connect_to_db(self):
        try:
            self.conn = psycopg2.connect(
                dbname=POSTGRES_DB,
                user=POSTGRES_USER,
                password=POSTGRES_PASSWORD,
                host=POSTGRES_HOST,
                port=int(POSTGRES_PORT)
            )
            self.cursor = self.conn.cursor(cursor_factory=RealDictCursor)
            
            self.cursor.execute("LOAD 'age';")
            self.cursor.execute("SET search_path = ag_catalog, '$user', public;")
            self.conn.commit()
            print("Успешное подключение к базе данных")
        except Exception as e:
            print(f"Ошибка подключения к базе данных: {e}")
            raise
    
    def ensure_graph_exists(self):
        try:
            self.cursor.execute("SELECT name FROM ag_graph WHERE name = 'professions_graph'")
            if not self.cursor.fetchone():
                self.cursor.execute("SELECT create_graph('professions_graph');")
                self.conn.commit()
                print("Граф professions_graph создан")
            else:
                print("Граф professions_graph уже существует")
        except Exception as e:
            print(f"Ошибка при проверке/создании графа: {e}")
            self.conn.rollback()
    
    def execute_cypher_no_return(self, cypher_query):
        """Выполняет Cypher запрос без возврата результата"""
        try:
            sql_query = f"SELECT * FROM cypher('professions_graph', $${cypher_query}$$) as (v agtype);"
            self.cursor.execute(sql_query)
            self.conn.commit()
            return True
        except Exception as e:
            print(f"Ошибка при выполнении Cypher запроса: {e}")
            print(f"Запрос: {cypher_query}")
            self.conn.rollback()
            return False
    
    def execute_cypher_with_return(self, cypher_query):
        """Выполняет Cypher запрос с возвратом результата"""
        try:
            sql_query = f"SELECT * FROM cypher('professions_graph', $${cypher_query}$$) as (v agtype);"
            self.cursor.execute(sql_query)
            result = self.cursor.fetchall()
            self.conn.commit()
            return result
        except Exception as e:
            print(f"Ошибка при выполнении Cypher запроса: {e}")
            print(f"Запрос: {cypher_query}")
            self.conn.rollback()
            return None
    
    def clear_existing_data(self):
        """Очищает все данные в графе"""
        try:
            self.execute_cypher_no_return("MATCH (n) DETACH DELETE n")
            print("Существующие данные очищены")
        except Exception as e:
            print(f"Ошибка при очистке данных: {e}")
    
    def get_or_create_profession(self, profession_name):
        """Создает или получает профессию из реляционной таблицы"""
        try:
            self.cursor.execute("SELECT id FROM professions WHERE name = %s", (profession_name,))
            result = self.cursor.fetchone()
            if result:
                return result['id']
            
            self.cursor.execute(
                "INSERT INTO professions (name) VALUES (%s) RETURNING id",
                (profession_name,)
            )
            profession_id = self.cursor.fetchone()['id']
            self.conn.commit()
            print(f"Создана новая профессия: {profession_name} (ID: {profession_id})")
            return profession_id
        except Exception as e:
            self.conn.rollback()
            print(f"Ошибка при работе с профессией {profession_name}: {e}")
            raise
    
    def get_or_create_skill(self, skill_name):
        """Создает или получает навык из реляционной таблицы"""
        try:
            self.cursor.execute("SELECT id FROM skills WHERE name = %s", (skill_name,))
            result = self.cursor.fetchone()
            if result:
                return result['id']
            
            self.cursor.execute("INSERT INTO skills (name) VALUES (%s) RETURNING id", (skill_name,))
            skill_id = self.cursor.fetchone()['id']
            self.conn.commit()
            return skill_id
        except Exception as e:
            self.conn.rollback()
            print(f"Ошибка при работе с навыком {skill_name}: {e}")
            raise
    
    def create_profession_node(self, profession_name, profession_id):
        """Создает узел профессии в графе (MERGE — чтобы не дублировать)"""
        cypher = f"""
        MERGE (p:Profession {{profession_id: {profession_id}}})
        SET p.name = '{profession_name.replace("'", "''")}'
        """
        success = self.execute_cypher_no_return(cypher)
        if success:
            print(f"Создан/обновлён узел Profession: {profession_name}")
            self.created_nodes[f"Profession_{profession_id}"] = {
                'type': 'Profession',
                'name': profession_name,
                'profession_id': profession_id
            }
        return success
    
    def create_skill_node(self, skill_name, skill_id, count_value, profession_id):
        """Создает узел навыка в графе (MERGE по skill_id)"""
        cypher = f"""
        MERGE (s:Skill {{skill_id: {skill_id}}})
        SET s.name = '{skill_name.replace("'", "''")}', s.value = {count_value}, s.profession_id = {profession_id}
        """
        success = self.execute_cypher_no_return(cypher)
        if success:
            print(f"  Создан/обновлён узел Skill: {skill_name} (value: {count_value})")
            self.created_nodes[f"Skill_{skill_id}_{profession_id}"] = {
                'type': 'Skill',
                'name': skill_name,
                'profession_id': profession_id,
                'skill_id': skill_id
            }
        return success
    
    def create_category_node(self, category_name, profession_id):
        """Создает узел категории в графе (MERGE по name+profession)"""
        cypher = f"""
        MERGE (c:Category {{ name: '{category_name.replace("'", "''")}', profession_id: {profession_id} }})
        """
        success = self.execute_cypher_no_return(cypher)
        if success:
            print(f"  Создан/обновлён узел Category: {category_name}")
            self.created_nodes[f"Category_{category_name}_{profession_id}"] = {
                'type': 'Category', 
                'name': category_name,
                'profession_id': profession_id
            }
        return success
    
    def create_relationship_simple(self, from_name, from_type, to_name, to_type, profession_id):
        """Создает связь между двумя узлами (MERGE для связи)"""
        cypher = f"""
        MATCH (a:{from_type} {{name: '{from_name.replace("'", "''")}', profession_id: {profession_id}}})
        MATCH (b:{to_type} {{name: '{to_name.replace("'", "''")}', profession_id: {profession_id}}})
        MERGE (a)-[:CONTAINS]->(b)
        """
        success = self.execute_cypher_no_return(cypher)
        if success:
            print(f"    Создана связь: {from_type}[{from_name}] -> {to_type}[{to_name}]")
        else:
            print(f"    ОШИБКА: Не удалось создать связь {from_type}[{from_name}] -> {to_type}[{to_name}]")
        return success
    
    def process_nested_data(self, data, profession_id, parent_name=None, parent_type=None, level=0):
        indent = "  " * level
        for key, value in data.items():
            if isinstance(value, dict):
                if "count" in value:  # значит это Skill
                    count = value["count"]
                    skill_id = self.get_or_create_skill(key)
                    self.create_skill_node(key, skill_id, count, profession_id)

                    if parent_name and parent_type:
                        self.create_relationship_simple(parent_name, parent_type, key, "Skill", profession_id)

                    # рекурсивно идём по вложенным ключам (могут быть и Skill, и Category)
                    nested_dict = {k: v for k, v in value.items() if k != "count"}
                    if nested_dict:
                        self.process_nested_data(nested_dict, profession_id, key, "Skill", level + 1)

                else:  # dict без count -> Category
                    self.create_category_node(key, profession_id)

                    if parent_name and parent_type:
                        self.create_relationship_simple(parent_name, parent_type, key, "Category", profession_id)

                    self.process_nested_data(value, profession_id, key, "Category", level + 1)

    
    def process_json_file(self, file_path):
        """Основной метод обработки JSON файла"""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                data = json.load(file)
                
            self.ensure_graph_exists()
            self.created_nodes = {}

            for profession_name, profession_data in data.items():
                print(f"\n=== Обработка профессии: {profession_name} ===")
                
                # Создаем профессию в реляционной таблице
                profession_id = self.get_or_create_profession(profession_name)
                
                # Создаем узел профессии в графе (MERGE)
                self.create_profession_node(profession_name, profession_id)
                
                # Обрабатываем верхний уровень: если top_value имеет count -> это Skill,
                # иначе — Category (например programming_languages)
                if isinstance(profession_data, dict):
                    for top_key, top_val in profession_data.items():
                        if isinstance(top_val, dict) and 'count' in top_val:
                            # верхний уровень — Skill
                            count = top_val['count']
                            skill_id = self.get_or_create_skill(top_key)
                            self.create_skill_node(top_key, skill_id, count, profession_id)
                            self.create_relationship_simple(profession_name, "Profession", top_key, "Skill", profession_id)
                            # рекурсивно обрабатываем содержимое skill
                            self.process_nested_data(top_val, profession_id, top_key, "Skill", 1)
                        elif isinstance(top_val, dict):
                            # верхний уровень — Category (например programming_languages)
                            self.create_category_node(top_key, profession_id)
                            self.create_relationship_simple(profession_name, "Profession", top_key, "Category", profession_id)
                            # рекурсивно обрабатываем содержимое категории
                            self.process_nested_data(top_val, profession_id, top_key, "Category", 1)
                        else:
                            # пропускаем скалярные значения
                            pass
                else:
                    # если структура другая — обработаем как единый блок
                    self.process_nested_data({profession_name: profession_data}, profession_id, profession_name, "Profession", 1)
                
            print("\n=== Импорт данных завершен! ===")
            
            # Проверяем созданные данные
            self.check_created_data()
            
        except Exception as e:
            print(f"Ошибка при обработке файла: {e}")
            raise
    
    def check_created_data(self):
        """Проверяет созданные узлы и связи"""
        print("\n=== ПРОВЕРКА СОЗДАННЫХ ДАННЫХ ===")
        
        # Простая проверка узлов
        nodes_result = self.execute_cypher_with_return("MATCH (n) RETURN n")
        if nodes_result:
            print(f"Узлов создано: {len(nodes_result)}")
        else:
            print("Узлы не найдены или ошибка запроса")
        
        # Простая проверка связей
        edges_result = self.execute_cypher_with_return("MATCH ()-[r]->() RETURN r")
        if edges_result:
            print(f"Связей создано: {len(edges_result)}")
        else:
            print("Связи не найдены")
    
    def close_connections(self):
        """Закрывает соединения с БД"""
        if self.cursor:
            self.cursor.close()
        if self.conn:
            self.conn.close()


def parsing(path: str):
    importer = GraphImporter()
    try:
        importer.connect_to_db()
        importer.process_json_file(path)
    except Exception as e:
        print(f"Произошла ошибка: {e}")
        import traceback
        traceback.print_exc()
    finally:
        importer.close_connections()


def main():
    parser = argparse.ArgumentParser(description='Deploy Graph in DB')
    parser.add_argument("--file", help="Если нужно распарсить конкретный json-файл.")
    parser.add_argument("--dir", type=str, help="Если нужно распарсить все json-файлы в директории.")

    args = parser.parse_args()

    if args.file:
        if os.path.exists(args.file):
            parsing(args.file)
        else:
            print(f"❌ Файл не найден: {args.file}")
    
    elif args.dir:
        if os.path.exists(args.dir) and os.path.isdir(args.dir):
            try:
                files = os.listdir(args.dir)
                json_files = [f for f in files if f.endswith('.json')]
                
                if not json_files:
                    print(f"❌ В директории {args.dir} не найдено JSON файлов")
                    return
                
                print(f"📁 Найдено {len(json_files)} JSON файлов для обработки")
                
                for file in json_files:
                    file_path = os.path.join(args.dir, file)
                    parsing(file_path)
                    
            except Exception as e:
                print(f"❌ Ошибка при чтении директории: {e}")
        else:
            print(f"❌ Директория не найдена или не является директорией: {args.dir}")
    
    else:
        print("ℹ️  Использование:")
        print("  --file <path>  - обработать конкретный json файл")
        print("  --dir <path>   - обработать все JSON файлы в директории")
        print("❌ Не указаны аргументы. Используйте --help для справки.")


if __name__ == "__main__":
    main()
