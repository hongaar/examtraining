import { ExamWithQuestions } from "@examtraining/core";
import { useMemo, useState } from "react";
import { Functions, parseDoc } from "../api";
import { useFunction } from "./useFunction";

export class PermissionDenied extends Error {}

export function useExam(
  slug: string,
  { accessCode, editCode }: { accessCode?: string; editCode?: string } = {},
) {
  const [exam, setExam] = useState<
    ExamWithQuestions | PermissionDenied | null | undefined
  >(undefined);
  const getExam = useFunction(Functions.GetExam);

  const reload = useMemo(() => {
    function load() {
      setExam(undefined);
      getExam({ slug, accessCode, editCode })
        .then((exam) => {
          setExam(parseDoc(exam));
        })
        .catch((error) => {
          if (
            typeof error === "object" &&
            error.code === "functions/permission-denied"
          ) {
            setExam(new PermissionDenied());
          } else {
            throw error;
          }
        });
    }

    load();

    return load;
  }, [accessCode, editCode, getExam, slug]);

  return { exam, reload };
}
