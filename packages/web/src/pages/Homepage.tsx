import { sluggify } from "@examtraining/core";
import { FormEvent } from "react";
import { Link, useLocation } from "wouter";
import { Footer, Header, Jumbotron, Section } from "../components";
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
      <Section className="homepage bg" fluid>
        <Header />
        <Section>
          <Jumbotron className="large">
            {[
              <>
                <h2>Be well prepared for your next exam.</h2>
                <p>Online training for multiple choice exams.</p>
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
        </Section>
      </Section>
      <Section className="homepage">
        <Jumbotron className="large">
          {[
            <img
              src="/undraw_text_field_htlv.svg"
              alt="Woman filling out a text field"
            />,
            <>
              <h3>Easy management of questions and answers.</h3>
              <p>
                Create new exams by copy-pasting questions and answers from
                existing documents, or start entirely from scratch.
              </p>
              <Link role="button" href="/new">
                ✨ Create exam
              </Link>
            </>,
          ]}
        </Jumbotron>
      </Section>
      <Section className="homepage bg round">
        <Jumbotron className="large">
          {[
            <>
              <h3>Free and simple.</h3>
              <p>Only the features you need, none of the complexity.</p>
              <div className="grid">
                <div>
                  <h4>
                    🔁 <u>Learn from mistakes</u>
                  </h4>
                  Repeat questions you answered incorrectly until you get them
                  right.
                </div>
                <div>
                  <h4>
                    ✅ <u>Pass threshold</u>
                  </h4>
                  Provides training feedback on whether you would have passed
                  the exam.
                </div>
              </div>
              <div className="grid">
                <div>
                  <h4>
                    🔒 <u>Private exams</u>
                  </h4>
                  Protect exams with a secret access code and share only with
                  your students.
                </div>
                <div>
                  <h4>
                    🏷️ <u>Question categories</u>
                  </h4>
                  Assign categories to questions and use them to selectively
                  train a group of questions.
                </div>
              </div>{" "}
              <div className="grid">
                <div>
                  <h4>
                    🪬 <u>Privacy friendly</u>
                  </h4>
                  We don't store any students personal data. Training results
                  are not stored on our servers.
                </div>
                <div>
                  <h4>
                    📥 <u>Bulk import</u>
                  </h4>
                  Mass create questions and answers by copy-pasting from
                  existing documents.
                </div>
              </div>
            </>,
          ]}
        </Jumbotron>
      </Section>
      <Footer />
    </>
  );
}
