import { createContext, useContext, useState, ReactNode } from "react";

type Experience = { name: string; level: string };
type QuestionnaireData = {
  education: { institution: string; degree: string };
  experience: Experience[];
  about: string;
  skills: string[];
  orientation: string;
  goals: string;
};

type QuestionnaireContextType = {
  data: QuestionnaireData;
  updateData: (newData: Partial<QuestionnaireData>) => void;
  reset: () => void;
};

const defaultData: QuestionnaireData = {
  education: { institution: "", degree: "" },
  experience: [],
  about: "",
  skills: [],
  orientation: "",
  goals: "",
};

const QuestionnaireContext = createContext<QuestionnaireContextType | null>(null);

export const useQuestionnaire = () => {
  const context = useContext(QuestionnaireContext);
  if (!context) throw new Error("useQuestionnaire must be used within Provider");
  return context;
};

export const QuestionnaireProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<QuestionnaireData>(defaultData);

  const updateData = (newData: Partial<QuestionnaireData>) => {
    setData((prev) => ({ ...prev, ...newData }));
  };

  const reset = () => setData(defaultData);

  return (
    <QuestionnaireContext.Provider value={{ data, updateData, reset }}>
      {children}
    </QuestionnaireContext.Provider>
  );
};
