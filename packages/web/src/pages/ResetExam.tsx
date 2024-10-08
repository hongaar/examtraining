import { FormEvent, useCallback, useState } from "react";
import { Helmet } from "react-helmet";
import { useLocalStorage } from "usehooks-ts";
import { Link, useLocation } from "wouter";
import { Functions, progress } from "../api";
import { Footer, Header, Loading, Main } from "../components";
import {
  PermissionDenied,
  useAccessCode,
  useCachedExam,
  useEditCode,
  useFunction,
  useLogEvent,
} from "../hooks";
import { NotFound } from "./NotFound";
import { ProvideEditCode } from "./ProvideEditCode";

export function ResetExam({ params }: { params: { exam: string } }) {
  console.debug("Rendering page ResetExam");

  const slug = params.exam ? decodeURIComponent(params.exam) : "";
  const editCode = useEditCode();
  const accessCode = useAccessCode();
  const { exam } = useCachedExam(slug, { accessCode });
  const [, setLocation] = useLocation();
  const [saving, setSaving] = useState(false);
  const resetExam = useFunction(Functions.ResetExam);
  const [, setAccessCode, removeAccessCode] = useLocalStorage("accessCode", "");
  const [, setEditCode] = useLocalStorage("editCode", "");
  const logEvent = useLogEvent();

  const reset = useCallback(
    async function (event: FormEvent<HTMLFormElement>) {
      event.preventDefault();

      if (!editCode) {
        throw new Error("Edit code not set.");
      }

      setSaving(true);
      try {
        const { accessCode: newAccessCode, editCode: newEditCode } =
          await progress(
            resetExam({
              slug,
              editCode,
            }),
            "Resetting exam codes",
          );
        if (newAccessCode) {
          setAccessCode(newAccessCode);
        } else {
          removeAccessCode();
        }
        setEditCode(newEditCode);
        logEvent("reset_exam", {
          slug,
        });
        setLocation(`/${slug}`);
      } catch (error) {
        console.error(error);
        throw error;
      } finally {
        setSaving(false);
      }
    },
    [
      editCode,
      logEvent,
      removeAccessCode,
      resetExam,
      setAccessCode,
      setEditCode,
      setLocation,
      slug,
    ],
  );

  if (!editCode || exam instanceof PermissionDenied) {
    return <ProvideEditCode returnTo={`/${slug}/reset`} />;
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
      <Header>Reset exam</Header>
      <Main>
        <form onSubmit={reset}>
          <article>
            <h3>Reset exam</h3>
            {exam.private ? (
              <div>
                This exam is private, students will need to enter the new access
                code. The edit code will also be reset.
              </div>
            ) : (
              <div>This exam is public, only the edit code will be reset.</div>
            )}
            <div>
              The new codes will be sent to the email address which was entered
              when the exam was created.
            </div>
            <footer>
              <fieldset className="grid">
                <button
                  type="button"
                  className="secondary"
                  onClick={(e) => setLocation(`/${slug}`)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  aria-busy={saving ? "true" : "false"}
                >
                  🔑 Reset {exam.private ? "access and " : ""}edit code
                </button>
              </fieldset>
            </footer>
          </article>
        </form>{" "}
        ⬅️ <Link to={`/${slug}`}>Back to exam</Link>
      </Main>
      <Footer />
    </>
  );
}
