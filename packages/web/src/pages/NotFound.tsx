import { Helmet } from "react-helmet";
import { Link } from "wouter";
import { Footer, Header, Main } from "../components";

export function NotFound() {
  console.debug("Rendering page NotFound");

  return (
    <>
      <Helmet>
        <title>Not found</title>
      </Helmet>
      <Header>Not found</Header>
      <Main>
        <article>
          <p>This exam could not be found 🙈</p>
          <Link to="/">Go back to the homepage</Link>
        </article>
      </Main>
      <Footer />
    </>
  );
}
