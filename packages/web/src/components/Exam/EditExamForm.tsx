import { ExamWithQuestions } from "@examtraining/core";
import { FormEvent, useCallback, useState } from "react";
import { useLocation } from "wouter";
import { Functions, progress } from "../../api";
import { useEditCode, useFunction } from "../../hooks";
import { Description, Private, Title } from "./Fields";

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
              private: data.get("private") === "on",
            },
          }),
          "Saving exam details",
        );
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
              Save details
            </button>
          </fieldset>
        </footer>
      </article>
    </form>
  );
}
