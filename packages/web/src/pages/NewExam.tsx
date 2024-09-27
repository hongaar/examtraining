import { Helmet } from "react-helmet";
import { Footer, Header, Main, NewExamForm } from "../components";

export function NewExam() {
  console.debug("Rendering page NewExam");

  return (
    <>
      <Helmet>
        <title>New exam</title>
      </Helmet>
      <Header>New exam</Header>
      <Main>
        <NewExamForm />
      </Main>
      <Footer />
    </>
  );
}
