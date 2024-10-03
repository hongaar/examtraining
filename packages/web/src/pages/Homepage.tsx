import { sluggify } from "@examtraining/core";
import { FormEvent } from "react";
import { Link, useLocation } from "wouter";
import { Container, Footer, Header, Jumbotron } from "../components";
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
      <Container className="homepage bg" fluid>
        <Header />
        <Container>
          <Jumbotron>
            {[
              <>
                <h2>Be well prepared for your next exam.</h2>
                <p>Exam training for multiple choice exams.</p>
                <form onSubmit={viewExam}>
                  <fieldset role="group">
                    <input
                      type="text"
                      name="slug"
                      required
                      defaultValue={recentExams[0]?.title}
                      placeholder="Exam code"
                    />
                    <button type="submit">🧠 Train now</button>
                  </fieldset>
                </form>
              </>,
              <img
                src="/undraw_exams_re_4ios.svg"
                alt="Woman making an exam"
              />,
            ]}
          </Jumbotron>
        </Container>
      </Container>
      <Container className="homepage">
        <Jumbotron>
          {[
            <img
              src="/undraw_text_field_htlv.svg"
              alt="Woman filling out a text field"
            />,
            <>
              <h3>Easy management of questions and answers.</h3>
              <p>
                Create new exams by copy-pasting questions and answers from
                existing documents, or start entirely from scratch!
              </p>
              <Link role="button" href="/new">
                ✨ Create exam
              </Link>
            </>,
          ]}
        </Jumbotron>
      </Container>
      <Footer />
    </>
  );
}
