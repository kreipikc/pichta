import { useEffect, useMemo, useState } from 'react';
import { Title, TextInput, Stack, Text, Button, Box, SimpleGrid, Group, Badge } from '@mantine/core';
import { FormWrapper } from '@/components/form-wrapper/FormWrapper';
import { useQuestionnaire } from '../context/QuestionnaireContext';
import { useGetAllSkillsQuery } from '@/app/redux/api/skill.api';

const SkillsForm = () => {
  const { data, updateData } = useQuestionnaire();
  const { data: skillsDict } = useGetAllSkillsQuery();

  const dictByName = useMemo(() => {
    const map = new Map<string, number>();
    (skillsDict ?? []).forEach((s) => map.set(s.name, s.id));
    return map;
  }, [skillsDict]);

  const [input, setInput] = useState('');
  const [skills, setSkills] = useState<string[]>(data.skills || []);

  const allSkillNames = useMemo(() => Array.from(dictByName.keys()), [dictByName]);
  const merged = useMemo(() => Array.from(new Set([...allSkillNames, ...skills.filter(s => !allSkillNames.includes(s))])), [allSkillNames, skills]);
  const filtered = merged.filter((s) => s.toLowerCase().includes(input.toLowerCase()));

  useEffect(() => {
    updateData({ skills });
  }, [skills]);

  const toggleSkill = (name: string) => {
    setSkills((prev) => (prev.includes(name) ? prev.filter((v) => v !== name) : [...prev, name]));
  };

  const addCustom = () => {
    const v = input.trim();
    if (!v) return;
    if (!skills.includes(v)) setSkills((p) => [...p, v]);
    setInput('');
  };

  return (
    <FormWrapper formId="skills">
      <Stack gap="sm">
        <Title order={2}>Навыки</Title>
        <Text fw={500}>Поиск IT навыков</Text>
        <TextInput
          placeholder="Начните вводить IT навык"
          value={input}
          onChange={(e) => setInput(e.currentTarget.value)}
          onKeyDown={(e) => e.key === 'Enter' && addCustom()}
        />
        <Text fw={500}>Выберите ваши IT навыки:</Text>
        <SimpleGrid cols={3} spacing="sm">
          {filtered.map((name) => (
            <Button
              key={name}
              variant={skills.includes(name) ? 'filled' : 'default'}
              onClick={() => toggleSkill(name)}
              radius="md"
            >
              {name}
            </Button>
          ))}
          {input.trim() && !merged.some((s) => s.toLowerCase() === input.trim().toLowerCase()) && (
            <Button variant="light" onClick={addCustom}>
              Добавить «{input.trim()}»
            </Button>
          )}
        </SimpleGrid>

        {skills.length > 0 && (
          <Box mt="md">
            <Text fw={500}>Вы выбрали:</Text>
            <Group gap="xs" mt="xs">
              {skills.map((s) => (
                <Badge
                  key={s}
                  radius="sm"
                  onClick={() => toggleSkill(s)}
                  style={{ cursor: 'pointer' }}
                >
                  {s}
                </Badge>
              ))}
            </Group>
          </Box>
        )}
      </Stack>
    </FormWrapper>
  );
};

export default SkillsForm;
