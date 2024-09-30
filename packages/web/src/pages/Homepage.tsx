import { sluggify } from "@examtraining/core";
import { FormEvent } from "react";
import { Link, useLocation } from "wouter";
import { Footer, Header, Main } from "../components";
import { useRecentExams } from "../hooks";

export function Homepage() {
  console.debug("Rendering page Homepage");

  const [, setLocation] = useLocation();
  const { recentExams } = useRecentExams();

  function viewExam(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLocation(
      `/${sluggify(new FormData(event.target as HTMLFormElement).get("slug") as string)}`,
    );
  }

  return (
    <>
      <Header />
      <Main>
        <article>
          <h2>View exam</h2>
          <form onSubmit={viewExam}>
            <p>Visit an exam by entering its unique code below:</p>
            <fieldset role="group">
              <input type="text" name="slug" placeholder="Unique exam code" />
              <button type="submit">👁️ View</button>
            </fieldset>
          </form>
        </article>
        {recentExams.length > 0 && (
          <article>
            <h2>Recently viewed exams</h2>
            <ul>
              {recentExams.map((exam) => (
                <li key={exam.id}>
                  <Link href={`/${exam.id}`}>{exam.title}</Link>
                </li>
              ))}
            </ul>
          </article>
        )}
        <article>
          <h2>Create exam</h2>
          <p>Everyone can create a new exam:</p>
          <Link role="button" href="/new">
            ✨ New exam
          </Link>
        </article>
      </Main>
      <Footer />
    </>
  );
}
