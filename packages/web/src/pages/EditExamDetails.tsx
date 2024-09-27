import { FirestoreCollection } from "@examtraining/core";
import { Helmet } from "react-helmet";
import { EditExamForm, Footer, Header, Loading, Main } from "../components";
import { useDocument } from "../hooks";
import { NotFound } from "./NotFound";

export function EditExamDetails({ params }: { params: { exam: string } }) {
  console.debug("Rendering page EditExam");

  const slug = params.exam ? decodeURIComponent(params.exam) : "";
  const exam = useDocument(FirestoreCollection.Exams, slug);

  if (exam === undefined) {
    return <NotFound />;
  }

  if (exam === null) {
    return <Loading>Loading exam...</Loading>;
  }

  return (
    <>
      <Helmet>
        <title>{exam.title}</title>
      </Helmet>
      <Header>Edit exam</Header>
      <Main>
        <EditExamForm exam={exam} />
      </Main>
      <Footer />
    </>
  );
}
