import {
    Modal,
    Stack,
    Title,
    Text,
    Paper,
    Group,
    Button,
    Divider,
  } from '@mantine/core';
  import { useNavigate } from 'react-router-dom';
  import Cookies from 'js-cookie';
  import { useQuestionnaire } from '../context/QuestionnaireContext';
  
  interface Props {
    opened: boolean;
    onClose: () => void;
  }

  const LEVEL_ORDER: Record<string, number> = {
    Intern: 0,
    Junior: 1,
    Middle: 2,
    Senior: 3,
    Lead: 4,
  };
  
  const SummaryModal = ({ opened, onClose }: Props) => {
    const { data } = useQuestionnaire();
    const navigate = useNavigate();

    const getHighestPosition = (experience: { name: string; level: string }[]) => {
      if (experience.length === 0) return '';
      const sorted = [...experience].sort(
        (a, b) => LEVEL_ORDER[b.level] - LEVEL_ORDER[a.level]
      );
      const highest = sorted[0];
      return `${highest.level} ${highest.name}`;
    };
  
    const handleConfirm = () => {
      const result = {
        education: data.education,
        experience: data.experience,
        about: data.about,
        skills: data.skills,
        orientation: data.orientation,
        goals: data.goals.split('||'),
      };
    
      const highestPosition = getHighestPosition(data.experience);
    
      Cookies.set('questionnaireResult', JSON.stringify(result), { expires: 30 });
      Cookies.set('mock_position', highestPosition, { expires: 30 }); // <-- добавили
    
      onClose();
      navigate('/user/profile');
    };
    
  
    return (
      <Modal
        opened={opened}
        onClose={onClose}
        title="Подтверждение данных"
        size="lg"
        centered
      >
        <Stack>
          <Paper withBorder p="md">
            <Text fw={600}>Образование</Text>
            <Text>Тип: {data.education.degree || '—'}</Text>
            <Text>Направление: {data.education.institution || '—'}</Text>
          </Paper>
  
          <Paper withBorder p="md">
            <Text fw={600}>Профессии</Text>
            {data.experience.length > 0 ? (
              data.experience.map((exp, i) => (
                <Text key={i}>
                  {exp.name} — {exp.level}
                </Text>
              ))
            ) : (
              <Text>—</Text>
            )}
          </Paper>
  
          <Paper withBorder p="md">
            <Text fw={600}>Навыки</Text>
            <Group gap="xs" wrap="wrap">
              {data.skills.length > 0
                ? data.skills.map((s, i) => <Text key={i}>{s}</Text>)
                : '—'}
            </Group>
          </Paper>
  
          <Paper withBorder p="md">
            <Text fw={600}>О себе</Text>
            <Text>{data.about || '—'}</Text>
          </Paper>
  
          <Paper withBorder p="md">
            <Text fw={600}>Профориентация</Text>
            <Text>{data.orientation || '—'}</Text>
          </Paper>
  
          <Paper withBorder p="md">
            <Text fw={600}>Цели</Text>
            <Group gap="xs" wrap="wrap">
              {data.goals
                ? data.goals.split('||').map((g, i) => <Text key={i}>{g}</Text>)
                : '—'}
            </Group>
          </Paper>
  
          <Divider my="sm" />
          <Button color="teal" fullWidth onClick={handleConfirm}>
            Подтвердить и перейти в профиль
          </Button>
        </Stack>
      </Modal>
    );
  };
  
  export default SummaryModal;
  