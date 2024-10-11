import { AddId, Answer, Question } from "@examtraining/core";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import short from "short-uuid";
import { Functions } from "../../api";
import { useEditCode, useFunction, useLogEvent } from "../../hooks";
import {
  Answer as AnswerField,
  Category,
  Description,
  Explanation,
} from "./Fields";

type Props = {
  slug: string;
  onSubmit: (question: Partial<Question>) => void;
  disabled?: boolean;
  categories: string[];
  suggestBasedOnQuestion?: string | null;
  suggestBasedOnSubject?: string | null;
};

export function NewQuestionForm({
  slug,
  onSubmit,
  categories,
  disabled = false,
  suggestBasedOnQuestion,
  suggestBasedOnSubject,
}: Props) {
  console.debug("Rendering component NewQuestionForm");

  const [answers, setAnswers] = useState<Answer[]>([]);
  const lastAnswer = useRef<HTMLInputElement>();
  const editCode = useEditCode()!;
  const suggestExamQuestion = useFunction(Functions.SuggestExamQuestion);
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

      onSubmit({
        description: (data.get("description") as string).trim(),
        explanation: (data.get("explanation") as string).trim(),
        answers: answers as AddId<Answer>[],
        categories: data.getAll("categories").filter(Boolean) as string[],
      });
    },
    [answers, onSubmit],
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
        })
      ).question;

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
    [editCode, logEvent, slug, suggestExamQuestion],
  );

  useEffect(() => {
    if (suggestBasedOnQuestion) {
      suggestQuestion({ questionId: suggestBasedOnQuestion });
    } else if (suggestBasedOnSubject) {
      suggestQuestion({ subject: suggestBasedOnSubject });
    }
  }, [suggestBasedOnQuestion, suggestBasedOnSubject, suggestQuestion]);

  return (
    <form onSubmit={addQuestion}>
      <article>
        <button
          className="inline outline secondary float-right"
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
          ✨ Generate question with ChatGPT
        </button>
        <h3>Add new question</h3>
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
                inputRef={index === answers.length - 1 ? lastAnswer : undefined}
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
                    answers.filter((a) => a.description !== answer.description),
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
        <footer>
          <fieldset className="grid">
            <button
              disabled={disabled}
              aria-busy={disabled ? "true" : "false"}
              type="submit"
            >
              💾 Create question
            </button>
          </fieldset>
        </footer>
      </article>
    </form>
  );
}
