import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Grid,
  Stack,
  Title,
  Text,
  Paper,
} from "@mantine/core";
import { FormWrapper } from "@/components/form-wrapper/FormWrapper";
import { useQuestionnaire } from "../context/QuestionnaireContext";

// Ключи и названия профессий
const goalMap: Record<string, string> = {
  "1c": "1C Developer",
  "c#": "C# Developer",
  "c++": "C++ Developer",
  "ios": "iOS Developer",
  "java": "Java Developer",
  "javascript": "JavaScript разработчик",
  "oracle": "Oracle Developer",
  "php": "PHP Developer",
  "python": "Python Developer",
  "sql": "SQL Developer",
  "бизнес": "Бизнес-аналитик",
  "маркетинговый": "Маркетинговый аналитик",
  "системный": "Системный аналитик",
  "финансовый": "Финансовый аналитик",
};

const GoalsForm = () => {
  const { data, updateData } = useQuestionnaire();
  const [selected, setSelected] = useState<string[]>(
    data.goals ? data.goals.split("||") : []
  );

  const handleToggle = (key: string) => {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((v) => v !== key) : [...prev, key]
    );
  };

  useEffect(() => {
    updateData({ goals: selected.join("||") });
  }, [selected]);

  return (
    <FormWrapper formId="goals">
      <Stack gap="md">
        <Title order={2}>Выберите желаемые профессии</Title>
        <Grid gutter="sm">
          {Object.entries(goalMap).map(([key, title]) => (
            <Grid.Col span={6} key={key}>
              <Paper
                p="sm"
                withBorder
                radius="md"
                onClick={() => handleToggle(key)}
                style={{
                  cursor: "pointer",
                  backgroundColor: selected.includes(key)
                    ? "var(--mantine-color-teal-light)"
                    : "white",
                  borderColor: selected.includes(key)
                    ? "var(--mantine-color-teal-5)"
                    : undefined,
                  transition: "all 0.2s",
                }}
              >
                <Text>{title}</Text>
              </Paper>
            </Grid.Col>
          ))}
        </Grid>
      </Stack>
    </FormWrapper>
  );
};

export default GoalsForm;
