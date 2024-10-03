import { ExamWithQuestions } from "@examtraining/core";
import { createContext, useCallback, useState } from "react";
import { PermissionDenied, useExamIndirect } from "../hooks";

type Props = {
  children: React.ReactNode;
};

type Context = {
  slug: string | undefined;
  fetchSlug: (slug: string, { accessCode }: { accessCode?: string }) => void;
  exam: ExamWithQuestions | PermissionDenied | null | undefined;
  flush: () => void;
};

export const ExamContext = createContext<Context>(null as any);

export function ExamProvider({ children }: Props) {
  console.debug("Rendering context ExamProvider");

  const [slug, setSlug] = useState<string | undefined>(undefined);
  const [exam, setExam] = useState<
    ExamWithQuestions | PermissionDenied | null | undefined
  >(undefined);
  const getExam = useExamIndirect();

  const fetchSlug = useCallback(
    async (slug: string, { accessCode }: { accessCode?: string } = {}) => {
      setSlug(slug);
      setExam(undefined);
      getExam(slug, { accessCode })
        .then((exam) => {
          setExam(exam);
        })
        .catch((error) => {
          throw error;
        });
    },
    [getExam],
  );

  const flush = useCallback(() => {
    setSlug(undefined);
    setExam(undefined);
  }, []);

  return (
    <ExamContext.Provider value={{ slug, fetchSlug, exam, flush }}>
      {children}
    </ExamContext.Provider>
  );
}
