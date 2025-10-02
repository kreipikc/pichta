import { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Select,
  NumberInput,
  Group,
  Button,
  Stack,
  LoadingOverlay,
  Text,
} from "@mantine/core";
import { AppDateField } from "@/components/date-time-picker/AppDateField";
import { toast } from "react-toastify";
import {
  useAddSkillMutation,
  useGetAllSkillsQuery,
  useGetUserSkillsQuery,
} from "@/app/redux/api/skill.api";
import type { UserSkillCreateI } from "@/shared/types/api/SkillI";

type Props = { userId: number };

export default function AddSkillModal({ userId }: Props) {
  const [opened, setOpened] = useState(false);
  const { data: allSkills = [], isLoading } = useGetAllSkillsQuery();
  const { refetch: refetchUserSkills } = useGetUserSkillsQuery(userId);

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
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [status, setStatus] = useState<"inactive" | "process" | "complete">("inactive");

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
    setEndDate(null);
    setStatus("inactive");
  };

  const validate = () => {
    if (!skillId) {
      toast.error("Выберите навык");
      return false;
    }
    if (!startDate) {
      toast.error("Укажите дату начала");
      return false;
    }
    if (!endDate) {
      toast.error("Укажите дату окончания");
      return false;
    }
    if (endDate.getTime() < startDate.getTime()) {
      toast.error("Дата окончания не может быть раньше даты начала");
      return false;
    }
    if (!status) {
      toast.error("Выберите статус");
      return false;
    }
    return true;
  };

  const onSubmit = async () => {
    if (!validate()) return;

    const dto: UserSkillCreateI = {
      id_skill: Number(skillId),
      proficiency,
      priority,
      start_date: startDate!.toISOString(),
      end_date: endDate!.toISOString(),
      status, // "inactive" | "process" | "complete"
    };

    // БЭК /skill/add принимает массив
    await addSkill({ body: [dto] }).unwrap();

    await refetchUserSkills();

    toast.success("Навык добавлен");
    setOpened(false);
    reset();
  };

  // чтобы при повторном открытии модалки звёздочки/required были чистыми
  useEffect(() => {
    if (!opened) reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened]);

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
            withAsterisk
            required
          />

          <NumberInput
            label="Уровень освоения, %"
            value={proficiency}
            onChange={handleProficiencyChange}
            min={0}
            max={100}
            step={1}
            withAsterisk
            required
          />

          <NumberInput
            label="Приоритет (1–5)"
            value={priority}
            onChange={handlePriorityChange}
            min={1}
            max={5}
            step={1}
          />

          <Group grow align="flex-start">
            <div>
              <AppDateField
                label="Дата начала"
                value={startDate}
                onChange={(d) => {
                  setStartDate(d);
                  // если пользователь сдвинул начало после конца — подвинем конец
                  if (d && endDate && endDate.getTime() < d.getTime()) {
                    setEndDate(d);
                  }
                }}
                maxDate={endDate ?? undefined}
                required
              />
              <Text c="dimmed" fz="xs" mt={4}>
                Обязательно
              </Text>
            </div>

            <div>
              <AppDateField
                label="Дата окончания"
                value={endDate}
                onChange={setEndDate}
                minDate={startDate ?? undefined}
                required
              />
              <Text c="dimmed" fz="xs" mt={4}>
                Обязательно
              </Text>
            </div>
          </Group>

          <Select
            label="Статус"
            data={[
              { value: "inactive", label: "Изаначальный" },
              { value: "process", label: "В процессе" },
              { value: "complete", label: "Изучен" },
            ]}
            value={status}
            onChange={(v) => setStatus((v as any) ?? "inactive")}
            withAsterisk
            required
          />

          <Group justify="right" mt="sm">
            <Button variant="light" onClick={reset}>
              Сброс
            </Button>
            <Button onClick={onSubmit}>Добавить</Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
