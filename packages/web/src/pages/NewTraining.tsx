import { AddId, QuestionWithAnswers } from "@examtraining/core";
import { Helmet } from "react-helmet";
import toast from "react-hot-toast";
import { Link, useLocation } from "wouter";
import { shuffle } from "../api";
import { Footer, Header, Loading, Main, Range } from "../components";
import {
  PermissionDenied,
  useAccessCode,
  useCachedExam,
  useLogEvent,
  useTraining,
} from "../hooks";
import { NotFound } from "./NotFound";
import { ProvideAccessCode } from "./ProvideAccessCode";

const QUESTIONS_SUGGESTION = 20;
const MAX_QUESTIONS = 50;

export function NewTraining({ params }: { params: { exam: string } }) {
  console.debug("Rendering page Training");

  const slug = params.exam ? decodeURIComponent(params.exam) : "";
  const accessCode = useAccessCode();
  const { exam } = useCachedExam(slug, { accessCode });
  const {
    trainingQuestions,
    current,
    answers,
    setTrainingQuestions,
    answeredCorrectly,
  } = useTraining(slug);
  const [, setLocation] = useLocation();
  const logEvent = useLogEvent();

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
              const includeIncorrect =
                formData.get("includeIncorrect") === "on";
              const excludeCorrect = formData.get("excludeCorrect") === "on";

              let questions: AddId<QuestionWithAnswers>[] = [];
              let incorrectQuestions: AddId<QuestionWithAnswers>[] = [];
              let newQuestions: AddId<QuestionWithAnswers>[] = [];

              if (includeIncorrect) {
                incorrectQuestions = shuffle(
                  trainingQuestions.filter((question) => {
                    return (
                      question.answers.find((a) => a.correct)?.id !==
                      answers[question.id]
                    );
                  }),
                );
              }

              if (excludeCorrect) {
                // Exclude any question with id included in answeredCorrectly
                newQuestions = shuffle(
                  exam.questions.filter((question) => {
                    return !answeredCorrectly.includes(question.id);
                  }),
                );
              } else {
                newQuestions = shuffle(exam.questions);
              }

              // Blend together
              questions = [...incorrectQuestions, ...newQuestions];

              // Limit questions to count
              questions = questions.slice(0, count);

              // Shuffle incorrect questions with newQuestions
              questions = shuffle(questions);

              // Shuffle answers
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
              logEvent("start_training", { slug });
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
              Choose the number of training questions
              <Range
                name="questions"
                aria-label="Number of questions"
                aria-describedby="questions-helper"
                required
                min={1}
                max={Math.min(MAX_QUESTIONS, exam.questions.length)}
                defaultValue={Math.min(
                  QUESTIONS_SUGGESTION,
                  exam.questions.length,
                )}
              />
              <small id="questions-helper">
                We recommend you choose between 10 and 30 questions. After you
                finish this training, you can immediately start a next training
                which will adapt to your results. You can choose a maximum of{" "}
                {Math.min(MAX_QUESTIONS, exam.questions.length)} questions.
              </small>
            </label>
            {trainingQuestions.length > 0 && trainingFinished ? (
              <label>
                <input
                  name="includeIncorrect"
                  type="checkbox"
                  role="switch"
                  defaultChecked
                />
                Include incorrectly answered questions from <i>last</i> training
              </label>
            ) : null}
            {answeredCorrectly.length > 0 ? (
              <label>
                <input
                  name="excludeCorrect"
                  type="checkbox"
                  role="switch"
                  defaultChecked
                />
                Exclude correctly answered questions from <i>all</i> previous
                trainings
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
        ⬅️ <Link to={`/${slug}`}>Back to exam</Link>
      </Main>
      <Footer />
    </>
  );
}
