import { useEffect, useState } from 'react';
import { FormWrapper } from '@/components/form-wrapper/FormWrapper';
import { Select, TextInput, Text, Title, Paper } from '@mantine/core';
import { useQuestionnaire } from './../context/QuestionnaireContext';

export default function EducationForm() {
  const { data, updateData } = useQuestionnaire();
  const [institution, setInstitution] = useState(data.education.institution);
  const [degree, setDegree] = useState(data.education.degree);

  useEffect(() => {
    updateData({ education: { institution, degree } });
  }, [institution, degree]);

  return (
    <FormWrapper formId="education-form" width={640}>
      <Title order={2} mb="sm">Профессиональное образование</Title>
      <Paper withBorder p="sm" mb="md" radius="md" bg="yellow.0">
        <Text size="sm" color="dimmed">
          Введите информацию об учебных заведениях (университеты, колледжи, техникумы)...
        </Text>
      </Paper>
      <Select
        label="Тип учебного заведения"
        placeholder="Выберите тип"
        data={["Университет", "Колледж", "Техникум"]}
        value={degree}
        onChange={(v) => setDegree(v || '')}
      />
      <TextInput
        label="Направление подготовки"
        placeholder="Например: Прикладная математика"
        mt="md"
        value={institution}
        onChange={(e) => setInstitution(e.currentTarget.value)}
      />
    </FormWrapper>
  );
}
