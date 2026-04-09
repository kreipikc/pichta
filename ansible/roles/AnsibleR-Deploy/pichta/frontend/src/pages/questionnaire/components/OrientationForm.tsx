import { useState, useEffect } from "react";
import { Stack, Title, Text, Textarea } from "@mantine/core";
import { FormWrapper } from "@/components/form-wrapper/FormWrapper";
import { useQuestionnaire } from "../context/QuestionnaireContext";

const OrientationForm = () => {
  const { data, updateData } = useQuestionnaire();
  const [orientation, setOrientation] = useState(data.orientation || "");

  useEffect(() => {
    updateData({ orientation });
  }, [orientation]);

  return (
    <FormWrapper formId="orientation">
      <Stack>
        <Title order={2}>Профориентация</Title>
        <Text fw={500}>
          Опишите ваши профессиональные интересы в сфере IT
        </Text>
        <Textarea
          placeholder="Например: Хочу развиваться в веб-разработке и работать над проектами с открытым кодом…"
          minRows={10}
          autosize
          value={orientation}
          onChange={(e) => setOrientation(e.currentTarget.value)}
        />
      </Stack>
    </FormWrapper>
  );
};

export default OrientationForm;
