import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

type EduItem = {
  institution: string;   // direction на бэке
  degree: string;        // type на бэке
  start?: string | null; // ISO (NOT NULL на бэке - гарантируем при отправке)
  end?: string | null;   // ISO | null
};

type Level = 'Intern' | 'Junior' | 'Middle' | 'Senior' | 'Lead';
type ExpItem = {
  name: string;
  level: Level;
  description?: string | null;
  start?: string | null; // ISO (NOT NULL на бэке - гарантируем при отправке)
  end?: string | null;   // ISO | null
};

export type QuestionnaireData = {
  // ранее существовавшие поля
  about?: string;
  orientation?: string;
  skills: string[];
  goals: string; // "id1||id2"

  // добавили поддержу множественных списков
  educationList: EduItem[];
  experienceList: ExpItem[];

  // для совместимости со старой формой (не используем напрямую)
  education?: { institution?: string; degree?: string };
  experience?: any[];
};

type Ctx = {
  data: QuestionnaireData;
  updateData: (patch: Partial<QuestionnaireData>) => void;
  reset: () => void;
};

const QuestionnaireContext = createContext<Ctx>({} as Ctx);

const initialState: QuestionnaireData = {
  about: '',
  orientation: '',
  skills: [],
  goals: '',
  educationList: [],
  experienceList: [],
  education: { institution: '', degree: '' },
  experience: [],
};

export function QuestionnaireProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<QuestionnaireData>(initialState);

  const updateData = (patch: Partial<QuestionnaireData>) =>
    setData((prev) => ({ ...prev, ...patch }));

  const reset = () => setData(initialState);

  const value = useMemo(() => ({ data, updateData, reset }), [data]);

  return (
    <QuestionnaireContext.Provider value={value}>
      {children}
    </QuestionnaireContext.Provider>
  );
}

export function useQuestionnaire() {
  return useContext(QuestionnaireContext);
}
