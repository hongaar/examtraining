import { ExamWithQuestions } from "@examtraining/core";
import { useCallback } from "react";
import { useLocalStorage } from "usehooks-ts";

const MAX_RECENT_EXAMS = 5;

export function useRecentExams() {
  const [recentExams, setRecentExams] = useLocalStorage<string[]>(
    "recentExams",
    [],
  );

  const addRecentExam = useCallback(
    (exam: ExamWithQuestions) => {
      const newRecentExams = [
        exam.id,
        ...recentExams.filter((recentExam) => recentExam !== exam.id),
      ];

      if (newRecentExams.length > MAX_RECENT_EXAMS) {
        newRecentExams.pop();
      }

      setRecentExams(newRecentExams);
    },
    [recentExams, setRecentExams],
  );

  return { recentExams, addRecentExam };
}
