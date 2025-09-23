import { useMemo, useState } from "react";
import { Card, Text, Drawer, Badge, TextInput } from "@mantine/core";
import ForceGraph2D from "react-force-graph-2d";
import Cookies from "js-cookie";
import { getIconUrl } from "@/assets/icons/Icons";
import { skillCourses } from "@/data/cources/skillCourses";
import styles from './SkillGraphPage.module.css';

import graph_python_1 from "@/data/graphs/graph_python_1.json";
import graph_python_2 from "@/data/graphs/graph_python_2.json";
import graph_python_3 from "@/data/graphs/graph_python_3.json";

import graph_java_1 from "@/data/graphs/graph_java_1.json";
import graph_java_2 from "@/data/graphs/graph_java_2.json";
import graph_java_3 from "@/data/graphs/graph_java_3.json";

import graph_javascript_1 from "@/data/graphs/graph_javascript_1.json";
import graph_javascript_2 from "@/data/graphs/graph_javascript_2.json";
import graph_javascript_3 from "@/data/graphs/graph_javascript_3.json";

import graph_php_1 from "@/data/graphs/graph_php_1.json";
import graph_php_2 from "@/data/graphs/graph_php_2.json";
import graph_php_3 from "@/data/graphs/graph_php_3.json";

import graph_sql_1 from "@/data/graphs/graph_sql_1.json";
import graph_sql_2 from "@/data/graphs/graph_sql_2.json";
import graph_sql_3 from "@/data/graphs/graph_sql_3.json";

import graph_1c_1 from "@/data/graphs/graph_1c_1.json";
import graph_1c_2 from "@/data/graphs/graph_1c_2.json";
import graph_1c_3 from "@/data/graphs/graph_1c_3.json";

import graph_ios_1 from "@/data/graphs/graph_ios_1.json";
import graph_ios_2 from "@/data/graphs/graph_ios_2.json";
import graph_ios_3 from "@/data/graphs/graph_ios_3.json";

import graph_oracle_1 from "@/data/graphs/graph_oracle_1.json";
import graph_oracle_2 from "@/data/graphs/graph_oracle_2.json";
import graph_oracle_3 from "@/data/graphs/graph_oracle_3.json";

import graph_csharp_1 from "@/data/graphs/graph_csharp_1.json";
import graph_csharp_2 from "@/data/graphs/graph_csharp_2.json";
import graph_csharp_3 from "@/data/graphs/graph_csharp_3.json";

import graph_cplusplus_1 from "@/data/graphs/graph_c++_1.json";
import graph_cplusplus_2 from "@/data/graphs/graph_c++_2.json";
import graph_cplusplus_3 from "@/data/graphs/graph_c++_3.json";

import graph_бизнес_1 from "@/data/graphs/graph_бизнес_1.json";
import graph_бизнес_2 from "@/data/graphs/graph_бизнес_2.json";
import graph_бизнес_3 from "@/data/graphs/graph_бизнес_3.json";

import graph_маркетинговый_1 from "@/data/graphs/graph_маркетинговый_1.json";
import graph_маркетинговый_2 from "@/data/graphs/graph_маркетинговый_2.json";
import graph_маркетинговый_3 from "@/data/graphs/graph_маркетинговый_3.json";

import graph_системный_1 from "@/data/graphs/graph_системный_1.json";
import graph_системный_2 from "@/data/graphs/graph_системный_2.json";
import graph_системный_3 from "@/data/graphs/graph_системный_3.json";

import graph_финансовый_1 from "@/data/graphs/graph_финансовый_1.json";
import graph_финансовый_2 from "@/data/graphs/graph_финансовый_2.json";
import graph_финансовый_3 from "@/data/graphs/graph_финансовый_3.json";


const graphFiles: Record<string, Record<number, any>> = {
  "Python Developer": {
    1: graph_python_1,
    2: graph_python_2,
    3: graph_python_3,
  },
  "Java Developer": {
    1: graph_java_1,
    2: graph_java_2,
    3: graph_java_3,
  },
  "1C Developer": {
    1: graph_1c_1,
    2: graph_1c_2,
    3: graph_1c_3,
  },
  "C# Developer": {
    1: graph_csharp_1,
    2: graph_csharp_2,
    3: graph_csharp_3,
  },
  "C++ Developer": {
    1: graph_cplusplus_1,
    2: graph_cplusplus_2,
    3: graph_cplusplus_3,
  },
  "iOS Developer": {
    1: graph_ios_1,
    2: graph_ios_2,
    3: graph_ios_3,
  },
  "JavaScript разработчик": {
    1: graph_javascript_1,
    2: graph_javascript_2,
    3: graph_javascript_3,
  },
  "Oracle Developer": {
    1: graph_oracle_1,
    2: graph_oracle_2,
    3: graph_oracle_3,
  },
  "PHP Developer": {
    1: graph_php_1,
    2: graph_php_2,
    3: graph_php_3,
  },
  "SQL Developer": {
    1: graph_sql_1,
    2: graph_sql_2,
    3: graph_sql_3,
  },
  "Бизнес-аналитик": {
    1: graph_бизнес_1,
    2: graph_бизнес_2,
    3: graph_бизнес_3,
  },
  "Маркетинговый аналитик": {
    1: graph_маркетинговый_1,
    2: graph_маркетинговый_2,
    3: graph_маркетинговый_3,
  },
  "Системный аналитик": {
    1: graph_системный_1,
    2: graph_системный_2,
    3: graph_системный_3,
  },
  "Финансовый аналитик": {
    1: graph_финансовый_1,
    2: graph_финансовый_2,
    3: graph_финансовый_3,
  },
};


