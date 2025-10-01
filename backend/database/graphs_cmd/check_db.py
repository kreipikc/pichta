from age import Age
import networkx as nx
import matplotlib.pyplot as plt
import re


POSTGRES_USER = "postgres"
POSTGRES_PASSWORD = "postgrespass"
POSTGRES_DB = "testdb"
POSTGRES_GRAPH = "professions_graph"
POSTGRES_HOST = "localhost"
POSTGRES_PORT = 5432


class GraphVisualizer:
    def __init__(self):
        self.DB = None
        self.G = nx.DiGraph()
        
    def connect_to_db(self):
        """Подключение к базе данных AGE"""
        try:
            self.DB = (Age()
                      .connect(graph=POSTGRES_GRAPH,
                               dbname=POSTGRES_DB,
                               user=POSTGRES_USER, password=POSTGRES_PASSWORD,
                               host=POSTGRES_HOST, port=POSTGRES_PORT))
            print("Успешное подключение к базе данных")
        except Exception as e:
            print(f"Ошибка подключения к базе данных: {e}")
            raise
    
    def parse_ag_props(self, v):
        """Возвращает словарь свойств, приводя числа к int/float когда возможно."""
        prop = getattr(v, "properties", None) or {}
        parsed = {}
        for k, val in prop.items():
            if isinstance(val, (int, float)):
                parsed[k] = val
                continue
            if val is None:
                parsed[k] = None
                continue
            s = str(val)
            try:
                parsed[k] = int(s)
                continue
            except ValueError:
                pass
            try:
                parsed[k] = float(s)
                continue
            except ValueError:
                pass
            if (s.startswith('"') and s.endswith('"')) or (s.startswith("'") and s.endswith("'")):
                s = s[1:-1]
            parsed[k] = s
        return parsed
    
    def unwrap_node(self, v, age_id=None):
        """Преобразует вершину AGE в данные для графа"""
        vid = age_id if age_id is not None else getattr(v, "id", None)
        label = getattr(v, "label", "")
        props = self.parse_ag_props(v)

        # Определяем тип узла и его атрибуты
        if label == "Profession":
            name = props.get('name', f"Prof_{vid}")
            db_id = props.get('profession_id')
            display_name = f"Profession\n{name}\nID: {db_id}"
            weight = 3000
            color = "lightgreen"
        elif label == "Category":
            name = props.get('name', f"Cat_{vid}")
            display_name = f"Category\n{name}"
            weight = 2000
            color = "lightyellow"
        elif label == "Skill":
            name = props.get('name', f"Skill_{vid}")
            skill_id = props.get('skill_id')
            value = props.get('value', 0)
            display_name = f"Skill\n{name}\nValue: {value}"
            if skill_id:
                display_name += f"\nID: {skill_id}"
            weight = 1000 + min(int(value) * 10, 2000)  # Вес зависит от значения
            color = "lightblue"
        else:
            name = props.get('name', f"Node_{vid}")
            display_name = f"Unknown\n{name}"
            weight = 500
            color = "white"

        return {
            "age_id": vid,
            "name": name,
            "display_name": display_name,
            "weight": weight,
            "color": color,
            "label": label,
            "props": props
        }
    
    def load_graph_data(self):
        """Загружает данные графа из базы данных"""
        # Загружаем все узлы
        rows = self.DB.execCypher(
            "MATCH (n) RETURN id(n), n",
            cols=["vid agtype", "n agtype"]
        ).fetchall()

        nodes = {}
        for vid_raw, v in rows:
            vid = int(str(vid_raw))
            node_data = self.unwrap_node(v, age_id=vid)
            nodes[vid] = node_data
            self.G.add_node(vid, **node_data)

        # Загружаем все связи
        rows_edges = self.DB.execCypher(
            "MATCH (a)-[r]->(b) RETURN id(a), id(b), type(r), r",
            cols=["ida agtype", "idb agtype", "reltype agtype", "r agtype"]
        ).fetchall()

        for ida, idb, reltype, r in rows_edges:
            ida_i = int(str(ida))
            idb_i = int(str(idb))
            rel_raw = str(reltype)
            
            # Очищаем название связи
            rel_clean = re.sub(r"^\"|\"$|::[A-Za-z_0-9]+$", "", rel_raw).strip()
            if rel_clean.startswith("'") and rel_clean.endswith("'"):
                rel_clean = rel_clean[1:-1]
                
            self.G.add_edge(ida_i, idb_i, label=rel_clean, rel_type=rel_clean)

        print(f"Загружено узлов: {len(nodes)}")
        print(f"Загружено связей: {len(rows_edges)}")
        
        return nodes
    
    def visualize_graph(self):
        """Визуализирует граф с помощью matplotlib"""
        if self.G.number_of_nodes() == 0:
            print("Граф пустой! Нет данных для визуализации.")
            return

        # Создаем layout для графа
        plt.figure(figsize=(20, 15))
        
        # Используем spring layout с настройками для лучшего отображения иерархии
        pos = nx.spring_layout(self.G, seed=42, k=3, iterations=100, scale=2)

        # Подготовка данных для отрисовки узлов
        node_sizes = []
        node_colors = []
        labels = {}

        for node_id, node_data in self.G.nodes(data=True):
            node_sizes.append(node_data['weight'])
            node_colors.append(node_data['color'])
            labels[node_id] = node_data['display_name']

        # Отрисовываем узлы
        nx.draw_networkx_nodes(
            self.G, pos,
            node_size=node_sizes,
            node_color=node_colors,
            edgecolors="black",
            alpha=0.9,
            linewidths=2
        )

        # Отрисовываем связи
        edge_colors = []
        edge_styles = []
        
        for source, target, edge_data in self.G.edges(data=True):
            edge_label = edge_data.get('label', 'CONTAINS')
            if edge_label == 'CONTAINS':
                edge_colors.append('blue')
                edge_styles.append('solid')
            else:
                edge_colors.append('red')
                edge_styles.append('dashed')

        nx.draw_networkx_edges(
            self.G, pos,
            edge_color=edge_colors,
            style=edge_styles,
            arrows=True,
            arrowsize=25,
            arrowstyle='->',
            width=2,
            alpha=0.7,
            connectionstyle="arc3,rad=0.1"
        )

        # Добавляем подписи узлов
        nx.draw_networkx_labels(
            self.G, pos, labels,
            font_size=8,
            font_weight='bold',
            bbox=dict(
                facecolor="white",
                edgecolor="none",
                boxstyle="round,pad=0.3",
                alpha=0.9
            )
        )

        # Добавляем подписи связей (опционально - может быть много связей)
        edge_labels = {(u, v): d['label'] for u, v, d in self.G.edges(data=True)}
        nx.draw_networkx_edge_labels(
            self.G, pos,
            edge_labels=edge_labels,
            font_size=6,
            font_color='darkred'
        )

        # Настраиваем отображение
        plt.axis("off")
        plt.title("Professions Skills Graph\n(Profession → Category → Skill)", size=20, pad=20)
        plt.tight_layout()

        # Добавляем легенду
        legend_elements = [
            plt.Line2D([0], [0], marker='o', color='w', markerfacecolor='lightgreen', 
                      markersize=15, label='Profession'),
            plt.Line2D([0], [0], marker='o', color='w', markerfacecolor='lightyellow', 
                      markersize=15, label='Category'),
            plt.Line2D([0], [0], marker='o', color='w', markerfacecolor='lightblue', 
                      markersize=15, label='Skill'),
            plt.Line2D([0], [0], color='blue', linewidth=3, label='CONTAINS relationship')
        ]
        
        plt.legend(
            handles=legend_elements,
            loc='upper right',
            frameon=True,
            fancybox=True,
            shadow=True,
            framealpha=0.9
        )

        # Показываем граф
        plt.show()
    
    def print_statistics(self):
        """Выводит статистику по графу"""
        print("\n" + "="*50)
        print("СТАТИСТИКА ГРАФА")
        print("="*50)
        
        print(f"Всего узлов: {self.G.number_of_nodes()}")
        print(f"Всего связей: {self.G.number_of_edges()}")

        # Статистика по типам узлов
        node_types = {}
        for _, data in self.G.nodes(data=True):
            node_type = data.get('label', 'UNKNOWN')
            node_types[node_type] = node_types.get(node_type, 0) + 1

        print("\nТипы узлов:")
        for node_type, count in node_types.items():
            print(f"  {node_type}: {count}")

        # Статистика по типам связей
        edge_types = {}
        for _, _, data in self.G.edges(data=True):
            edge_type = data.get('label', 'UNKNOWN')
            edge_types[edge_type] = edge_types.get(edge_type, 0) + 1

        print("\nТипы связей:")
        for edge_type, count in edge_types.items():
            print(f"  {edge_type}: {count}")

        # Информация о профессиях
        professions = [data for _, data in self.G.nodes(data=True) if data.get('label') == 'Profession']
        print(f"\nПрофессии в графе: {len(professions)}")
        for prof in professions:
            print(f"  - {prof.get('name')} (ID: {prof.get('props', {}).get('profession_id')})")

        # Информация о навыках
        skills = [data for _, data in self.G.nodes(data=True) if data.get('label') == 'Skill']
        print(f"\nНавыков в графе: {len(skills)}")
        
        if skills:
            top_skills = sorted(skills, key=lambda x: x.get('props', {}).get('value', 0), reverse=True)[:5]
            print("Топ-5 навыков по значению:")
            for skill in top_skills:
                value = skill.get('props', {}).get('value', 0)
                print(f"  - {skill.get('name')}: {value}")

    def close_connection(self):
        """Закрывает соединение с базой данных"""
        if self.DB:
            self.DB.close()
            print("Соединение с базой данных закрыто")


def main():
    visualizer = GraphVisualizer()
    try:
        # Подключаемся к базе данных
        visualizer.connect_to_db()
        
        # Загружаем данные графа
        visualizer.load_graph_data()
        
        # Выводим статистику
        visualizer.print_statistics()
        
        # Визуализируем граф
        print("\nВизуализация графа...")
        visualizer.visualize_graph()
    except Exception as e:
        print(f"Произошла ошибка: {e}")
    finally:
        # Закрываем соединение
        visualizer.close_connection()


if __name__ == "__main__":
    main()