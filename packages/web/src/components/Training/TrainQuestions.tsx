import { ExamWithQuestions } from "@examtraining/core";
import { useEffect, useRef, useState } from "react";
import { useTraining } from "../../hooks";
import { Results } from "./Results";

type Props = {
  exam: ExamWithQuestions;
};

export function TrainQuestions({ exam }: Props) {
  console.debug("Rendering component TrainQuestions");

  const { trainingQuestions, current, setCurrent, answers, setAnswer } =
    useTraining(exam.id);
  const [showSplash, setShowSplash] = useState(false);
  const firstAnswerRef = useRef();

  useEffect(() => {
    if (firstAnswerRef.current) {
      (firstAnswerRef.current as any).focus();
    }
  });

  const question = trainingQuestions[current];

  if (showSplash) {
    return (
      <article>
        <p>That was the last question.</p>
        <button type="button" onClick={() => setShowSplash(false)}>
          📊 Show results
        </button>
      </article>
    );
  }

  if (!question) {
    return <Results exam={exam} />;
  }

  return (
    <form
      className="training"
      onSubmit={(event) => {
        event.preventDefault();

        const form = event.target as HTMLFormElement;
        const formData = new FormData(form);
        const answerId = formData.get("answer") as string;

        setAnswer(question.id, answerId);
        setCurrent(current + 1);

        if (current + 1 === trainingQuestions.length) {
          setShowSplash(true);
        }
      }}
    >
      <article>
        <p>{question.description}</p>
        <ul>
          {question.answers.map((answer, index) => (
            <li key={answer.id}>
              <label>
                <input
                  ref={index === 0 ? (firstAnswerRef as any) : undefined}
                  type="radio"
                  name="answer"
                  value={answer.id}
                  required
                  defaultChecked={answers[question.id] === answer.id}
                />
                {answer.description}
              </label>
            </li>
          ))}
        </ul>
        <footer>
          <fieldset className="grid">
            {current > 0 ? (
              <>
                <button
                  type="button"
                  className="secondary"
                  onClick={() => setCurrent(current - 1)}
                >
                  Previous
                </button>{" "}
              </>
            ) : null}
            <button type="submit">Next</button>
          </fieldset>
        </footer>
      </article>
    </form>
  );
}
