import { Modal, TextInput, Button } from "@mantine/core";
import { Education } from "@/shared/types/types";
import { useState, useEffect } from "react";

type Props = {
  opened: boolean;
  onClose: () => void;
  value: Education;
  onSave: (data: Education) => void;
};

export const EducationModal = ({ opened, onClose, value, onSave }: Props) => {
  const [form, setForm] = useState(value);

  useEffect(() => {
    setForm(value);
  }, [value]);

  return (
    <Modal opened={opened} onClose={onClose} title="Образование" centered>
      <TextInput label="Направление" value={form.title} onChange={(e) => setForm({ ...form, title: e.currentTarget.value })} />
      <TextInput label="Учебное заведение" value={form.institution} onChange={(e) => setForm({ ...form, institution: e.currentTarget.value })} />
      <TextInput label="Год обучения" value={form.year} onChange={(e) => setForm({ ...form, year: e.currentTarget.value })} />
      <Button fullWidth mt="md" color="teal" onClick={() => onSave(form)}>Сохранить</Button>
    </Modal>
  );
};
