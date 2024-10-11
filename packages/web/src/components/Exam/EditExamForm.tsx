import { ExamWithQuestions } from "@examtraining/core";
import { FormEvent, useCallback, useState } from "react";
import { useLocalStorage } from "usehooks-ts";
import { useLocation } from "wouter";
import { Functions, progress } from "../../api";
import {
  useEditCode,
  useFlushCachedExam,
  useFunction,
  useLogEvent,
} from "../../hooks";
import {
  AI,
  Description,
  ExplanationPrompt,
  Private,
  Threshold,
  Title,
} from "./Fields";

type Props = {
  exam: ExamWithQuestions;
};

export function EditExamForm({ exam }: Props) {
  console.debug("Rendering component EditExamForm");

  const slug = exam.id;
  const editCode = useEditCode();
  const [, setAccessCode] = useLocalStorage("accessCode", "");
  const [, setLocation] = useLocation();
  const editExamDetails = useFunction(Functions.EditExamDetails);
  const [saving, setSaving] = useState(false);
  const logEvent = useLogEvent();
  const flush = useFlushCachedExam();
  const [AIEnabled, setAIEnabled] = useState(exam.enableAI);

  const editExam = useCallback(
    async function (event: FormEvent<HTMLFormElement>) {
      event.preventDefault();

      const data = new FormData(event.target as any);

      if (!editCode) {
        throw new Error("Edit code not set.");
      }

      setSaving(true);
      try {
        const { accessCode } = await progress(
          editExamDetails({
            slug,
            editCode,
            data: {
              title: data.get("title") as string,
              description: data.get("description") as string,
              threshold: Number(data.get("threshold")),
              private: data.get("private") === "on",
              enableAI: data.get("enableAI") === "on",
              explanationPrompt: data.get("explanationPrompt") as string,
            },
          }),
          "Saving exam details",
        );
        if (accessCode) {
          setAccessCode(accessCode);
        }
        flush();
        logEvent("edit_exam", { slug });
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
      editExamDetails,
      flush,
      logEvent,
      setAccessCode,
      setLocation,
      slug,
    ],
  );

  return (
    <form onSubmit={editExam}>
      <article>
        <fieldset>
          <Title
            defaultValue={exam.title}
            onChange={(event) => {
              if (event.target.checkValidity()) {
                event.target.setAttribute("aria-invalid", "false");
              } else {
                event.target.setAttribute("aria-invalid", "true");
              }
            }}
            helper="A short, descriptive title"
          />
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
              onClick={(e) => setLocation(`/${slug}`)}
            >
              Cancel
            </button>
            <button
              disabled={saving}
              aria-busy={saving ? "true" : "false"}
              type="submit"
            >
              💾 Save details
            </button>
          </fieldset>
        </footer>
      </article>
    </form>
  );
}
