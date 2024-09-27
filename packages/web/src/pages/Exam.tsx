import { FirestoreCollection } from "@examtraining/core";
import { Helmet } from "react-helmet";
import Markdown from "react-markdown";
import { Link } from "wouter";
import { Footer, Header, Loading, Main } from "../components";
import { useCollectionOnce, useDocumentOnce } from "../hooks";
import { NotFound } from "./NotFound";

export function Exam({ params }: { params: { exam: string } }) {
  console.debug("Rendering page Exam");

  const slug = params.exam ? decodeURIComponent(params.exam) : "";
  const exam = useDocumentOnce(FirestoreCollection.Exams, slug);
  const questionsPath = [
    FirestoreCollection.Exams,
    slug,
    FirestoreCollection.Questions,
  ] as const;
  const [questions] = useCollectionOnce(...questionsPath);

  if (exam === undefined) {
    return <NotFound />;
  }

  if (exam === null || questions === null) {
    return <Loading>Loading exam...</Loading>;
  }

  return (
    <>
      <Helmet>
        <title>{exam.title}</title>
      </Helmet>
      <Header>Exam details</Header>
      <Main>
        <article>
          <h3>{exam.title}</h3>
          <p>
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
          </p>
          {exam.description ? <Markdown>{exam.description}</Markdown> : null}
          <footer>
            🖊️ <Link href={`/${slug}/edit`}>Edit exam details</Link>
          </footer>
        </article>
        <article>
          <h3>Questions</h3>
          <p>
            This exam contains {questions.length} question
            {questions.length !== 1 ? "s" : ""}.
          </p>
          <Link role="button" href={`/${slug}/training`}>
            Start training
          </Link>
        </article>
      </Main>
      <Footer />
    </>
  );
}
