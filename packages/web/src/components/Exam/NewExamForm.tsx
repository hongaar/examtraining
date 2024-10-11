import { sluggify } from "@examtraining/core";
import { FormEvent, useCallback, useState } from "react";
import { useLocalStorage } from "usehooks-ts";
import { useLocation } from "wouter";
import {
  DEFAULT_EXPLANATION_PROMPT,
  Functions,
  progress,
  USE_DUMMY_DATA,
} from "../../api";
import { useFlushCachedExam, useFunction, useLogEvent } from "../../hooks";
import { Email, Private, Threshold, Title, Url } from "./Fields";

export function NewExamForm() {
  console.debug("Rendering component NewExamForm");

  const [slug, setSlug] = useState("");
  const isSlugAvailable = useFunction(Functions.IsSlugAvailable);
  const createExam = useFunction(Functions.CreateExam);
  const [saving, setSaving] = useState(false);
  const [slugCheckInProgress, setSlugCheckInProgress] = useState(false);
  const [urlInvalid, setUrlInvalid] = useState<boolean | undefined>(undefined);
  const [, setLocation] = useLocation();
  const [, setAccessCode, removeAccessCode] = useLocalStorage("accessCode", "");
  const [, setEditCode, removeEditCode] = useLocalStorage("editCode", "");
  const logEvent = useLogEvent();
  const flush = useFlushCachedExam();

  const addExam = useCallback(
    async function (event: FormEvent<HTMLFormElement>) {
      event.preventDefault();

      const data = new FormData(event.target as any);

      setSaving(true);
      removeAccessCode();
      removeEditCode();
      try {
        const { accessCode, editCode } = await progress(
          createExam({
            exam: {
              title: data.get("title") as string,
              description: null,
              threshold: Number(data.get("threshold")),
              private: data.get("private") === "on",
              enableAI: true,
              explanationPrompt: DEFAULT_EXPLANATION_PROMPT,
            },
            owner: data.get("email") as string,
          }),
          "Creating exam",
        );
        if (accessCode) {
          setAccessCode(accessCode);
        }
        setEditCode(editCode);
        flush();
        logEvent("create_exam", { slug });
        setLocation(`/${slug}`);
      } catch (error) {
        console.error(error);
      } finally {
        setSaving(false);
      }
    },
    [
      createExam,
      flush,
      logEvent,
      removeAccessCode,
      removeEditCode,
      setAccessCode,
      setEditCode,
      setLocation,
      slug,
    ],
  );

  return (
    <form onSubmit={addExam}>
      <article>
        <fieldset>
          <Title
            defaultValue={USE_DUMMY_DATA ? "Dit is een test" : undefined}
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
          <Email
            defaultValue={USE_DUMMY_DATA ? "hongaar@gmail.com" : undefined}
            onChange={(event) => {
              if (event.target.checkValidity()) {
                event.target.setAttribute("aria-invalid", "false");
              } else {
                event.target.setAttribute("aria-invalid", "true");
              }
            }}
          />
          <Threshold />
          <Private />
        </fieldset>
        <footer>
          <fieldset className="grid">
            <button
              type="button"
              className="secondary"
              onClick={(e) => setLocation("/")}
            >
              Cancel
            </button>
            <button
              disabled={saving || slugCheckInProgress || urlInvalid}
              aria-busy={saving || slugCheckInProgress ? "true" : "false"}
              type="submit"
            >
              💾 Create
            </button>
          </fieldset>
        </footer>
      </article>
    </form>
  );
}
