import { useEffect, useState } from 'react';
import {
  Title,
  TextInput,
  Stack,
  Text,
  Badge,
  Group,
  Button,
  Box,
  SimpleGrid,
} from '@mantine/core';
import { FormWrapper } from '@/components/form-wrapper/FormWrapper';
import {
  IconBrandJavascript,
  IconBrandTypescript,
  IconBrandReact,
  IconBrandNodejs,
  IconBrandPython,
  IconBrandDocker,
  IconDatabase,
  IconBrandGraphql,
  IconBrandGit,
  IconCode,
} from '@tabler/icons-react';
import { useQuestionnaire } from '../context/QuestionnaireContext';

// Иконки к предопределённым навыкам
const skillIcons: Record<string, JSX.Element> = {
  'JavaScript': <IconBrandJavascript size={16} />,
  'TypeScript': <IconBrandTypescript size={16} />,
  'React': <IconBrandReact size={16} />,
  'Node.js': <IconBrandNodejs size={16} />,
  'Python': <IconBrandPython size={16} />,
  'SQL': <IconDatabase size={16} />,
  'PostgreSQL': <IconDatabase size={16} />,
  'Docker': <IconBrandDocker size={16} />,
  'Next.js': <IconCode size={16} />,
  'GraphQL': <IconBrandGraphql size={16} />,
  'Git': <IconBrandGit size={16} />,
  'Java': <IconCode size={16} />,
};

const predefinedSkills = Object.keys(skillIcons);

const SkillsForm = () => {
  const { data, updateData } = useQuestionnaire();
  const [input, setInput] = useState('');
  const [skills, setSkills] = useState<string[]>(data.skills || []);
  const [customSkills, setCustomSkills] = useState<string[]>(
    data.skills.filter((s) => !predefinedSkills.includes(s))
  );

  const allSkills = [...new Set([...predefinedSkills, ...customSkills])];
  const filteredSkills = allSkills.filter((skill) =>
    skill.toLowerCase().includes(input.toLowerCase())
  );

  const handleToggleSkill = (skill: string) => {
    setSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : [...prev, skill]
    );
  };

  const handleAddCustomSkill = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    if (!allSkills.includes(trimmed)) {
      setCustomSkills((prev) => [...prev, trimmed]);
    }
    if (!skills.includes(trimmed)) {
      setSkills((prev) => [...prev, trimmed]);
    }
    setInput('');
  };

  useEffect(() => {
    updateData({ skills });
  }, [skills]);

  return (
    <FormWrapper formId="skills">
      <Stack>
        <Title order={2}>Диагностика IT навыков</Title>

        <Text fw={500}>Поиск IT навыков</Text>
        <TextInput
          placeholder="Начните вводить IT навык"
          value={input}
          onChange={(e) => setInput(e.currentTarget.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddCustomSkill()}
        />

        <Text fw={500}>Выберите ваши IT навыки:</Text>
        <SimpleGrid cols={3} spacing="sm">
          {filteredSkills.map((skill) => (
            <Button
              key={skill}
              variant={skills.includes(skill) ? 'filled' : 'default'}
              color={skills.includes(skill) ? 'teal' : 'gray'}
              onClick={() => handleToggleSkill(skill)}
              radius="md"
              leftSection={skillIcons[skill] || <IconCode size={16} />}
            >
              {skill}
            </Button>
          ))}

          {input.trim() &&
            !allSkills.some(
              (s) => s.toLowerCase() === input.trim().toLowerCase()
            ) && (
              <Button
                color="green"
                variant="light"
                radius="md"
                onClick={handleAddCustomSkill}
              >
                + Добавить "{input.trim()}"
              </Button>
            )}
        </SimpleGrid>

        {skills.length > 0 && (
          <Box mt="md">
            <Text fw={500} mb={4}>
              Выбранные навыки:
            </Text>
            <Group gap="xs">
              {skills.map((skill) => (
                <Badge
                  key={skill}
                  color="teal"
                  variant="filled"
                  radius="xl"
                  rightSection={
                    <span
                      style={{
                        cursor: 'pointer',
                        marginLeft: 8,
                        fontWeight: 700,
                      }}
                      onClick={() =>
                        setSkills((prev) => prev.filter((s) => s !== skill))
                      }
                    >
                      ×
                    </span>
                  }
                >
                  {skill}
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
