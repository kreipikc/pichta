import { useEffect, useRef, useState } from "react";
import { Card, Title, Text, Drawer } from "@mantine/core";
import Cookies from "js-cookie";
import { Gantt, Task } from "gantt-task-react";
import "gantt-task-react/dist/index.css";

import styles from "./GanttChartPage.module.css";
import { skillCourses } from "@/data/cources/skillCourses";

// Импорт графов
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


export const GanttChartPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [ganttKey, setGanttKey] = useState(0);

  // Drag-scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    const handleMouseDown = (e: MouseEvent) => {
      isDown = true;
      startX = e.pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
      container.classList.add(styles.dragging);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startX) * 1.5;
      container.scrollLeft = scrollLeft - walk;
    };

    const stopDragging = () => {
      isDown = false;
      container.classList.remove(styles.dragging);
    };

    container.addEventListener("mousedown", handleMouseDown);
    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseup", stopDragging);
    container.addEventListener("mouseleave", stopDragging);

    return () => {
      container.removeEventListener("mousedown", handleMouseDown);
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseup", stopDragging);
      container.removeEventListener("mouseleave", stopDragging);
    };
  }, []);

  useEffect(() => {
    const stored = Cookies.get("questionnaireResult");
    if (!stored) return;

    const parsed = JSON.parse(stored);
    const userSkills = (parsed.skills || []).map((s: string) => s.toLowerCase());
    const selectedGoals: string[] = parsed.goals || [];
    const experience = parsed.experience || [];

    const unmastered: Set<string> = new Set();

    selectedGoals.forEach((goalKey) => {
      const graphName = goalToGraphMap[goalKey.toLowerCase()];
      
      const level = getUserLevelForGoal();
      const graph = graphFiles[graphName]?.[level];

      if (!graph) return;

      const [role] = Object.keys(graph);
      const categories = graph[role];

      Object.entries(categories).forEach(([_, skills]: [string, any]) => {
        Object.keys(skills).forEach((skill) => {
          if (!userSkills.includes(skill.toLowerCase())) {
            unmastered.add(skill);
          }
        });
      });
    });


    const now = new Date();
    const taskList: Task[] = Array.from(unmastered).map((skill, index) => {
      const start = new Date(now);
      start.setDate(start.getDate() + index * 7);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);

      return {
        start,
        end,
        name: skill,
        id: `task-${index}`,
        type: "task",
        progress: 0,
        isDisabled: true,
        styles: {
          backgroundColor: "teal",
          progressColor: "#12b886",
          backgroundSelectedColor: "#12b886",
        },
      };
    });

    setTasks(taskList);
  }, []);

  return (
    <>
      <Card p="md" radius="md" withBorder className={styles.card}>
        <Title order={2} mb="md">План изучения навыков</Title>
        <div ref={containerRef} className={styles.scrollContainer}>
          {tasks.length > 0 ? (
            <Gantt
              key={ganttKey}
              tasks={tasks}
              listCellWidth="220px"
              locale="ru"
              onSelect={(task) => setSelectedTask(task)}
            />
          ) : (
            <Text>Нет навыков для изучения</Text>
          )}
        </div>
      </Card>

      <Drawer
        opened={!!selectedTask}
        onClose={() => {
          setSelectedTask(null);
          setGanttKey((k) => k + 1);
        }}
        title="Информация о задаче"
        position="right"
        padding="md"
        size="md"
      >
        {selectedTask && (
          <>
            <Text fw={600} size="lg" mb="xs">
              Что изучаем:
            </Text>
            <Text mb="md">{selectedTask.name}</Text>

            <Text fw={600} size="lg" mb="xs">
              Сроки изучения:
            </Text>
            <Text mb="md">
              {selectedTask.start.toLocaleDateString()} — {selectedTask.end.toLocaleDateString()}
            </Text>

            <Text fw={600} size="lg" mb="xs">
              Курсы:
            </Text>
            {skillCourses[selectedTask.name] ? (
              <ul className={styles.courseList}>
                {Object.entries(skillCourses[selectedTask.name]).map(([title, link]) => (
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
            ) : (
              <Text size="sm" color="dimmed">
                Курсы для этого навыка пока не найдены.
              </Text>
            )}
          </>
        )}
      </Drawer>

    </>
  );
};

export default GanttChartPage;
