import { ExamWithQuestions } from "@examtraining/core";
import { FormEvent, useCallback, useState } from "react";
import { useLocation } from "wouter";
import { Functions, progress } from "../../api";
import { useEditCode, useFunction, useLogEvent } from "../../hooks";
import { Description, Private, Threshold, Title } from "./Fields";

type Props = {
  exam: ExamWithQuestions;
};

export function EditExamForm({ exam }: Props) {
  console.debug("Rendering component EditExamForm");

  const slug = exam.id;
  const editCode = useEditCode();
  const [, setLocation] = useLocation();
  const editExamDetails = useFunction(Functions.EditExamDetails);
  const [saving, setSaving] = useState(false);
  const logEvent = useLogEvent();

  const editExam = useCallback(
    async function (event: FormEvent<HTMLFormElement>) {
      event.preventDefault();

      const data = new FormData(event.target as any);

      if (!editCode) {
        throw new Error("Edit code not set.");
      }

      setSaving(true);
      try {
        await progress(
          editExamDetails({
            slug,
            editCode,
            data: {
              title: data.get("title") as string,
              description: data.get("description") as string,
              threshold: Number(data.get("threshold")),
              private: data.get("private") === "on",
            },
          }),
          "Saving exam details",
        );
        logEvent("edit_exam", { slug });
        setLocation(`/${slug}`);
      } catch (error) {
        console.error(error);
        throw error;
      } finally {
        setSaving(false);
      }
    },
    [editCode, editExamDetails, setLocation, slug],
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
