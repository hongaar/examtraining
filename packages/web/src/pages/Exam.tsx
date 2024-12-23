import { useEffect } from "react";
import { Helmet } from "react-helmet";
import Markdown from "react-markdown";
import { Link } from "wouter";
import { Footer, Header, Loading, Main } from "../components";
import {
  PermissionDenied,
  useAccessCode,
  useCachedExam,
  useEditCode,
  useRecentExams,
  useTraining,
} from "../hooks";
import { NotFound } from "./NotFound";
import { ProvideAccessCode } from "./ProvideAccessCode";

export function Exam({ params }: { params: { exam: string } }) {
  console.debug("Rendering page Exam");

  const slug = params.exam ? decodeURIComponent(params.exam) : "";
  const accessCode = useAccessCode();
  const editCode = useEditCode();
  const { exam } = useCachedExam(slug, { accessCode });
  const { addRecentExam } = useRecentExams();
  const { trainingQuestions, current } = useTraining(slug);

  useEffect(() => {
    if (
      exam !== undefined &&
      exam !== null &&
      exam instanceof PermissionDenied === false
    ) {
      addRecentExam(exam);
    }
    // We don't want to add addRecentExam or we will get an infinite loop
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
              {exam.private ? <>🔒 Private</> : <>🌍 Public</>}
            </span>
            <span className="badge">
              📅 Created: {exam.created.toLocaleDateString()}
            </span>
            <span className="badge">✅ Pass threshold: {exam.threshold}%</span>
            <span className="badge">❓ Questions: {exam.questions.length}</span>
          </h3>
          {exam.description ? (
            <Markdown>{exam.description}</Markdown>
          ) : editCode ? (
            <>
              🖊️&nbsp;
              <Link className="secondary" href={`/${slug}/edit`}>
                Add description
              </Link>
            </>
          ) : null}
          <footer className="grid">
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
              href={`/${slug}/new-training`}
            >
              🧠 New training
            </Link>
          </footer>
          {editCode ? (
            <footer>
              ❓&nbsp;<Link href={`/${slug}/questions`}>Edit questions</Link>{" "}
              &nbsp; 🖊️&nbsp;<Link href={`/${slug}/edit`}>Edit details</Link>{" "}
              &nbsp; 🖨️&nbsp;<Link href={`/${slug}/copy`}>Make a copy</Link>{" "}
              &nbsp; 🔑&nbsp;<Link href={`/${slug}/reset`}>Reset codes</Link>
            </footer>
          ) : null}
        </article>
      </Main>
      <Footer />
    </>
  );
}
