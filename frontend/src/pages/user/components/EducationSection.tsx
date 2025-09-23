import { useState } from "react";
import { Card, Button, Group, Paper } from "@mantine/core";
import { IconPlus, IconPencil, IconTrash } from "@tabler/icons-react";
import { useUserProfileStore } from "@/hooks/useUserProfileStore";
import { EducationModal } from "./components/EducationModal";
import { ExperienceModal } from "./components/ExperienceModal";

type Education = { title: string; institution: string; year: string };
type Experience = { title: string; company: string; period: string };

export default function EducationSection() {
  const {
    education,
    experience,
    addEducation,
    updateEducation,
    removeEducation,
    addExperience,
    updateExperience,
    removeExperience,
  } = useUserProfileStore();

  const [eduModalOpen, setEduModalOpen] = useState(false);
  const [expModalOpen, setExpModalOpen] = useState(false);
  const [eduEditing, setEduEditing] = useState<Education | null>(null);
  const [eduIndex, setEduIndex] = useState<number | null>(null);
  const [expEditing, setExpEditing] = useState<Experience | null>(null);
  const [expIndex, setExpIndex] = useState<number | null>(null);

  const handleEducationSave = (data: Education) => {
    if (eduIndex !== null) updateEducation(eduIndex, data);
    else addEducation(data);
    setEduModalOpen(false);
    setEduIndex(null);
  };

  const handleExperienceSave = (data: Experience) => {
    if (expIndex !== null) updateExperience(expIndex, data);
    else addExperience(data);
    setExpModalOpen(false);
    setExpIndex(null);
  };

  return (
    <>
      <EducationModal
        opened={eduModalOpen}
        onClose={() => setEduModalOpen(false)}
        value={eduEditing || { title: "", institution: "", year: "" }}
        onSave={handleEducationSave}
      />

      <ExperienceModal
        opened={expModalOpen}
        onClose={() => setExpModalOpen(false)}
        value={expEditing || { title: "", company: "", period: "" }}
        onSave={handleExperienceSave}
      />

      <Card withBorder className="education-card">
        <h2 className="section-title">Образование и опыт работы</h2>

        <div className="education-actions">
          <Button
            leftSection={<IconPlus size={14} />}
            color="teal"
            variant="outline"
            onClick={() => {
              setEduEditing(null);
              setEduIndex(null);
              setEduModalOpen(true);
            }}
          >
            Добавить образование
          </Button>

          <Button
            leftSection={<IconPlus size={14} />}
            color="teal"
            onClick={() => {
              setExpEditing(null);
              setExpIndex(null);
              setExpModalOpen(true);
            }}
          >
            Добавить опыт работы
          </Button>
        </div>

        <div className="education-list">
          <h3 className="education-subtitle">Образование</h3>
          {education.map((item, index) => (
            <Paper key={index} withBorder className="education-item">
              <div>
                <div className="item-title">{item.title}</div>
                <div className="item-sub">{item.institution} — {item.year}</div>
              </div>
              <Group gap="xs">
                <Button
                  variant="subtle"
                  onClick={() => {
                    setEduEditing(item);
                    setEduIndex(index);
                    setEduModalOpen(true);
                  }}
                >
                  <IconPencil size={16}  color="teal"/>
                </Button>
                <Button
                  variant="subtle"
                  color="red"
                  onClick={() => removeEducation(index)}
                >
                  <IconTrash size={16} />
                </Button>
              </Group>
            </Paper>
          ))}
        </div>

        <div className="education-list">
          <h3 className="education-subtitle">Опыт работы</h3>
          {experience.map((item, index) => (
            <Paper key={index} withBorder className="education-item">
              <div>
                <div className="item-title">{item.title}</div>
                <div className="item-sub">{item.company} — {item.period}</div>
              </div>
              <Group gap="xs">
                <Button
                  variant="subtle"
                  onClick={() => {
                    setExpEditing(item);
                    setExpIndex(index);
                    setExpModalOpen(true);
                  }}
                >
                  <IconPencil size={16}  color="teal"/>
                </Button>
                <Button
                  variant="subtle"
                  color="red"
                  onClick={() => removeExperience(index)}
                >
                  <IconTrash size={16} />
                </Button>
              </Group>
            </Paper>
          ))}
        </div>
      </Card>
    </>
  );
}
