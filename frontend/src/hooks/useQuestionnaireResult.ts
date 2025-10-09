import { useMemo } from 'react';
import Cookies from 'js-cookie';

export const useQuestionnaireResult = () => {
  return useMemo(() => {
    const raw = Cookies.get('questionnaireResult');
    if (!raw) return null;

    try {
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }, []);
};
