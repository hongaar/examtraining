import { Helmet } from "react-helmet";
import { shuffle } from "../api";
import { Footer, Header, Loading, Main } from "../components";
import { TrainQuestions } from "../components/Training";
import {
  PermissionDenied,
  useAccessCode,
  useExam,
  useTraining,
} from "../hooks";
import { NotFound } from "./NotFound";
import { ProvideAccessCode } from "./ProvideAccessCode";

export function Training({ params }: { params: { exam: string } }) {
  console.debug("Rendering page Training");

  const slug = params.exam ? decodeURIComponent(params.exam) : "";
  const accessCode = useAccessCode();
  const { exam } = useExam(slug, { accessCode });
  const { trainingQuestions, setTrainingQuestions } = useTraining(slug);

  if (exam instanceof PermissionDenied) {
    return <ProvideAccessCode returnTo={`/${slug}`} />;
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
      <Header>Exam training</Header>
      <Main>
        {trainingQuestions.length === 0 ? (
          <article>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                const form = event.target as HTMLFormElement;
                const formData = new FormData(form);
                const questions = shuffle(exam.questions).slice(
                  0,
                  Number(formData.get("questions")),
                );

                setTrainingQuestions(questions);
              }}
            >
              <h3>{exam.title}</h3>
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
                  defaultValue={Math.min(20, exam.questions.length)}
                  onChange={(event) => {
                    event.target.setAttribute(
                      "data-tooltip",
                      `${event.target.value} question${Number(event.target.value) !== 1 ? "s" : ""}`,
                    );
                  }}
                  data-tooltip={`${Math.min(20, exam.questions.length)} question${Math.min(20, exam.questions.length) !== 1 ? "s" : ""}`}
                />
                <small id="questions-helper">
                  With you many questions do you want to train?
                </small>
              </label>
              <article>
                <p>
                  Don't hurry, this training is not timed in any way. You need
                  to answer at least {exam.threshold}% of the questions with the
                  correct answer in order to pass the exam. You won't see the
                  correct answers until you finish the training.
                </p>
                <p>Click the button below to start.</p>
              </article>
              <button type="submit">💪 Start training</button>
            </form>
          </article>
        ) : (
          <TrainQuestions exam={exam} />
        )}
      </Main>
      <Footer />
    </>
  );
}
