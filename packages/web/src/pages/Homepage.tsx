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
                      defaultValue={
                        typeof recentExams[0] === "object"
                          ? undefined
                          : recentExams[0]
                      }
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
              src="/undraw_chat_bot_re_e2gj.svg"
              alt="Chat bot with text balloon"
            />,
            <>
              <h3>Get help from AI.</h3>
              <p>
                Create new questions and answers with the power of ChatGPT.
                Students can use AI to explain answers.
              </p>
              <Link role="button" href="/new">
                ✨ Get started
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
                  Repeat questions until you get them. Explain questions with
                  the help of AI.
                </div>
                <div>
                  <h4>
                    ✅ <u>Pass threshold</u>
                  </h4>
                  Provides immediate feedback on whether you would have passed
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
                  No need to sign up. We don't store any personal data other
                  than an email address.
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
                📝 Create exam
              </Link>
            </>,
          ]}
        </Jumbotron>
      </Section>
      <Footer />
    </>
  );
}