const goalToGraphMap: Record<string, string> = {
  "1c": "1C Developer",
  "c#": "C# Developer",
  "c++": "C++ Developer",
  ios: "iOS Developer",
  java: "Java Developer",
  javascript: "JavaScript разработчик",
  oracle: "Oracle Developer",
  php: "PHP Developer",
  python: "Python Developer",
  sql: "SQL Developer",
  бизнес: "Бизнес-аналитик",
  маркетинговый: "Маркетинговый аналитик",
  системный: "Системный аналитик",
  финансовый: "Финансовый аналитик",
};

type NodeType = {
  id: string;
  group: string;
  count?: number;
  color?: string;
  x?: number;
  y?: number;
  level?: number;
};

const iconCache = new Map<string, HTMLImageElement>();

const LEVEL_ORDER: Record<string, number> = {
  Intern: 1,
  Junior: 1,
  Middle: 2,
  Senior: 3,
  Lead: 3,
};

const getUserLevelForGoal = (): number => {
  const position = Cookies.get("mock_position"); // Например: "Senior Frontend Developer"
  if (!position) return 1;

  // Извлекаем первое слово (уровень)
  const levelMatch = position.split(" ")[0];
  return LEVEL_ORDER[levelMatch] || 1;
};

export const SkillGraphPage = () => {
  const [selected, setSelected] = useState<NodeType | null>(null);
  const [search, setSearch] = useState("");

  const userData = useMemo(() => {
    const stored = Cookies.get("questionnaireResult");
    return stored ? JSON.parse(stored) : null;
  }, []);

  const rawDataArray = useMemo(() => {
    if (!userData?.goals) return [];
  
    const selectedGoals: string[] = userData.goals;
  
    const selectedGraphs = selectedGoals
      .map((key: string) => goalToGraphMap[key.toLowerCase()])
      .filter((name): name is keyof typeof graphFiles => !!name && graphFiles.hasOwnProperty(name));
  
    const userLevel = getUserLevelForGoal();
  
    return selectedGraphs.map((name) => {
      return graphFiles[name][userLevel] || graphFiles[name][1];
    });
  }, [userData]);
  
  

  const graphData = useMemo(() => {
    const nodesMap = new Map<string, NodeType>();
    const links: { source: string; target: string }[] = [];

    const normalizedSkills = new Set<string>(
      (userData?.skills || []).map((s: string) => s.toLowerCase())
    );

    rawDataArray.forEach((rawData) => {
      const [role] = Object.keys(rawData);
      const categories = rawData[role];

      if (!nodesMap.has(role)) {
        nodesMap.set(role, { id: role, group: "role", level: 0 });
      }

      Object.entries(categories).forEach(([category, skills]: [string, any]) => {
        if (!nodesMap.has(category)) {
          nodesMap.set(category, { id: category, group: "category", level: 1 });
        }
        links.push({ source: role, target: category });

        Object.entries(skills).forEach(([skill, { count }]: [string, any]) => {
          if (!nodesMap.has(skill)) {
            const isMastered = normalizedSkills.has(skill.toLowerCase());
            nodesMap.set(skill, {
              id: skill,
              group: "skill",
              count,
              level: 2,
              color: isMastered ? "#12b886" : "#adb5bd",
            });
            links.push({ source: category, target: skill });
          }
        });
      });
    });

    const allNodes = Array.from(nodesMap.values());

    if (search.trim()) {
      const query = search.toLowerCase();
      const matchedIds = new Set<string>();
      const relatedIds = new Set<string>();

      // Найти совпадающие узлы
      allNodes.forEach((node) => {
        if (node.id.toLowerCase().includes(query)) {
          matchedIds.add(node.id);
        }
      });

      // Найти все связанные ноды (родителей и детей)
      links.forEach(({ source, target }) => {
        if (matchedIds.has(source) || matchedIds.has(target)) {
          relatedIds.add(source.toString());
          relatedIds.add(target.toString());
        }
      });

      const finalIds = new Set([...matchedIds, ...relatedIds]);

      return {
        nodes: allNodes.filter((n) => finalIds.has(n.id)),
        links: links.filter(
          ({ source, target }) =>
            finalIds.has(source.toString()) && finalIds.has(target.toString())
        ),
      };
    }

    return {
      nodes: allNodes,
      links,
    };

  }, [rawDataArray, userData, search]);

  return (
    <Card p="md" radius="md" withBorder style={{ height: "100%", overflow: "hidden" }}>
      <TextInput
        placeholder="Поиск по навыкам..."
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
        mb="md"
      />

      <div className={styles.graphContainer}>
      <ForceGraph2D
        graphData={graphData}
        nodeAutoColorBy="group"
        onNodeClick={(node) => setSelected(node as NodeType)}
        enableNodeDrag={graphData.links.length !== 0}
        linkCurvature={0.15}
        linkDirectionalArrowRelPos={1}
        linkDirectionalArrowLength={4}

        // Изменяем цвет стрелки
        linkColor={(link) => {
          const targetId = (link.target as NodeType).id?.toLowerCase?.();
          return userData?.skills?.some((s: string) => s.toLowerCase() === targetId) ? "#12b886" : "teal";
        }}

        // Изменяем стиль стрелки — пунктир только для неосвоенных
        linkLineDash={(link) => {
          const targetId = (link.target as NodeType).id?.toLowerCase?.();
          return userData?.skills?.some((s: string) => s.toLowerCase() === targetId) ? [] : [2, 2];
        }}

        // Толщина линии — чуть толще если освоен
        linkWidth={(link) => {
          const targetId = (link.target as NodeType).id?.toLowerCase?.();
          return userData?.skills?.some((s: string) => s.toLowerCase() === targetId) ? 5 : 1;
        }}

        nodeCanvasObject={(node: NodeType, ctx, globalScale) => {
          const label = node.id;
          const level = node.level ?? 2;
          const sizeByLevel = [70, 55, 40];
          const baseSize = (sizeByLevel[level] || 40) / globalScale;
          const fontSize = 14 / globalScale;
        
          const x = node.x ?? 0;
          const y = node.y ?? 0;
          const iconUrl = getIconUrl(label.toLowerCase());
        
          if (iconCache.has(iconUrl)) {
            const img = iconCache.get(iconUrl)!;
            const aspectRatio = img.width / img.height;
            let drawWidth = baseSize;
            let drawHeight = baseSize;
        
            if (aspectRatio > 1) drawHeight = baseSize / aspectRatio;
            else drawWidth = baseSize * aspectRatio;
        
            // Draw icon
            ctx.drawImage(img, x - drawWidth / 2, y - drawHeight / 2, drawWidth, drawHeight);
        
            // Draw label with outline
            ctx.font = `${fontSize}px Inter`;
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            ctx.lineWidth = 4 / globalScale;
            ctx.strokeStyle = "#ffffff"; // Обводка белым
            ctx.strokeText(label, x, y + baseSize * 0.3);
            ctx.fillStyle = "#1f2937";   // Основной цвет текста
            ctx.fillText(label, x, y + baseSize * 0.3);
          } else {
            const img = new Image();
            img.src = iconUrl;
            img.onload = () => iconCache.set(iconUrl, img);
          }
        }        
      }
      />
      </div>

      <Drawer
        opened={!!selected}
        onClose={() => setSelected(null)}
        title="Информация о навыке"
        padding="md"
        position="right"
        size="md"
      >
        {selected && (
          <>
            <Text fw={600} size="lg" mt="xs">{selected.id}</Text>

            <div className={styles.iconWrapper}>
              <img
                src={getIconUrl(selected.id.toLowerCase())}
                alt={selected.id}
                className={styles.drawerIcon}
              />
            </div>

            {selected.group === "skill" ? (
              <>
                <Text mt="sm">Освоенность:</Text>
                <Badge color={userData?.skills?.some((s: string) => s.toLowerCase() === selected.id.toLowerCase()) ? "green" : "gray"}>
                  {userData?.skills?.some((s: string) => s.toLowerCase() === selected.id.toLowerCase())
                    ? "Освоен"
                    : "Не освоен"}
                </Badge>

                <Text mt="sm">Популярность в графе: {selected.count ?? 0}</Text>
              </>
            ) : (
              <Text mt="sm">Категория: {selected.group}</Text>
            )}

            {selected.group === "skill" && skillCourses[selected.id] && (
              <>
                <Text mt="md" fw={500}>Курсы по {selected.id}:</Text>
                <ul className={styles.courseList}>
                  {Object.entries(skillCourses[selected.id]).map(([title, link]) => (
                    <li key={title} className={styles.courseItem}>
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.courseLink}
                      >
                        {title}
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </>
        )}
      </Drawer>
    </Card>
  );
};

export default SkillGraphPage;
