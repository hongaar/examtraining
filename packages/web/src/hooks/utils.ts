import { AddId, QuestionWithAnswers } from "@examtraining/core";
import { useCallback, useEffect } from "react";
import { useSessionStorage } from "usehooks-ts";
import { useSearch } from "wouter";

export function useSearchParams() {
  const searchString = useSearch();

  return new URLSearchParams(searchString);
}

export function useSearchParam(param: string) {
  const params = useSearchParams();

  return params.get(param) || undefined;
}

export function useAccessCode() {
  const [accessCode, setAccessCode] = useSessionStorage<string | undefined>(
    "accessCode",
    undefined,
  );
  const accessCodeFromSearchParams = useSearchParam("accessCode");

  useEffect(() => {
    if (accessCodeFromSearchParams) {
      setAccessCode(accessCodeFromSearchParams);
    }
  }, [accessCodeFromSearchParams, setAccessCode]);

  return accessCodeFromSearchParams || accessCode;
}

export function useEditCode() {
  const [editCode, setEditCode] = useSessionStorage<string | undefined>(
    "editCode",
    undefined,
  );
  const editCodeFromSearchParams = useSearchParam("editCode");

  useEffect(() => {
    if (editCodeFromSearchParams) {
      setEditCode(editCodeFromSearchParams);
    }
  }, [editCodeFromSearchParams, setEditCode]);

  return editCodeFromSearchParams || editCode;
}

type TrainingData = {
  [key: string]: {
    current: number;
    questions: AddId<QuestionWithAnswers>[];
    answers: { [questionId: string]: string };
  };
};

export function useTraining(slug: string) {
  const [map, setMap] = useSessionStorage<TrainingData>(
    "trainingQuestions",
    {},
  );

  const setCurrent = useCallback(
    (current: number) => {
      setMap((map) => ({
        ...map,
        [slug]: {
          ...map[slug],
          current,
        },
      }));
    },
    [setMap, slug],
  );

  const setTrainingQuestions = useCallback(
    (questions: AddId<QuestionWithAnswers>[]) => {
      setMap((map) => ({
        ...map,
        [slug]: {
          current: 0,
          questions,
          answers: {},
        },
      }));
    },
    [setMap, slug],
  );

  const setAnswer = useCallback(
    (questionId: string, answerId: string) => {
      setMap((map) => ({
        ...map,
        [slug]: {
          ...map[slug],
          answers: {
            ...map[slug].answers,
            [questionId]: answerId,
          },
        },
      }));
    },
    [setMap, slug],
  );

  return {
    current: map[slug]?.current,
    setCurrent,
    trainingQuestions: map[slug]?.questions || [],
    setTrainingQuestions,
    answers: map[slug]?.answers || {},
    setAnswer,
  };
}
