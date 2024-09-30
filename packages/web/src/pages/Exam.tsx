import { useEffect } from "react";
import { Helmet } from "react-helmet";
import Markdown from "react-markdown";
import { Link } from "wouter";
import { Footer, Header, Loading, Main } from "../components";
import {
  PermissionDenied,
  useAccessCode,
  useExam,
  useRecentExams,
  useTraining,
} from "../hooks";
import { NotFound } from "./NotFound";
import { ProvideAccessCode } from "./ProvideAccessCode";

export function Exam({ params }: { params: { exam: string } }) {
  console.debug("Rendering page Exam");

  const slug = params.exam ? decodeURIComponent(params.exam) : "";
  const accessCode = useAccessCode();
  const { exam } = useExam(slug, { accessCode });
  const { addRecentExam } = useRecentExams();
  const { trainingQuestions, current, setTrainingQuestions } =
    useTraining(slug);

  useEffect(() => {
    if (
      exam !== undefined &&
      exam !== null &&
      exam instanceof PermissionDenied === false
    ) {
      console.log("ADDING RECENT EXAM", exam);
      addRecentExam(exam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exam]);

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
      <Header>Exam details</Header>
      <Main>
        <article>
          <h3>
            {exam.title}
            <span className="badge">
              {exam.private ? (
                <>🔒 This exam is private</>
              ) : (
                <>🌍 This exam is public</>
              )}
            </span>
            <span className="badge">
              📅 Created at {exam.created.toLocaleDateString()}
            </span>
          </h3>
          {exam.description ? <Markdown>{exam.description}</Markdown> : null}
          <footer>
            🖊️ <Link href={`/${slug}/edit`}>Edit exam details</Link>
          </footer>
        </article>
        <article>
          <h3>
            Questions
            <span className="badge">
              ✅ Threshold to pass: {exam.threshold}%
            </span>
          </h3>
          <p>This exam has {exam.questions.length} questions.</p>
          {trainingQuestions.length > 0 ? (
            trainingFinished ? (
              <>
                <Link role="button" href={`/${slug}/training`}>
                  📊 Show results of last training
                </Link>{" "}
              </>
            ) : (
              <>
                <Link role="button" href={`/${slug}/training`}>
                  ↪️ Continue last training
                </Link>{" "}
              </>
            )
          ) : null}
          <Link
            role="button"
            className={trainingQuestions.length > 0 ? "secondary" : ""}
            data-tooltip={
              trainingQuestions.length > 0
                ? "This will clear the results of the last training"
                : undefined
            }
            onClick={() => setTrainingQuestions([])}
            href={`/${slug}/training`}
          >
            💪 Start new training
          </Link>
          <footer>
            ❓ <Link href={`/${slug}/questions`}>Edit questions</Link>
          </footer>
        </article>
      </Main>
      <Footer />
    </>
  );
}
