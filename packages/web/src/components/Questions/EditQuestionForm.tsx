import { AddId, Answer, Question } from "@examtraining/core";
import { FormEvent, useCallback, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import short from "short-uuid";
import {
  Answer as AnswerField,
  Category,
  Description,
  Explanation,
} from "./Fields";

type Props = {
  question: Question;
  onCancel: () => void;
  onSubmit: (question: Partial<Question>) => void;
  disabled?: boolean;
  categories: string[];
};

export function EditQuestionForm({
  question,
  onCancel,
  categories,
  onSubmit,
  disabled = false,
}: Props) {
  console.debug("Rendering component EditQuestionForm");

  const [answers, setAnswers] = useState<Answer[]>(question.answers || []);
  const lastAnswer = useRef<HTMLInputElement>();

  const editQuestion = useCallback(
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

  return (
    <form onSubmit={editQuestion}>
      <article>
        <h3>Edit question</h3>
        <fieldset>
          <Description
            defaultValue={question.description}
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
            <label>Answers</label>
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
          <Explanation defaultValue={question.explanation} />
          <Category options={categories} defaultValue={question.categories} />
        </fieldset>
        <footer>
          <fieldset className="grid">
            <button type="button" className="secondary" onClick={onCancel}>
              Cancel
            </button>
            <button
              disabled={disabled}
              aria-busy={disabled ? "true" : "false"}
              type="submit"
            >
              💾 Update question
            </button>
          </fieldset>
        </footer>
      </article>
    </form>
  );
}
