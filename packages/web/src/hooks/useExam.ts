import { ExamWithQuestions } from "@examtraining/core";
import { useCallback, useMemo, useState } from "react";
import { Functions, parseDoc } from "../api";
import { useFunction } from "./useFunction";

export class PermissionDenied extends Error {}

export function useExamDirect(
  slug: string,
  { accessCode, editCode }: { accessCode?: string; editCode?: string } = {},
) {
  const [exam, setExam] = useState<
    ExamWithQuestions | PermissionDenied | null | undefined
  >(undefined);
  const getExam = useExamIndirect();

  const reload = useMemo(() => {
    function load() {
      setExam(undefined);
      getExam(slug, { accessCode, editCode })
        .then((exam) => {
          setExam(exam);
        })
        .catch((error) => {
          throw error;
        });
    }

    load();

    return load;
  }, [accessCode, editCode, getExam, slug]);

  return { exam, reload };
}

export function useExamIndirect() {
  const getExamFn = useFunction(Functions.GetExam);

  return useCallback(
    async (
      slug: string,
      { accessCode, editCode }: { accessCode?: string; editCode?: string } = {},
    ) => {
      return getExamFn({ slug, accessCode, editCode })
        .then((exam) => {
          return parseDoc(exam);
        })
        .catch((error) => {
          if (
            typeof error === "object" &&
            error.code === "functions/permission-denied"
          ) {
            return new PermissionDenied();
          } else {
            throw error;
          }
        });
    },
    [getExamFn],
  );
}
