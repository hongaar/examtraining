import { Helmet } from "react-helmet";
import { Footer, Header, Main } from "../components";

export function NotFound() {
  console.debug("Rendering page NotFound");

  return (
    <>
      <Helmet>
        <title>Not found</title>
      </Helmet>
      <Header>Not found</Header>
      <Main>Something is not right 🤔</Main>
      <Footer />
    </>
  );
}
