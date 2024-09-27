import { sluggify } from "@examtraining/core";
import { FormEvent } from "react";
import { Link, useLocation } from "wouter";
import { Footer, Header, Main } from "../components";

export function Homepage() {
  console.debug("Rendering page Homepage");

  const [, setLocation] = useLocation();

  return (
    <>
      <Header />
      <Main>
        <article>
          <h2>View exams</h2>
          <form
            onSubmit={(event: FormEvent<HTMLFormElement>) => {
              event.preventDefault();

              const data = new FormData(event.target as any);

              setLocation(`/${sluggify(data.get("slug") as string)}`);
            }}
          >
            <p>Visit an exam by entering its unique code below:</p>
            <fieldset role="group">
              <input type="text" name="slug" placeholder="Unique exam code" />
              <input type="submit" value="View" />
            </fieldset>
          </form>
        </article>
        <article>
          <h2>Create exams</h2>
          <p>Everyone can create exams:</p>
          <Link role="button" href="/new">
            New exam
          </Link>
        </article>
      </Main>
      <Footer />
    </>
  );
}
