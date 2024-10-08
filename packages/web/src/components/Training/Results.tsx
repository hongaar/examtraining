import { ExamWithQuestions } from "@examtraining/core";
import { ReactNode, useCallback, useState } from "react";
import Markdown from "react-markdown";
import nl2br from "react-nl2br";
import { Fragment } from "react/jsx-runtime";
import { Link } from "wouter";
import { Jumbotron, Section } from "..";
import { Functions } from "../../api";
import { useFunction, useLogEvent, useTraining } from "../../hooks";

type Props = {
  exam: ExamWithQuestions;
};

export function Results({ exam }: Props) {
  console.debug("Rendering component Results");

  const { trainingQuestions, answers } = useTraining(exam.id);
  const explain = useFunction(Functions.ExplainQuestion);
  const logEvent = useLogEvent();
  const [explanations, setExplanations] = useState<Record<string, ReactNode>>(
    {},
  );

  const explainQuestion = useCallback(
    async (questionId: string) => {
      if (explanations[questionId]) {
        return;
      }

      setExplanations((explanations) => ({
        ...explanations,
        [questionId]: <span aria-busy="true">Loading explanation...</span>,
      }));

      logEvent("explain_question", {
        slug: exam.id,
        question_id: questionId,
      });

      try {
        const result = await explain({ slug: exam.id, questionId });

        if (!result) {
          setExplanations((explanations) => ({
            ...explanations,
            [questionId]:
              "❌ Could not retrieve explanation from ChatGPT, please try again later.",
          }));
          return;
        }

        setExplanations((explanations) => ({
          ...explanations,
          [questionId]: result.explanation,
        }));
      } catch (error) {
        console.error(error);
        setExplanations((explanations) => ({
          ...explanations,
          [questionId]:
            "❌ Could not retrieve explanation from ChatGPT, please try again later.",
        }));
        return;
      }
    },
    [exam.id, explain, explanations, logEvent],
  );

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
          <Fragment key={i}>
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
                <Markdown>{`_**Explanation:**  \n${question.explanation}_`}</Markdown>
              ) : null}
              {explanations[question.id] ? (
                <p>
                  <i>
                    <b data-tooltip="Explanation might not be 100% accurate.">
                      <img
                        src="/openai.svg"
                        style={{ height: "1em", verticalAlign: "middle" }}
                        alt="OpenAI logo"
                      />{" "}
                      ChatGPT:
                    </b>
                    <br />
                    {explanations[question.id]}
                  </i>
                </p>
              ) : (
                <button
                  className="inline outline"
                  onClick={() => {
                    explainQuestion(question.id);
                  }}
                >
                  <img
                    src="/openai.svg"
                    style={{ height: "1em", verticalAlign: "middle" }}
                    alt="OpenAI logo"
                  />{" "}
                  Explain with ChatGPT
                </button>
              )}
            </details>
            {i !== trainingQuestions.length - 1 ? <hr /> : null}
          </Fragment>
        ))}
      </article>
      <Link role="button" href={`/${exam.id}/new-training`}>
        🧠 New training
      </Link>{" "}
      or ⬅️ <Link to={`/${exam.id}`}>Back to exam</Link>
    </>
  );
}
