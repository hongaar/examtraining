import { ExamWithQuestions } from "@examtraining/core";
import Markdown from "react-markdown";
import nl2br from "react-nl2br";
import { Link } from "wouter";
import { Jumbotron, Section } from "..";
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
      {passed ? (
        <Section className="bg round">
          <Jumbotron>
            {[
              <>
                <h3>Congratulations! You passed the exam.</h3>
                <p>
                  You scored {totalCorrect} out of {trainingQuestions.length}{" "}
                  questions, which equals to {percentageCorrect}%.
                  <br />
                  You needed to score at least {threshold}% to pass the exam.
                </p>
              </>,
              <img src="/undraw_winners_re_wr1l.svg" alt="Winners" />,
            ]}
          </Jumbotron>
        </Section>
      ) : (
        <Section className="bg round">
          <Jumbotron>
            {[
              <>
                <h3>Sorry, you didn't pass the exam.</h3>
                <p>
                  You scored {totalCorrect} out of {trainingQuestions.length}{" "}
                  questions, which equals to {percentageCorrect}%.
                  <br />
                  You needed to score at least {threshold}% to pass the exam.
                </p>
              </>,
              <img src="/undraw_heartbroken_cble.svg" alt="Winners" />,
            ]}
          </Jumbotron>
        </Section>
      )}
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
                      <span data-tooltip="This was your answer">
                        {answer.correct ? (
                          <mark>
                            <ins>{answer.description}</ins>
                          </mark>
                        ) : (
                          <del>{answer.description}</del>
                        )}
                      </span>
                    ) : answer.correct ? (
                      <mark data-tooltip="This is the correct answer">
                        <ins>{answer.description}</ins>
                      </mark>
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
        🧠 New training
      </Link>{" "}
      or ⬅️ <Link to={`/${exam.id}`}>Back to exam</Link>
    </>
  );
}
