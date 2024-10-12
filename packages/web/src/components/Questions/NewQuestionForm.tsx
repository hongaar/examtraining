import { AddId, Answer, ExamWithQuestions, Question } from "@examtraining/core";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import short from "short-uuid";
import { useLocalStorage } from "usehooks-ts";
import { Functions } from "../../api";
import { useEditCode, useFunction, useLogEvent } from "../../hooks";
import { Loading } from "../Loading";
import {
  Answer as AnswerField,
  Category,
  Description,
  Explanation,
} from "./Fields";

type Props = {
  exam: ExamWithQuestions;
  onSubmit: (question: Partial<Question>) => Promise<void>;
  disabled?: boolean;
  categories: string[];
  suggestBasedOnQuestion?: string | null;
  suggestBasedOnSubject?: string | null;
  resetSuggestions: () => void;
};

export function NewQuestionForm({
  exam,
  onSubmit,
  categories,
  disabled = false,
  suggestBasedOnQuestion,
  suggestBasedOnSubject,
  resetSuggestions,
}: Props) {
  console.debug("Rendering component NewQuestionForm");

  const slug = exam.id;
  const [answers, setAnswers] = useState<Answer[]>([]);
  const lastAnswer = useRef<HTMLInputElement>();
  const editCode = useEditCode()!;
  const suggestExamQuestion = useFunction(Functions.SuggestExamQuestion);
  const [suggestedQuestionsHistory, setSuggestedQuestionsHistory] =
    useLocalStorage<string[]>("suggestedQuestions", []);
  const logEvent = useLogEvent();
  const [suggestion, setSuggestion] = useState<{
    time: number;
    question: Partial<Question>;
  } | null>(null);
  const [busy, setBusy] = useState(false);

  const addQuestion = useCallback(
    async function (event: FormEvent<HTMLFormElement>) {
      event.preventDefault();

      const data = new FormData(event.target as any);

      if (answers.length < 2) {
        toast.error("Please add at least two answers.");
        return;
      }

      if (answers.filter((a) => a.correct).length === 0) {
        toast.error("Please select a correct answer.");
        return;
      }

      await onSubmit({
        description: (data.get("description") as string).trim(),
        explanation: (data.get("explanation") as string).trim(),
        answers: answers as AddId<Answer>[],
        categories: data.getAll("categories").filter(Boolean) as string[],
      });

      setSuggestedQuestionsHistory([]);
    },
    [answers, onSubmit, setSuggestedQuestionsHistory],
  );

  const suggestQuestion = useCallback(
    async ({
      questionId,
      subject,
    }: {
      questionId?: string;
      subject?: string;
    } = {}) => {
      setBusy(true);

      const suggestion = (
        await suggestExamQuestion({
          slug,
          editCode,
          questionId,
          subject,
          history: suggestedQuestionsHistory,
        })
      ).question;

      setSuggestedQuestionsHistory((prev) => [...prev, suggestion.description]);

      logEvent("suggest_question", {
        slug,
      });

      setSuggestion({
        time: Date.now(),
        question: {
          ...suggestion,
          answers: [],
        },
      });
      setAnswers(
        suggestion.answers.map((answer, index) => ({
          ...answer,
          id: short.generate(),
          order: index,
        })),
      );
      setBusy(false);
    },
    [
      editCode,
      logEvent,
      setSuggestedQuestionsHistory,
      slug,
      suggestExamQuestion,
      suggestedQuestionsHistory,
    ],
  );

  useEffect(() => {
    if (suggestBasedOnQuestion) {
      suggestQuestion({ questionId: suggestBasedOnQuestion });
    } else if (suggestBasedOnSubject) {
      suggestQuestion({ subject: suggestBasedOnSubject });
    }
    // adding suggestQuestion leads to infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestBasedOnQuestion, suggestBasedOnSubject]);

  return (
    <form onSubmit={addQuestion}>
      <article>
        <section className="grid">
          <h3 style={{ marginBottom: 0 }}>Add new question</h3>
          {busy || suggestBasedOnQuestion || suggestBasedOnSubject ? null : (
            <div className="align-right">
              <button
                className="inline outline secondary s-full-width"
                type="button"
                onClick={() => suggestQuestion()}
                disabled={busy}
                aria-busy={busy ? "true" : "false"}
                data-tooltip={
                  busy
                    ? undefined
                    : "Based on the exam description and current questions"
                }
              >
                ✨ Generate question
              </button>
            </div>
          )}
        </section>
        {busy ? (
          <Loading delay={0}>Loading suggestion...</Loading>
        ) : (
          <>
            {suggestBasedOnQuestion || suggestBasedOnSubject ? (
              <article>
                <section>
                  This question is generated based on the{" "}
                  {suggestBasedOnQuestion ? (
                    <>
                      question{" "}
                      <b>
                        {
                          exam.questions.find(
                            (q) => q.id === suggestBasedOnQuestion,
                          )?.description
                        }
                      </b>
                    </>
                  ) : (
                    <>
                      subject <b>{suggestBasedOnSubject}</b>.
                    </>
                  )}
                </section>
                <button
                  className="inline outline"
                  type="button"
                  onClick={() =>
                    suggestQuestion({
                      questionId: suggestBasedOnQuestion || undefined,
                      subject: suggestBasedOnSubject || undefined,
                    })
                  }
                >
                  ✨ Generate another
                </button>{" "}
                <button
                  className="inline outline secondary"
                  type="button"
                  onClick={() => resetSuggestions()}
                >
                  Reset
                </button>
              </article>
            ) : null}
            <fieldset key={suggestion?.time}>
              <Description
                defaultValue={suggestion?.question.description}
                addAnswers={(answers) => {
                  setAnswers((prev) => [
                    ...prev,
                    ...answers.map((answer, index) => ({
                      id: short.generate(),
                      order: answers.length + index,
                      description: answer,
                      correct: false,
                    })),
                  ]);
                }}
              />
              <div className="answers-inputs">
                <label>
                  Answers
                  <br />
                  <small>⤵️ Flip switch to mark as the correct answer</small>
                </label>
                {answers.map((answer, index) => (
                  <AnswerField
                    key={index}
                    inputRef={
                      index === answers.length - 1 ? lastAnswer : undefined
                    }
                    answer={answer}
                    onChange={(answer) => {
                      setAnswers(
                        answers.map((a, i) =>
                          i === index ? { ...a, description: answer } : a,
                        ),
                      );
                    }}
                    onCorrect={() => {
                      setAnswers(
                        answers.map((a, i) =>
                          i === index
                            ? { ...a, correct: true }
                            : { ...a, correct: false },
                        ),
                      );
                    }}
                    onRemove={() => {
                      setAnswers(
                        answers.filter(
                          (a) => a.description !== answer.description,
                        ),
                      );
                    }}
                    withRemove
                  />
                ))}
                <AnswerField
                  onChange={(answer) => {
                    setAnswers((prev) => [
                      ...prev,
                      {
                        id: short.generate(),
                        order: answers.length + 1,
                        description: answer,
                        correct: false,
                      },
                    ]);
                    setTimeout(() => {
                      lastAnswer.current?.focus();
                    });
                  }}
                />
              </div>
              <Explanation defaultValue={suggestion?.question.explanation} />
              <Category
                options={categories}
                defaultValue={suggestion?.question.categories}
              />
            </fieldset>
          </>
        )}
        <footer>
          <fieldset className="grid">
            {suggestBasedOnQuestion || suggestBasedOnSubject ? (
              <button
                disabled={disabled || busy}
                className="secondary"
                type="button"
                onClick={() => resetSuggestions()}
              >
                Stop auto-generating
              </button>
            ) : null}
            <button
              disabled={disabled || busy}
              aria-busy={disabled ? "true" : "false"}
              type="submit"
            >
              💾 Create question
              {suggestBasedOnQuestion || suggestBasedOnSubject
                ? " and generate another"
                : ""}
            </button>
          </fieldset>
        </footer>
      </article>
    </form>
  );
}
