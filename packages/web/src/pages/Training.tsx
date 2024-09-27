import { FirestoreCollection } from "@examtraining/core";
import { Helmet } from "react-helmet";
import { Link } from "wouter";
import { Footer, Header, Loading, Main } from "../components";
import { useCollectionOnce, useDocumentOnce } from "../hooks";
import { NotFound } from "./NotFound";

export function Training({ params }: { params: { exam: string } }) {
  console.debug("Rendering page Training");

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
      <Header>{exam.title}</Header>
      <Main>
        <article>
          {exam.description ? <p>{exam.description}</p> : null}
          <Link href={`/${slug}/edit`}>Edit exam details and questions</Link>
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
