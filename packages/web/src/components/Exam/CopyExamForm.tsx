import { ExamWithQuestions, sluggify } from "@examtraining/core";
import { FormEvent, useCallback, useState } from "react";
import { useLocalStorage } from "usehooks-ts";
import { useLocation } from "wouter";
import { Functions, progress } from "../../api";
import { useEditCode, useFunction, useLogEvent } from "../../hooks";
import {
  AI,
  Description,
  Email,
  ExplanationPrompt,
  Private,
  Threshold,
  Title,
  Url,
} from "./Fields";

type Props = {
  exam: ExamWithQuestions;
};

export function CopyExamForm({ exam }: Props) {
  console.debug("Rendering component CopyExamForm");

  const [slug, setSlug] = useState("");
  const isSlugAvailable = useFunction(Functions.IsSlugAvailable);
  const editCode = useEditCode();
  const [slugCheckInProgress, setSlugCheckInProgress] = useState(false);
  const [urlInvalid, setUrlInvalid] = useState<boolean | undefined>(undefined);
  const [, setAccessCode, removeAccessCode] = useLocalStorage("accessCode", "");
  const [, setEditCode] = useLocalStorage("editCode", "");
  const [, setLocation] = useLocation();
  const copyExam = useFunction(Functions.CopyExam);
  const [saving, setSaving] = useState(false);
  const logEvent = useLogEvent();
  const [AIEnabled, setAIEnabled] = useState(exam.enableAI);

  const copy = useCallback(
    async function (event: FormEvent<HTMLFormElement>) {
      event.preventDefault();

      const data = new FormData(event.target as any);

      if (!editCode) {
        throw new Error("Edit code not set.");
      }

      setSaving(true);
      try {
        const { accessCode: newAccessCode, editCode: newEditCode } =
          await progress(
            copyExam({
              slug: exam.id,
              editCode,
              exam: {
                title: data.get("title") as string,
                description: data.get("description") as string,
                threshold: Number(data.get("threshold")),
                private: data.get("private") === "on",
                enableAI: data.get("enableAI") === "on",
                explanationPrompt: data.get("explanationPrompt") as string,
              },
              owner: data.get("email") as string,
            }),
            "Copying exam",
          );
        if (newAccessCode) {
          setAccessCode(newAccessCode);
        } else {
          removeAccessCode();
        }
        setEditCode(newEditCode);
        logEvent("copy_exam", { source_slug: exam.id, destination_slug: slug });
        setLocation(`/${slug}`);
      } catch (error) {
        console.error(error);
        throw error;
      } finally {
        setSaving(false);
      }
    },
    [
      copyExam,
      editCode,
      exam.id,
      logEvent,
      removeAccessCode,
      setAccessCode,
      setEditCode,
      setLocation,
      slug,
    ],
  );

  return (
    <form onSubmit={copy}>
      <article>
        <fieldset>
          <Title
            onChange={(event) => {
              setSlug(sluggify(event.target.value));

              if (event.target.checkValidity()) {
                event.target.setAttribute("aria-invalid", "false");
              } else {
                event.target.setAttribute("aria-invalid", "true");
              }

              if (event.target.value !== "") {
                setSlugCheckInProgress(true);
                isSlugAvailable({ slug: sluggify(event.target.value) })
                  .then((result) => {
                    if (!result) {
                      setUrlInvalid(true);
                      event.target.setAttribute("aria-invalid", "true");
                    } else {
                      setUrlInvalid(false);
                      event.target.setAttribute("aria-invalid", "false");
                    }
                  })
                  .finally(() => {
                    setSlugCheckInProgress(false);
                  });
              }
            }}
            helper={
              urlInvalid
                ? "This URL for this name is already in use."
                : undefined
            }
          />
          <Url busy={slugCheckInProgress} slug={slug} invalid={urlInvalid} />
          <Description
            defaultValue={exam.description || ""}
            onChange={(event) => {
              if (event.target.checkValidity()) {
                event.target.setAttribute("aria-invalid", "false");
              } else {
                event.target.setAttribute("aria-invalid", "true");
              }
            }}
          />
          <Email
            onChange={(event) => {
              if (event.target.checkValidity()) {
                event.target.setAttribute("aria-invalid", "false");
              } else {
                event.target.setAttribute("aria-invalid", "true");
              }
            }}
          />
          <Threshold defaultValue={exam.threshold} />
          <Private defaultChecked={exam.private} />
          <AI
            defaultChecked={exam.enableAI}
            onChange={(event) => {
              setAIEnabled(event.target.checked);
            }}
          />
          <ExplanationPrompt
            className={AIEnabled ? undefined : "hidden"}
            defaultValue={exam.explanationPrompt}
          />
        </fieldset>
        <footer>
          <fieldset className="grid">
            <button
              type="button"
              className="secondary"
              onClick={(e) => setLocation(`/${exam.id}`)}
            >
              Cancel
            </button>
            <button
              disabled={saving || slugCheckInProgress || urlInvalid}
              aria-busy={saving || slugCheckInProgress ? "true" : "false"}
              type="submit"
            >
              💾 Copy exam
            </button>
          </fieldset>
        </footer>
      </article>
    </form>
  );
}
