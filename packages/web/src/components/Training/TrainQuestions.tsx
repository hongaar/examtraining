import { ExamWithQuestions } from "@examtraining/core";
import { useEffect, useRef, useState } from "react";
import nl2br from "react-nl2br";
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

  if (!showSplash && !question) {
    return <Results exam={exam} />;
  }

  return (
    <>
      <progress value={current} max={trainingQuestions.length} />
      {showSplash ? (
        <>
          <article>
            <p>That was the last question.</p>
            <footer>
              <fieldset className="grid">
                <button type="button" onClick={() => setShowSplash(false)}>
                  📊 Show results
                </button>{" "}
                <button
                  type="button"
                  className="secondary"
                  onClick={() => {
                    setShowSplash(false);
                    setCurrent(current - 1);
                  }}
                >
                  Previous
                </button>
              </fieldset>
            </footer>
          </article>
        </>
      ) : (
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
            <p>{nl2br(question.description)}</p>
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
                <button type="submit">Next</button>{" "}
                {current > 0 ? (
                  <button
                    type="button"
                    className="secondary"
                    onClick={() => setCurrent(current - 1)}
                  >
                    Previous
                  </button>
                ) : null}
              </fieldset>
            </footer>
          </article>
        </form>
      )}
    </>
  );
}
