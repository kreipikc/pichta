import { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Select,
  NumberInput,
  TextInput,
  Group,
  Button,
  Stack,
  LoadingOverlay,
} from "@mantine/core";
import { AppDateField } from "@/components/date-time-picker/AppDateField";
import { toast } from "react-toastify";
import {
  useAddSkillMutation,
  useGetAllSkillsQuery,
} from "@/app/redux/api/skill.api";
import type { UserSkillCreateI } from "@/shared/types/api/SkillI";

export default function AddSkillModal() {
  const [opened, setOpened] = useState(false);
  const { data: allSkills = [], isLoading } = useGetAllSkillsQuery();
  const [addSkill, addState] = useAddSkillMutation();

  const skillOptions = useMemo(() => {
    const uniq = new Map<number, string>();
    for (const s of allSkills) {
      if (s && typeof s.id === "number" && Number.isFinite(s.id) && s.name) {
        if (!uniq.has(s.id)) uniq.set(s.id, s.name);
      }
    }
    return Array.from(uniq, ([id, name]) => ({ value: String(id), label: name }));
  }, [allSkills]);

  const [skillId, setSkillId] = useState<string | null>(null);
  const [proficiency, setProficiency] = useState<number>(0);
  const [priority, setPriority] = useState<number>(1);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [status, setStatus] = useState<string>("");

  const handleProficiencyChange = (val: string | number) => {
    const num = typeof val === "number" ? val : Number(val);
    if (Number.isFinite(num)) setProficiency(num);
  };
  const handlePriorityChange = (val: string | number) => {
    const num = typeof val === "number" ? val : Number(val);
    if (Number.isFinite(num)) setPriority(num);
  };

  const reset = () => {
    setSkillId(null);
    setProficiency(0);
    setPriority(1);
    setStartDate(null);
    setStatus("");
  };

  const onSubmit = async () => {
    if (!skillId) {
      toast.error("Выберите навык");
      return;
    }
    const dto: UserSkillCreateI = {
      id_skill: Number(skillId),
      id_user: 0, // на бэке для self берется текущий пользователь; значение игнорируется
      proficiency,
      priority,
      start_date: startDate ? startDate.toISOString() : null,
      end_date: null,
      status,
    };
    await addSkill([dto]).unwrap(); // БЭК ЖДЕТ МАССИВ
    toast.success("Навык добавлен");
    setOpened(false);
    reset();
  };

  return (
    <>
      <Button onClick={() => setOpened(true)}>Добавить навык</Button>
      <Modal opened={opened} onClose={() => setOpened(false)} title="Добавить навык" centered>
        <Stack gap="sm" pos="relative">
          <LoadingOverlay visible={isLoading || addState.isLoading} />
          <Select
            label="Навык"
            placeholder="Выберите навык"
            data={skillOptions}
            value={skillId}
            onChange={(v) => setSkillId(v ?? null)}
            searchable
            clearable
            nothingFoundMessage="Нет совпадений"
            required
          />
          <NumberInput
            label="Уровень освоения"
            value={proficiency}
            onChange={handleProficiencyChange}
            min={0}
            max={100}
            step={1}
            required
          />
          <NumberInput
            label="Приоритет"
            value={priority}
            onChange={handlePriorityChange}
            min={1}
            max={5}
            step={1}
          />
          <AppDateField label="Дата начала" value={startDate} onChange={setStartDate} />
          <TextInput label="Статус" value={status} onChange={(e) => setStatus(e.currentTarget.value)} />

          <Group justify="right" mt="sm">
            <Button variant="light" onClick={reset}>Сброс</Button>
            <Button onClick={onSubmit}>Добавить</Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
