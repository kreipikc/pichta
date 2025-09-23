import { Modal, TextInput, Button, Autocomplete, Select } from "@mantine/core";
import { Experience } from "@/shared/types/types";
import { useState, useEffect } from "react";

const LEVELS = ["Intern", "Junior", "Middle", "Senior", "Lead"];
const PROFESSIONS = [
  "Frontend Developer", "Backend Developer", "Fullstack Developer",
  "DevOps Engineer", "QA Engineer", "Data Scientist", "UI/UX Designer",
  "Project Manager", "Mobile Developer", "Business Analyst",
];

type Props = {
  opened: boolean;
  onClose: () => void;
  value: Experience;
  onSave: (data: Experience) => void;
};

export const ExperienceModal = ({ opened, onClose, value, onSave }: Props) => {
  const [form, setForm] = useState(value);

  useEffect(() => {
    setForm(value);
  }, [value]);

  return (
    <Modal opened={opened} onClose={onClose} title="Опыт работы" centered>
      <Autocomplete label="Профессия" data={PROFESSIONS} value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
      <Select label="Уровень" data={LEVELS} value={form.company} onChange={(v) => setForm({ ...form, company: v || "" })} />
      <TextInput label="Период" value={form.period} onChange={(e) => setForm({ ...form, period: e.currentTarget.value })} />
      <Button fullWidth mt="md" color="teal" onClick={() => onSave(form)}>Сохранить</Button>
    </Modal>
  );
};
