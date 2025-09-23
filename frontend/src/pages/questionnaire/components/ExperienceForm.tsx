import { useEffect, useState } from 'react';
import {
  TextInput,
  Select,
  Button,
  Textarea,
  Box,
  Stack,
  Group,
  Paper,
  Title,
  Text,
  Autocomplete,
} from '@mantine/core';
import { FormWrapper } from '@/components/form-wrapper/FormWrapper';
import { useQuestionnaire } from './../context/QuestionnaireContext';

const MOCK_PROFESSIONS = [
  'Frontend Developer',
  'Backend Developer',
  'Fullstack Developer',
  'DevOps Engineer',
  'QA Engineer',
  'Data Scientist',
  'UI/UX Designer',
  'Project Manager',
  'Mobile Developer',
  'Business Analyst',
];

export const ExperienceForm = () => {
  const { data, updateData } = useQuestionnaire();
  const [profession, setProfession] = useState('');
  const [level, setLevel] = useState('');
  const [about, setAbout] = useState(data.about || '');
  const [experiences, setExperiences] = useState(data.experience || []);

  const handleAdd = () => {
    if (profession && level) {
      setExperiences((prev) => [...prev, { name: profession, level }]);
      setProfession('');
      setLevel('');
    }
  };

  const handleRemove = (index: number) => {
    setExperiences((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    updateData({ experience: experiences, about });
  }, [experiences, about]);

  return (
    <FormWrapper formId="experience">
      <Stack>
        <Title order={2}>Профессиональный опыт в IT</Title>

        <Autocomplete
          label="IT профессия"
          placeholder="Введите IT профессию"
          value={profession}
          data={MOCK_PROFESSIONS}
          onChange={(value) => setProfession(value)}
        />

        <Select
          label="Уровень"
          placeholder="Выберите уровень"
          data={["Intern", "Junior", "Middle", "Senior", "Lead"]}
          value={level}
          onChange={(v) => setLevel(v || '')}
        />

        <Button onClick={handleAdd} color="teal" variant="filled">
          Добавить профессию
        </Button>

        {experiences.length > 0 && (
          <Box>
            <Text fw={600} mt="md">Добавленный опыт:</Text>
            {experiences.map((exp, index) => (
              <Paper key={index} withBorder p="sm" mt="xs" radius="md">
                <Group justify="space-between">
                  <div>
                    <Text><strong>Профессия:</strong> {exp.name}</Text>
                    <Text><strong>Уровень:</strong> {exp.level}</Text>
                  </div>
                  <Button
                    size="xs"
                    color="red"
                    variant="subtle"
                    onClick={() => handleRemove(index)}
                  >
                    Удалить
                  </Button>
                </Group>
              </Paper>
            ))}
          </Box>
        )}

        <Textarea
          label="О себе"
          placeholder="Расскажите о своем опыте и навыках"
          value={about}
          onChange={(e) => setAbout(e.currentTarget.value)}
          autosize
          minRows={3}
        />
      </Stack>
    </FormWrapper>
  );
};

export default ExperienceForm;
