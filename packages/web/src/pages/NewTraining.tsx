import { AddId, QuestionWithAnswers } from "@examtraining/core";
import { Helmet } from "react-helmet";
import toast from "react-hot-toast";
import { Link, useLocation } from "wouter";
import { shuffle } from "../api";
import { Footer, Header, Loading, Main } from "../components";
import {
  PermissionDenied,
  useAccessCode,
  useExam,
  useTraining,
} from "../hooks";
import { NotFound } from "./NotFound";
import { ProvideAccessCode } from "./ProvideAccessCode";

const MAX_QUESTIONS_SUGGESTION = 20;

export function NewTraining({ params }: { params: { exam: string } }) {
  console.debug("Rendering page Training");

  const slug = params.exam ? decodeURIComponent(params.exam) : "";
  const accessCode = useAccessCode();
  const { exam } = useExam(slug, { accessCode });
  const { trainingQuestions, current, answers, setTrainingQuestions } =
    useTraining(slug);
  const [, setLocation] = useLocation();

  if (exam instanceof PermissionDenied) {
    return <ProvideAccessCode returnTo={`/${slug}`} />;
  }

  if (exam === undefined) {
    return <Loading>Loading exam...</Loading>;
  }

  if (exam === null) {
    return <NotFound />;
  }

  const trainingFinished =
    trainingQuestions.length > 0 && !trainingQuestions[current];

  return (
    <>
      <Helmet>
        <title>{exam.title}</title>
      </Helmet>
      <Header>Exam training</Header>
      <Main>
        <article>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const form = event.target as HTMLFormElement;
              const formData = new FormData(form);
              const count = Number(formData.get("questions"));
              const usePrevious = formData.get("usePrevious") === "on";

              let questions: AddId<QuestionWithAnswers>[] = [];

              if (usePrevious) {
                const incorrectQuestions = shuffle(
                  trainingQuestions.filter((question) => {
                    return (
                      question.answers.find((a) => a.correct)?.id !==
                      answers[question.id]
                    );
                  }),
                );
                const newQuestions = shuffle(
                  exam.questions.filter((question) => {
                    return !trainingQuestions.some((q) => q.id === question.id);
                  }),
                );
                questions = [...incorrectQuestions, ...newQuestions];
              } else {
                questions = shuffle(exam.questions);
              }

              questions = questions.slice(0, count);

              setTrainingQuestions(
                questions.map((question) => ({
                  ...question,
                  answers: shuffle(question.answers),
                })),
              );

              if (questions.length === 0) {
                toast.success(
                  "You answered all questions. You can start a new training if you want.",
                );
              }

              setLocation(`/${slug}/training`, { replace: true });
            }}
          >
            <h3>{exam.title}</h3>
            {trainingQuestions.length > 0 && !trainingFinished ? (
              <article>
                <p>
                  ⚠️ You already have a training in progress. If you start a new
                  training, this will clear your current progress.
                </p>
                <Link
                  role="button"
                  href={`/${slug}/training`}
                  className="secondary"
                >
                  ↪️ Continue last training
                </Link>
              </article>
            ) : null}
            <label>
              Number of questions
              <input
                name="questions"
                type="range"
                aria-label="Number of questions"
                aria-describedby="questions-helper"
                required
                min={1}
                max={exam.questions.length}
                defaultValue={Math.min(
                  MAX_QUESTIONS_SUGGESTION,
                  exam.questions.length,
                )}
                onChange={(event) => {
                  event.target.setAttribute(
                    "data-tooltip",
                    `${event.target.value} question${Number(event.target.value) !== 1 ? "s" : ""}`,
                  );
                }}
                data-tooltip={`${Math.min(MAX_QUESTIONS_SUGGESTION, exam.questions.length)} question${Math.min(MAX_QUESTIONS_SUGGESTION, exam.questions.length) !== 1 ? "s" : ""}`}
              />
              <small id="questions-helper">
                With you many questions do you want to train?
              </small>
            </label>
            {trainingQuestions.length > 0 && trainingFinished ? (
              <label>
                <input
                  name="usePrevious"
                  type="checkbox"
                  role="switch"
                  defaultChecked
                  aria-describedby="usePrevious-helper"
                />
                Use results from previous training
                <small id="usePrevious-helper">
                  <br />
                  If enabled, the incorrect answers from your previous training
                  will be asked again and the correct answers will not be asked
                  this time.
                </small>
              </label>
            ) : null}
            <article>
              <p>
                Don't hurry, this training is not timed in any way. You need to
                answer at least {exam.threshold}% of the questions with the
                correct answer in order to pass the exam. You won't see the
                correct answers until you finish the training.
              </p>
              <p>Click the button below to start. Good luck! 🍀</p>
            </article>
            <button type="submit">💪 Start training</button>
          </form>
        </article>
      </Main>
      <Footer />
    </>
  );
}
