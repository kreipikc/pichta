import { Card, Progress } from "@mantine/core";
import { useQuestionnaireResult } from "@/hooks/useQuestionnaireResult";

export default function SkillsSection() {
  const questionnaire = useQuestionnaireResult();
  const skills = (questionnaire?.skills || []).map((name: string) => ({
    name,
    level: 100,
  }));

  return (
    <Card withBorder className="skills-card">
      <h2 className="section-title">Навыки и компетенции</h2>
      <div className="skills-grid">
        {skills.map((skill: { name: string; level: number }) => (
          <div key={skill.name} className="skill-item">
            <div className="skill-header">
              <span className="skill-name">{skill.name}</span>
              <span className="skill-level">{skill.level}%</span>
            </div>
            <Progress value={skill.level} size="sm" color="teal" radius="xl" />
          </div>
        ))}
      </div>
    </Card>
  );
}
