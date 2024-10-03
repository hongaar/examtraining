import { Helmet } from "react-helmet";
import { Link } from "wouter";
import { EditExamForm, Footer, Header, Loading, Main } from "../components";
import { PermissionDenied, useEditCode, useExamDirect } from "../hooks";
import { NotFound } from "./NotFound";
import { ProvideEditCode } from "./ProvideEditCode";

export function EditExamDetails({ params }: { params: { exam: string } }) {
  console.debug("Rendering page EditExamDetails");

  const slug = params.exam ? decodeURIComponent(params.exam) : "";
  const editCode = useEditCode();
  const { exam } = useExamDirect(slug, { editCode });

  if (!editCode || exam instanceof PermissionDenied) {
    return <ProvideEditCode returnTo={`/${slug}/edit`} />;
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
      <Header>Edit exam details</Header>
      <Main>
        <EditExamForm exam={exam} />
        ⬅️ <Link to={`/${slug}`}>Back to exam</Link>
      </Main>
      <Footer />
    </>
  );
}
