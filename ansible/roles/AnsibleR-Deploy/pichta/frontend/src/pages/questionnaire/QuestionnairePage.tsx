import { useState } from 'react';
import { Button, Card, Flex, Group, Text } from '@mantine/core';
import { IconCheck } from "@tabler/icons-react";


import EducationForm from './components/EducationForm';
import ExperienceForm from './components/ExperienceForm';
import SkillsForm from './components/SkillsForm';
import OrientationForm from './components/OrientationForm';
import GoalsForm from './components/GoalsForm';

import { QuestionnaireProvider } from "./context/QuestionnaireContext";
import SummaryModal from './components/SummaryModal';

const steps = [
  { label: 'Образование', component: EducationForm },
  { label: 'Опыт', component: ExperienceForm },
  { label: 'Навыки', component: SkillsForm },
  { label: 'Ориентация', component: OrientationForm },
  { label: 'Цели', component: GoalsForm },
];

export const QuestionnairePage = () => {
  const [step, setStep] = useState(0);
  const CurrentStep = steps[step].component;
  const [showSummary, setShowSummary] = useState(false);

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep((s) => s + 1);
    } else {
      setShowSummary(true);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep((s) => s - 1);
    }
  };

  return (
    <QuestionnaireProvider>
      <Flex className="questionnaire-wrapper">
        <SummaryModal opened={showSummary} onClose={() => setShowSummary(false)} />
        <Card className="questionnaire-card" withBorder>
        <div className="questionnaire-progress">
          {steps.map((s, i) => (
            <div key={s.label} className="progress-step-wrapper">
              {i > 0 && (
                <div
                  className={`progress-line ${i <= step ? 'filled' : ''}`}
                />
              )}

              <div
                className={`progress-step ${i < step ? 'completed' : i === step ? 'active' : ''}`}
                onClick={() => setStep(i)}
              >
                { i < step ? (
                  <IconCheck size={16} color="currentColor" />
                ) : (
                  <span>{i + 1}</span>
                ) }
              </div>

              <Text size="xs" className="progress-label">
                {s.label}
              </Text>
            </div>
          ))}
        </div>


          <div className="questionnaire-body">
            <CurrentStep />
          </div>

          <div className="questionnaire-footer">
            <Button onClick={handleBack} disabled={step === 0} variant="default">
              Назад
            </Button>
            <Button onClick={handleNext} color="teal">
              {step === steps.length - 1 ? 'Завершить' : 'Далее'}
            </Button>
          </div>
        </Card>
      </Flex>
    </QuestionnaireProvider>
  );
};
