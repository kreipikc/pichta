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

type Props = {
  opened: boolean;
  onClose: () => void;
};

export default function AddSkillModal({ opened, onClose }: Props) {
  const { data: allSkills, isLoading: isSkillsLoading } = useGetAllSkillsQuery();
  const [addSkill, { isLoading: isSaving }] = useAddSkillMutation();

  const skillOptions = useMemo(() => {
    const seen = new Set<string>();
    return (allSkills ?? [])
      .map((s: any) => {
        const idRaw = s?.id ?? s?.id_skill ?? s?.skill_id ?? null;
        if (idRaw == null) return null;
        const value = String(idRaw);
        const label =
          (typeof s?.name === "string" && s.name) ||
          (typeof s?.title === "string" && s.title) ||
          `#${value}`;
        return { value, label };
      })
      .filter(
        (opt): opt is { value: string; label: string } =>
          !!opt && typeof opt.value === "string" && opt.value.length > 0
      )
      .filter((opt) => {
        if (seen.has(opt.value)) return false;
        seen.add(opt.value);
        return true;
      });
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

  useEffect(() => {
    if (!opened) {
      setSkillId(null);
      setProficiency(0);
      setPriority(1);
      setStartDate(null);
      setStatus("");
    }
  }, [opened]);

  const canSave =
    !!skillId &&
    Number.isFinite(proficiency) &&
    proficiency >= 0 &&
    proficiency <= 100 &&
    Number.isFinite(priority) &&
    priority >= 1 &&
    priority <= 3 &&
    status.trim().length > 0;

  const handleSave = async () => {
    if (!canSave) return;

    const payload = [
      {
        id_skill: Number(skillId),
        proficiency: Number(proficiency),
        priority: Number(priority),
        status: status.trim(),
        ...(startDate ? { start_date: startDate.toISOString() } : {}),
      },
    ];

    await addSkill(payload as any).unwrap();

    toast.success("Успешно добавлено");
    onClose();
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Добавить навык" centered>
      <LoadingOverlay visible={isSkillsLoading || isSaving} />
      <Stack gap="md">
        <Select
          label="Навык"
          placeholder={isSkillsLoading ? "Загрузка..." : "Выберите навык"}
          data={skillOptions}
          searchable
          clearable
          nothingFoundMessage={isSkillsLoading ? "Загрузка..." : "Не найдено"}
          value={skillId}
          onChange={setSkillId}
          required
          key={`skills-${skillOptions.length}`}
        />

        <NumberInput
          label="Proficiency"
          min={0}
          max={100}
          value={proficiency}
          onChange={handleProficiencyChange}
          required
        />

        <NumberInput
          label="Priority"
          min={1}
          max={3}
          value={priority}
          onChange={handlePriorityChange}
          required
        />

        {/* ⬇⬇⬇ наш унифицированный пикер даты */}
        <AppDateField
          kind="date"
          label="Start date"
          value={startDate}
          onChange={setStartDate}
          placeholder="Не указано"
          clearable
          dropdownWidth={300}
        />

        <TextInput
          label="Status"
          placeholder="например: active / planned / paused"
          value={status}
          onChange={(e) => setStatus(e.currentTarget.value)}
          required
        />

        <Group justify="flex-end" mt="sm">
          <Button variant="default" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={handleSave} disabled={!canSave} loading={isSaving}>
            Добавить
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
