import { AddId, Answer, QuestionWithAnswers } from "@examtraining/core";
import { FormEvent, useCallback, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { Answer as AnswerField, Description } from "./Fields";

const DUMMY_DATA = true;

type Props = {
  onSubmit: (question: Partial<QuestionWithAnswers>) => void;
  disabled?: boolean;
};

export function NewQuestionForm({ onSubmit, disabled = false }: Props) {
  console.debug("Rendering component NewQuestionForm");

  const [answers, setAnswers] = useState<Answer[]>([]);
  const lastAnswer = useRef<HTMLInputElement>();

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
        description: data.get("description") as string,
        explanation: "",
        answers: answers as AddId<Answer>[],
      });
    },
    [answers, onSubmit],
  );

  return (
    <form onSubmit={addQuestion}>
      <article>
        <h3>Add new question</h3>
        <fieldset>
          <Description
            defaultValue={DUMMY_DATA ? "Dit is een test" : undefined}
          />
          <label>Answers</label>
          <p>
            <small>⤵️ Flip switch to mark as the correct answer</small>
          </p>
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
        </fieldset>
        <footer>
          <fieldset className="grid">
            <button
              disabled={disabled}
              aria-busy={disabled ? "true" : "false"}
              type="submit"
            >
              Create question
            </button>
          </fieldset>
        </footer>
      </article>
    </form>
  );
}
