import { useEffect, useMemo, useState } from "react";
import { Grid, Stack, Title, Text, Paper, Loader, Center } from "@mantine/core";
import { FormWrapper } from "@/components/form-wrapper/FormWrapper";
import { useQuestionnaire } from "../context/QuestionnaireContext";
import { useGetAllProfessionQuery } from "@/app/redux/api/profession.api";

const GoalsForm = () => {
  const { data, updateData } = useQuestionnaire();
  const { data: professions, isLoading } = useGetAllProfessionQuery();

  // keep legacy storage: ids joined by `||`
  const initiallySelected = useMemo(() => {
    if (!data.goals) return [];
    return data.goals.split("||").filter(Boolean).map((x) => Number(x));
  }, [data.goals]);

  const [selected, setSelected] = useState<number[]>(initiallySelected);

  useEffect(() => {
    updateData({ goals: selected.join("||") });
  }, [selected]);

  if (isLoading) {
    return (
      <FormWrapper formId="goals">
        <Center><Loader /></Center>
      </FormWrapper>
    );
  }

  return (
    <FormWrapper formId="goals">
      <Stack gap="md">
        <Title order={2}>Выберите желаемые профессии</Title>
        <Grid gutter="sm">
          {(professions ?? []).map((prof) => (
            <Grid.Col span={6} key={prof.id}>
              <Paper
                p="sm"
                withBorder
                radius="md"
                onClick={() =>
                  setSelected((prev) =>
                    prev.includes(prof.id) ? prev.filter((v) => v !== prof.id) : [...prev, prof.id]
                  )
                }
                style={{
                  cursor: "pointer",
                  borderColor: selected.includes(prof.id) ? "var(--mantine-color-teal-6)" : undefined,
                  background: selected.includes(prof.id) ? "var(--mantine-color-teal-0)" : undefined,
                  transition: "all 0.2s",
                }}
              >
                <Text>{prof.name}</Text>
              </Paper>
            </Grid.Col>
          ))}
        </Grid>
      </Stack>
    </FormWrapper>
  );
};

export default GoalsForm;
