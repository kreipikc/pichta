import { useState, useEffect } from "react";
import Cookies from "js-cookie";

export type Education = { title: string; institution: string; year: string };
export type Experience = { title: string; company: string; period: string };

const LEVEL_ORDER: Record<string, number> = {
  Intern: 0,
  Junior: 1,
  Middle: 2,
  Senior: 3,
  Lead: 4,
};

export const useUserProfileStore = () => {
  const [education, setEducation] = useState<Education[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);

  useEffect(() => {
    const stored = Cookies.get("questionnaireResult");
    if (stored) {
      const parsed = JSON.parse(stored);

      // Load education
      if (Array.isArray(parsed.education)) {
        const parsedEducation: Education[] = parsed.education.map((e: any) => ({
          title: e.degree || "",
          institution: e.institution || "",
          year: "—",
        }));
        setEducation(parsedEducation);
      } else if (parsed.education) {
        setEducation([
          {
            title: parsed.education.degree || "",
            institution: parsed.education.institution || "",
            year: "—",
          },
        ]);
      }

      // Load experience
      if (Array.isArray(parsed.experience)) {
        const parsedExperience: Experience[] = parsed.experience.map((e: any) => ({
          title: e.name || "",
          company: e.level || "",
          period: "—",
        }));
        setExperience(parsedExperience);
      }
    }
  }, []);

  const syncToCookies = (newEducation: Education[], newExperience: Experience[]) => {
    const formattedEducation = newEducation.map((e: Education) => ({
      degree: e.title,
      institution: e.institution,
      year: e.year,
    }));

    const formattedExperience = newExperience.map((e: Experience) => ({
      name: e.title,
      level: e.company,
      period: e.period,
    }));

    const stored = Cookies.get("questionnaireResult");
    const current = stored ? JSON.parse(stored) : {};
    const updated = {
      ...current,
      education: formattedEducation,
      experience: formattedExperience,
    };

    Cookies.set("questionnaireResult", JSON.stringify(updated), { expires: 30 });

    // mock_position
    if (formattedExperience.length > 0) {
      const sorted = [...formattedExperience].sort(
        (a, b) => (LEVEL_ORDER[b.level] || 0) - (LEVEL_ORDER[a.level] || 0)
      );
      const top = sorted[0];
      const mock = `${top.level} ${top.name}`;
      Cookies.set("mock_position", mock, { expires: 30 });
    } else {
      Cookies.remove("mock_position");
    }
  };

  return {
    education,
    experience,

    addEducation: (item: Education) => {
      const updated = [...education, item];
      setEducation(updated);
      syncToCookies(updated, experience);
    },

    updateEducation: (index: number, item: Education) => {
      const updated = [...education];
      updated[index] = item;
      setEducation(updated);
      syncToCookies(updated, experience);
    },

    removeEducation: (index: number) => {
      const updated = education.filter((_, i) => i !== index);
      setEducation(updated);
      syncToCookies(updated, experience);
    },

    addExperience: (item: Experience) => {
      const updated = [...experience, item];
      setExperience(updated);
      syncToCookies(education, updated);
    },

    updateExperience: (index: number, item: Experience) => {
      const updated = [...experience];
      updated[index] = item;
      setExperience(updated);
      syncToCookies(education, updated);
    },

    removeExperience: (index: number) => {
      const updated = experience.filter((_, i) => i !== index);
      setExperience(updated);
      syncToCookies(education, updated);
    },
  };
};
