import { ExamWithQuestions } from "@examtraining/core";
import Markdown from "react-markdown";
import nl2br from "react-nl2br";
import { Link } from "wouter";
import { useTraining } from "../../hooks";

type Props = {
  exam: ExamWithQuestions;
};

export function Results({ exam }: Props) {
  console.debug("Rendering component Results");

  const { trainingQuestions, answers } = useTraining(exam.id);

  const totalCorrect = trainingQuestions.reduce((total, question, index) => {
    const answer = answers[question.id];
    const correct = question.answers.find((a) => a.correct)?.id;

    return total + (answer === correct ? 1 : 0);
  }, 0);

  const percentageCorrect = Math.ceil(
    (totalCorrect / trainingQuestions.length) * 100,
  );

  const threshold = exam.threshold;

  const passed = percentageCorrect >= threshold;

  return (
    <>
      <article>
        <h3>Results</h3>
        <p>
          {passed
            ? "🎉 Congratulations! You passed the exam."
            : "😳 Sorry, you didn't pass the exam."}
        </p>
        <p>
          You scored {totalCorrect} out of {trainingQuestions.length} questions,
          which equals to {percentageCorrect}%.
          <br />
          You needed to score at least {threshold}% to pass the exam.
        </p>
      </article>
      <article>
        <h3>Questions</h3>
        {trainingQuestions.map((question, i) => (
          <>
            <details
              className={
                question.answers.find((a) => a.correct)?.id ===
                answers[question.id]
                  ? "correct"
                  : "incorrect"
              }
              open={
                question.answers.find((a) => a.correct)?.id ===
                answers[question.id]
                  ? undefined
                  : true
              }
            >
              <summary title={String(i + 1)}>
                {nl2br(question.description)}
              </summary>
              <ul>
                {question.answers.map((answer) => (
                  <li
                    key={answer.id}
                    className={answer.correct ? "correct" : undefined}
                  >
                    {answers[question.id] === answer.id ? (
                      <mark data-tooltip="This was your answer">
                        {answer.correct ? (
                          <ins>{answer.description}</ins>
                        ) : (
                          answer.description
                        )}
                      </mark>
                    ) : answer.correct ? (
                      <ins data-tooltip="This is the correct answer">
                        {answer.description}
                      </ins>
                    ) : (
                      answer.description
                    )}
                  </li>
                ))}
              </ul>
              {question.explanation ? (
                <Markdown>{`_Explanation: ${question.explanation}_`}</Markdown>
              ) : null}
            </details>
            {i !== trainingQuestions.length - 1 ? <hr /> : null}
          </>
        ))}
      </article>
      <Link role="button" href={`/${exam.id}/new-training`}>
        💪 Start new training
      </Link>{" "}
      or ⬅️ <Link to={`/${exam.id}`}>Back to exam</Link>
    </>
  );
}
