import { AddId, Question } from "@examtraining/core";
import { useMemo } from "react";
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
  usePreferences,
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
  const { preferences, setPreference } = usePreferences();

  const categories = useMemo(() => {
    return exam instanceof PermissionDenied
      ? []
      : [
          ...new Set(
            exam?.questions.reduce((categories, q) => {
              return [...categories, ...(q.categories || [])];
            }, [] as string[]),
          ),
        ];
  }, [exam]);

  if (exam instanceof PermissionDenied) {
    return <ProvideAccessCode returnTo={`/${slug}/new-training`} />;
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
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const form = event.target as HTMLFormElement;
            const formData = new FormData(form);
            const questionsCount = Number(formData.get("questionsCount"));
            const includeIncorrect = formData.get("includeIncorrect") === "on";
            const excludeCorrect = formData.get("excludeCorrect") === "on";
            const category = formData.get("category") as string;

            setPreference("questionsCount", questionsCount);

            let questions: AddId<Question>[] = [];
            let incorrectQuestions: AddId<Question>[] = [];
            let newQuestions: AddId<Question>[] = [];

            function categoryFilter(question: AddId<Question>) {
              return (
                category === "" ||
                category === null ||
                typeof category === "undefined" ||
                question.categories?.includes(category)
              );
            }

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
                exam.questions.filter(categoryFilter).filter((question) => {
                  return !answeredCorrectly.includes(question.id);
                }),
              );
            } else {
              newQuestions = shuffle(exam.questions.filter(categoryFilter));
            }

            // Dedupe newQuestions
            newQuestions = newQuestions.filter(
              (question) =>
                !incorrectQuestions.some((q) => q.id === question.id),
            );

            // Blend together
            questions = [...incorrectQuestions, ...newQuestions];

            // Limit questions to count
            questions = questions.slice(0, questionsCount);

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
              return;
            }

            logEvent("start_training", {
              slug,
              questions_count: questions.length,
            });
            setLocation(`/${slug}/training`, { replace: true });
          }}
        >
          <article>
            <h3>{exam.title}</h3>
            {trainingQuestions.length > 0 && !trainingFinished ? (
              <article>
                <div>
                  ⚠️ You already have a training in progress. If you start a new
                  training, this will clear your current progress.
                  <br />
                  <br />
                  <Link
                    role="button"
                    href={`/${slug}/training`}
                    className="secondary"
                  >
                    ↪️ Continue last training
                  </Link>
                </div>
              </article>
            ) : null}
            <label>
              Choose the number of training questions
              <Range
                name="questionsCount"
                aria-label="Number of questions"
                aria-describedby="questionsCount-helper"
                required
                min={1}
                max={Math.min(MAX_QUESTIONS, exam.questions.length)}
                defaultValue={
                  preferences?.questionsCount
                    ? Math.min(
                        preferences?.questionsCount,
                        exam.questions.length,
                      )
                    : Math.min(QUESTIONS_SUGGESTION, exam.questions.length)
                }
              />
              <small id="questionsCount-helper">
                We recommend you choose between 10 and 30 questions. After you
                finish this training, you can immediately start a next training
                which will adapt to your results. You can choose a maximum of{" "}
                {Math.min(MAX_QUESTIONS, exam.questions.length)} questions.
              </small>
            </label>
            {categories.length > 0 ? (
              <label>
                Choose training category
                <select name="category" aria-label="Select a training category">
                  <option selected value="">
                    All categories
                  </option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
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
              <div>
                Don't hurry, this training is not timed in any way. You need to
                answer at least {exam.threshold}% of the questions with the
                correct answer in order to pass the exam. You won't see the
                correct answers until you finish the training.
                <br />
                <br />
                Click the button below to start. Good luck! 🍀
              </div>
            </article>
            <footer>
              <button type="submit">🚀 Start training</button>
            </footer>
          </article>
        </form>
        ⬅️ <Link to={`/${slug}`}>Back to exam</Link>
      </Main>
      <Footer />
    </>
  );
}
