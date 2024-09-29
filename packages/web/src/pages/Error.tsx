import { Helmet } from "react-helmet";
import { Footer, Header, Main } from "../components";

export function Error() {
  console.debug("Rendering page Error");

  return (
    <>
      <Helmet>
        <title>Error</title>
      </Helmet>
      <Header>Error</Header>
      <Main>
        <article>
          <p>Something is not right 🤔</p>
        </article>
      </Main>
      <Footer />
    </>
  );
}
