import { AddId, Question } from "@examtraining/core";
import { Fragment, useCallback, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { toast } from "react-hot-toast";
import Markdown from "react-markdown";
import nl2br from "react-nl2br";
import stringSimilarity from "string-similarity-js";
import { Link } from "wouter";
import { Functions, progress } from "../api";
import {
  Back,
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
  useExamDirect,
  useFlushCachedExam,
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
  const { exam, reload } = useExamDirect(slug, { editCode });
  const [editQuestion, setEditQuestion] = useState<
    AddId<Question> | undefined
  >();
  const logEvent = useLogEvent();
  const flush = useFlushCachedExam();
  const [suggestBasedOnQuestion, setSuggestBasedOnQuestion] = useState<
    string | null
  >(null);
  const [suggestBasedOnSubject, setSuggestBasedOnSubject] = useState<
    string | null
  >(null);

  maxQuestionOrder =
    exam instanceof PermissionDenied
      ? 0
      : (exam?.questions.reduce((max, q) => Math.max(max, q.order || 0), 0) ??
        0);

  const categories = useMemo(() => {
    return exam instanceof PermissionDenied
      ? []
      : [
          ...new Set(
            exam?.questions.reduce((categories, q) => {
              return [...categories, ...(q.categories || [])];
            }, [] as string[]),
          ),
        ];
  }, [exam]);

  const onNewQuestion = useCallback(
    async function (question: Partial<Question>) {
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
            } as Question,
          }),
          "Creating exam question",
        );
        flush();
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
      flush,
      logEvent,
      maxQuestionOrder,
      reload,
      slug,
    ],
  );

  const onEditQuestion = useCallback(
    async function (question: Partial<Question>) {
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
            data: question as Question,
          }),
          "Updating exam question",
        );
        flush();
        setEditQuestion(undefined);
        logEvent("edit_question", { slug });
        reload();
      } catch (error) {
        console.error(error);
      } finally {
        setSaving(false);
      }
    },
    [editCode, editExamQuestion, editQuestion, flush, logEvent, reload, slug],
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
        flush();
        logEvent("remove_question", { slug });
        reload();
      } catch (error) {
        console.error(error);
      } finally {
        setSaving(false);
      }
    },
    [
      editCode,
      editQuestion?.id,
      flush,
      logEvent,
      reload,
      removeExamQuestion,
      slug,
    ],
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
            categories={categories}
            onCancel={() => {
              setSuggestBasedOnQuestion(null);
              setSuggestBasedOnSubject(null);
              setEditQuestion(undefined);
            }}
            onSubmit={onEditQuestion}
            disabled={saving}
          />
        ) : (
          <NewQuestionForm
            exam={exam}
            categories={categories}
            onSubmit={onNewQuestion}
            disabled={saving}
            suggestBasedOnQuestion={suggestBasedOnQuestion}
            suggestBasedOnSubject={suggestBasedOnSubject}
            resetSuggestions={() => {
              setSuggestBasedOnQuestion(null);
              setSuggestBasedOnSubject(null);
            }}
          />
        )}
        <article>
          {exam.questions.length === 0 && <p>No questions yet.</p>}
          {exam.questions.map((question, i) => (
            <Fragment key={i}>
              <details>
                <summary title={String(i + 1)}>
                  {question.categories?.map((category) => (
                    <span className="badge">{category}</span>
                  ))}
                  {nl2br(question.description)}
                </summary>
                <ul>
                  {question.answers?.map((answer) => (
                    <li
                      key={answer.id}
                      className={answer.correct ? "correct" : undefined}
                    >
                      {answer.description}
                    </li>
                  ))}
                </ul>
                {question.explanation ? (
                  <Markdown>{`_Explanation: ${question.explanation}_`}</Markdown>
                ) : null}
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
                </button>{" "}
                <button
                  className="inline outline secondary"
                  type="button"
                  onClick={() => {
                    setEditQuestion(undefined);
                    document
                      .getElementsByTagName("form")[0]
                      ?.scrollIntoView({ behavior: "smooth" });
                    setSuggestBasedOnSubject(null);
                    setSuggestBasedOnQuestion(question.id);
                  }}
                  data-tooltip="Generate a question based on this question"
                >
                  ✨ Generate similar questions
                </button>
              </details>
              {i !== exam.questions.length - 1 ? <hr /> : null}
            </Fragment>
          ))}
        </article>
        <article>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const data = new FormData(event.target as HTMLFormElement);
              document
                .getElementsByTagName("form")[0]
                ?.scrollIntoView({ behavior: "smooth" });
              setSuggestBasedOnQuestion(null);
              setSuggestBasedOnSubject(data.get("subject") as string);
            }}
          >
            <fieldset className="grid">
              <input
                type="text"
                name="subject"
                placeholder="Subject"
                required
                style={{ marginBottom: 0 }}
              />
              <input
                type="submit"
                className="secondary outline"
                value="✨ Generate questions on subject"
              />
            </fieldset>
          </form>
        </article>
        <Back slug={slug} />
        &nbsp; ⏩{" "}
        <Link className="secondary" to={`/${slug}/bulk`}>
          Bulk add questions
        </Link>
      </Main>
      <Footer />
    </>
  );
}
