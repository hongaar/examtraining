import { AddId, QuestionWithAnswers } from "@examtraining/core";
import { useCallback, useState } from "react";
import { Helmet } from "react-helmet";
import nl2br from "react-nl2br";
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
import { PermissionDenied, useEditCode, useExam, useFunction } from "../hooks";
import { NotFound } from "./NotFound";
import { ProvideEditCode } from "./ProvideEditCode";

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
        reload();
      } catch (error) {
        console.error(error);
      } finally {
        setSaving(false);
      }
    },
    [createExamQuestion, editCode, maxQuestionOrder, reload, slug],
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
        reload();
      } catch (error) {
        console.error(error);
      } finally {
        setSaving(false);
      }
    },
    [editCode, editExamQuestion, editQuestion, reload, slug],
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
        reload();
      } catch (error) {
        console.error(error);
      } finally {
        setSaving(false);
      }
    },
    [editCode, editQuestion?.id, reload, removeExamQuestion, slug],
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
                      .getElementById("edit")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  🖊️ Edit question
                </button>{" "}
                <button
                  className="inline outline  secondary"
                  onClick={() => {
                    onRemoveQuestion(question.id);
                  }}
                >
                  🗑️ Remove question
                </button>
              </details>
              {i !== exam.questions.length - 1 ? <hr /> : null}
            </>
          ))}
        </article>
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
        ⬅️ <Link to={`/${slug}`}>Back to exam</Link>
      </Main>
      <Footer />
    </>
  );
}
