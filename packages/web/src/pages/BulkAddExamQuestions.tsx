import { AddId, Answer, QuestionWithAnswers } from "@examtraining/core";
import { useCallback, useState } from "react";
import { Helmet } from "react-helmet";
import nl2br from "react-nl2br";
import stringSimilarity from "string-similarity-js";
import { Link } from "wouter";
import { Functions, progress } from "../api";
import { Footer, Header, Loading, Main } from "../components";
import {
  PermissionDenied,
  useEditCode,
  useExam,
  useFunction,
  useLogEvent,
} from "../hooks";
import { NotFound } from "./NotFound";
import { ProvideEditCode } from "./ProvideEditCode";

const SIMILARITY_THRESHOLD = 0.95;

function parseRaw(minOrder: number, text: string) {
  const questions: QuestionWithAnswers[] = [];

  const lines = text
    .trim()
    .split("\n")
    .map((line) => line.trim());

  let currentQuestionIndex = -1;
  let currentAnswerIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    // Check if the first line marks a new question
    const match = lines[i].match(/^\d+[.:]?\s*(.+)$/);
    if (match) {
      currentQuestionIndex += 1;
      currentAnswerIndex = -1;
      questions[currentQuestionIndex] = {
        description: match[1],
        order: minOrder + currentQuestionIndex,
        explanation: "",
        answers: [],
      };
      continue;
    }

    // Check if the line begins a new answer
    const answerMatch = lines[i].match(/^[-*•a-zA-Z][.:]?\s+(.+)$/);
    if (answerMatch) {
      currentAnswerIndex++;
      questions[currentQuestionIndex].answers[currentAnswerIndex] = {
        description: answerMatch[1],
        correct: lines[i].startsWith("*"),
        order: currentAnswerIndex + 1,
      } as AddId<Answer>;
      continue;
    }

    if (currentQuestionIndex !== -1 && currentAnswerIndex === -1) {
      questions[currentQuestionIndex].description += "\n" + lines[i];
    } else if (currentQuestionIndex !== -1 && currentAnswerIndex !== -1) {
      questions[currentQuestionIndex].answers[currentAnswerIndex].description +=
        " " + lines[i];
    }
  }

  // trim everything
  questions.forEach((q) => {
    q.description = q.description.trim();
    q.answers.forEach((a) => {
      a.description = a.description.trim();
    });
  });

  return questions;
}

export function BulkAddExamQuestions({ params }: { params: { exam: string } }) {
  console.debug("Rendering page BulkAddExamQuestions");

  let maxQuestionOrder: number = 0;

  const slug = params.exam ? decodeURIComponent(params.exam) : "";
  const editCode = useEditCode();
  const [saving, setSaving] = useState(false);
  const createExamQuestion = useFunction(Functions.CreateExamQuestion);
  const { exam, reload } = useExam(slug, { editCode });
  const logEvent = useLogEvent();

  const [newQuestions, setNewQuestions] = useState<QuestionWithAnswers[]>([]);
  const [saved, setSaved] = useState<number[]>([]);

  maxQuestionOrder =
    exam instanceof PermissionDenied
      ? 0
      : (exam?.questions.reduce((max, q) => Math.max(max, q.order || 0), 0) ??
        0);

  const createNewQuestion = useCallback(
    async function (question: Partial<QuestionWithAnswers>) {
      if (!editCode) {
        throw new Error("Edit code not set.");
      }

      setSaving(true);
      console.log("Creating question", question);
      try {
        await progress(
          createExamQuestion({
            slug,
            editCode,
            data: question as QuestionWithAnswers,
          }),
          "Creating exam question",
        );
        setSaved((saved) => [...saved, question.order || 0]);
      } catch (error) {
        console.error(error);
      } finally {
        setSaving(false);
      }
    },
    [createExamQuestion, editCode, slug],
  );

  if (!editCode || exam instanceof PermissionDenied) {
    return <ProvideEditCode returnTo={`/${slug}/bulk`} />;
  }

  if (exam === undefined) {
    return <Loading>Loading exam...</Loading>;
  }

  if (exam === null) {
    return <NotFound />;
  }

  return (
    <>
      <Helmet>
        <title>{exam.title}</title>
      </Helmet>
      <Header>Bulk add exam questions</Header>
      <Main>
        <label>
          Raw text
          <textarea
            name="raw"
            placeholder="Raw text"
            aria-label="Description"
            aria-describedby="raw-helper"
            rows={10}
            onChange={(event) => {
              setNewQuestions(
                parseRaw(maxQuestionOrder + 1, event.target.value),
              );
            }}
          />
          <small id="raw-helper">
            Paste raw exam questions and answers here. Each question should
            start with a number and on a new line. Each answer should be on a
            new line and start with a dash (-). The correct answer may be marked
            with an asterisk (*) at the start of the line.
          </small>
        </label>
        <article>
          <form
            onSubmit={async (event) => {
              event.preventDefault();

              const selectedQuestions = new FormData(
                event.target as any,
              ).getAll("questions");

              console.log({ selectedQuestions, newQuestions });

              for (let i = 0; i < newQuestions.length; i++) {
                if (selectedQuestions.includes(String(i))) {
                  await createNewQuestion(newQuestions[i]);
                }
              }

              logEvent("bulkcreate_questions", { slug });
              reload();
            }}
          >
            {newQuestions.length === 0 && <p>No new questions.</p>}
            {newQuestions.map((question, i) => (
              <>
                <details open>
                  <summary title={String(question.order)}>
                    <label>
                      {saved.includes(question.order) ? (
                        "💾 "
                      ) : (
                        <input
                          type="checkbox"
                          name="questions"
                          value={i}
                          defaultChecked
                        />
                      )}
                      {nl2br(question.description)}
                    </label>
                    {exam?.questions.some(
                      (q) =>
                        stringSimilarity(
                          q.description,
                          question.description || "",
                        ) > SIMILARITY_THRESHOLD,
                    ) ? (
                      <div>
                        <mark>
                          ⚠️ Please check this question, it is very similar to
                          an existing question.
                        </mark>
                      </div>
                    ) : null}
                    {question.answers.every((a) => a.correct === false) ? (
                      <div>
                        <mark>
                          ⚠️ Please check this question, it has no correct
                          answer.
                        </mark>
                      </div>
                    ) : null}
                  </summary>
                  <fieldset>
                    <ul>
                      {question.answers.map((answer, index) => (
                        <li
                          key={answer.id}
                          className={answer.correct ? "correct" : undefined}
                        >
                          <label>
                            <input
                              type="radio"
                              checked={answer.correct}
                              onChange={(event) => {
                                setNewQuestions((questions) =>
                                  questions.map((q) => ({
                                    ...q,
                                    answers: q.answers.map((a, i) => ({
                                      ...a,
                                      correct:
                                        question.order === q.order &&
                                        index === i
                                          ? true
                                          : question.order === q.order
                                            ? false
                                            : a.correct,
                                    })),
                                  })),
                                );
                              }}
                            />
                            {answer.description}
                          </label>
                        </li>
                      ))}
                    </ul>
                  </fieldset>
                </details>
                {i !== newQuestions.length - 1 ? <hr /> : null}
              </>
            ))}
            <button disabled={saving} type="submit">
              💾 Create {newQuestions.length} questions
            </button>
          </form>
        </article>
        ⬅️ <Link to={`/${slug}/questions`}>Back to edit exam questions</Link>
      </Main>
      <Footer />
    </>
  );
}
