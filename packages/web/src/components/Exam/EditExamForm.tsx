import { AddId, Exam } from "@examtraining/core";
import { FormEvent, useCallback, useState } from "react";
import { useLocation } from "wouter";
import { Functions, progress } from "../../api";
import { useFunction } from "../../hooks/useFunction";
import { Description, Private, Title } from "./Fields";

type Props = {
  exam: AddId<Exam>;
};

export function EditExamForm({ exam }: Props) {
  console.debug("Rendering component EditExamForm");

  const slug = exam.id;
  const [, setLocation] = useLocation();
  const editExamDetails = useFunction(Functions.EditExamDetails);
  const [saving, setSaving] = useState(false);

  const editExam = useCallback(
    async function (event: FormEvent<HTMLFormElement>) {
      event.preventDefault();

      const data = new FormData(event.target as any);

      setSaving(true);
      try {
        await progress(
          editExamDetails({
            slug,
            data: {
              title: data.get("title") as string,
              description: data.get("description") as string,
              owner: data.get("email") as string,
              private: data.get("private") === "on",
            },
          }),
          "Saving exam details",
        );
        setLocation(`/${slug}`);
      } catch (error) {
        console.error(error);
      } finally {
        setSaving(false);
      }
    },
    [editExamDetails, setLocation, slug],
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
            helper="A longer description of the exam. This is optional."
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
