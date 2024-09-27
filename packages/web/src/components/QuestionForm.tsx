import { FirestoreCollection } from "@examtraining/core";
import { Loading } from ".";
import { useCollectionOnce } from "../hooks";

type Props = {
  examSlug: string;
  questionId?: string;
};

export function QuestionForm({ examSlug, questionId }: Props) {
  console.debug("Rendering page Exam");

  const path = [
    FirestoreCollection.Exams,
    examSlug,
    FirestoreCollection.Questions,
  ] as const;
  const [questions] = useCollectionOnce(...path);

  if (questions === null) {
    return <Loading>Loading questions...</Loading>;
  }

  return (
    <>
      {questions.length === 0 ? (
        <p>No questions yet</p>
      ) : (
        questions.map((question) => (
          <details>
            <summary>{question.description}</summary>
            <ul>
              <li>...</li>
              <li>...</li>
            </ul>
            <p>{question.explanation}</p>
          </details>
        ))
      )}
    </>
  );
}
