import { ExamWithQuestions } from "@examtraining/core";
import { useCallback } from "react";
import { useSessionStorage } from "usehooks-ts";

const MAX_RECENT_EXAMS = 5;

export function useRecentExams() {
  const [recentExams, setRecentExams] = useSessionStorage<ExamWithQuestions[]>(
    "recentExams",
    [],
  );

  const addRecentExam = useCallback(
    (exam: ExamWithQuestions) => {
      const newRecentExams = [
        exam,
        ...recentExams.filter((recentExam) => recentExam.id !== exam.id),
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
