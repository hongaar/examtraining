import { AddId, QuestionWithAnswers } from "@examtraining/core";
import { useCallback, useState } from "react";
import { Helmet } from "react-helmet";
import { toast } from "react-hot-toast";
import nl2br from "react-nl2br";
import stringSimilarity from "string-similarity-js";
import { Link } from "wouter";
import { Functions, progress } from "../api";
import {
  EditQuestionForm,
  Footer,
  Header,
  Loading,
  Main,
  NewQuestionForm,
} from "../components";
import {
  PermissionDenied,
  useEditCode,
  useExam,
  useFunction,
  useLogEvent,
} from "../hooks";
import { NotFound } from "./NotFound";
import { ProvideEditCode } from "./ProvideEditCode";

const SIMILARITY_THRESHOLD = 0.95;

export function EditExamQuestions({ params }: { params: { exam: string } }) {
  console.debug("Rendering page EditExamQuestions");

  let maxQuestionOrder: number = 0;

  const slug = params.exam ? decodeURIComponent(params.exam) : "";
  const editCode = useEditCode();
  const [saving, setSaving] = useState(false);
  const createExamQuestion = useFunction(Functions.CreateExamQuestion);
  const editExamQuestion = useFunction(Functions.EditExamQuestion);
  const removeExamQuestion = useFunction(Functions.RemoveExamQuestion);
  const { exam, reload } = useExam(slug, { editCode });
  const [editQuestion, setEditQuestion] = useState<
    AddId<QuestionWithAnswers> | undefined
  >();
  const logEvent = useLogEvent();

  maxQuestionOrder =
    exam instanceof PermissionDenied
      ? 0
      : (exam?.questions.reduce((max, q) => Math.max(max, q.order || 0), 0) ??
        0);

  const onNewQuestion = useCallback(
    async function (question: Partial<QuestionWithAnswers>) {
      if (!editCode) {
        throw new Error("Edit code not set.");
      }

      // Check for existing similar questions
      if (
        !(exam instanceof PermissionDenied) &&
        exam?.questions.some(
          (q) =>
            stringSimilarity(q.description, question.description || "") >
            SIMILARITY_THRESHOLD,
        )
      ) {
        toast(
          "Please check this question, it is very similar to an existing question.",
          {
            icon: "⚠️",
          },
        );
        return;
      }

      setSaving(true);
      try {
        await progress(
          createExamQuestion({
            slug,
            editCode,
            data: {
              ...question,
              order: maxQuestionOrder + 1,
            } as QuestionWithAnswers,
          }),
          "Creating exam question",
        );
        logEvent("create_question", { slug });
        reload();
      } catch (error) {
        console.error(error);
      } finally {
        setSaving(false);
      }
    },
    [
      createExamQuestion,
      editCode,
      exam,
      logEvent,
      maxQuestionOrder,
      reload,
      slug,
    ],
  );

  const onEditQuestion = useCallback(
    async function (question: Partial<QuestionWithAnswers>) {
      if (!editCode) {
        throw new Error("Edit code not set.");
      }

      if (!editQuestion) {
        throw new Error("Question ID not set.");
      }

      setSaving(true);
      try {
        await progress(
          editExamQuestion({
            slug,
            editCode,
            questionId: editQuestion.id,
            data: question as QuestionWithAnswers,
          }),
          "Updating exam question",
        );
        setEditQuestion(undefined);
        logEvent("edit_question", { slug });
        reload();
      } catch (error) {
        console.error(error);
      } finally {
        setSaving(false);
      }
    },
    [editCode, editExamQuestion, editQuestion, logEvent, reload, slug],
  );

  const onRemoveQuestion = useCallback(
    async function (questionId: string) {
      if (!editCode) {
        throw new Error("Edit code not set.");
      }

      setSaving(true);
      try {
        await progress(
          removeExamQuestion({
            slug,
            editCode,
            questionId,
          }),
          "Removing exam question",
        );
        if (editQuestion?.id === questionId) {
          setEditQuestion(undefined);
        }
        logEvent("remove_question", { slug });
        reload();
      } catch (error) {
        console.error(error);
      } finally {
        setSaving(false);
      }
    },
    [editCode, editQuestion?.id, logEvent, reload, removeExamQuestion, slug],
  );

  if (!editCode || exam instanceof PermissionDenied) {
    return <ProvideEditCode returnTo={`/${slug}/questions`} />;
  }

  if (exam === undefined) {
    return <Loading>Loading exam...</Loading>;
  }

  if (exam === null) {
    return <NotFound />;
  }

  return (
    <>
      <Helmet>
        <title>{exam.title}</title>
      </Helmet>
      <Header>Edit exam questions</Header>
      <Main>
        {editQuestion ? (
          <EditQuestionForm
            key={editQuestion.id}
            question={editQuestion}
            onCancel={() => setEditQuestion(undefined)}
            onSubmit={onEditQuestion}
            disabled={saving}
          />
        ) : (
          <NewQuestionForm onSubmit={onNewQuestion} disabled={saving} />
        )}
        <article>
          {exam.questions.length === 0 && <p>No questions yet.</p>}
          {exam.questions.map((question, i) => (
            <>
              <details>
                <summary title={String(i + 1)}>
                  {nl2br(question.description)}
                </summary>
                <ul>
                  {question.answers.map((answer) => (
                    <li
                      key={answer.id}
                      className={answer.correct ? "correct" : undefined}
                    >
                      {answer.description}
                    </li>
                  ))}
                </ul>
                <button
                  className="inline outline"
                  onClick={() => {
                    setEditQuestion(question);
                    document
                      .getElementsByTagName("form")[0]
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  🖊️ Edit question
                </button>{" "}
                <button
                  className="inline outline  secondary"
                  onClick={() => {
                    if (
                      window.confirm(
                        "Are you sure you want to remove this question?",
                      )
                    ) {
                      onRemoveQuestion(question.id);
                    }
                  }}
                >
                  🗑️ Remove question
                </button>
              </details>
              {i !== exam.questions.length - 1 ? <hr /> : null}
            </>
          ))}
        </article>
        ⬅️ <Link to={`/${slug}`}>Back to exam</Link> &nbsp; ⏩{" "}
        <Link to={`/${slug}/bulk`}>Bulk add questions</Link>
      </Main>
      <Footer />
    </>
  );
}
