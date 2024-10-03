import { sluggify } from "@examtraining/core";
import { FormEvent, useCallback, useState } from "react";
import { useLocalStorage } from "usehooks-ts";
import { useLocation } from "wouter";
import { Functions, progress, USE_DUMMY_DATA } from "../../api";
import { useFunction, useLogEvent } from "../../hooks";
import { Description, Email, Private, Threshold, Title, Url } from "./Fields";

export function NewExamForm() {
  console.debug("Rendering component NewExamForm");

  const [slug, setSlug] = useState("");
  const isSlugAvailable = useFunction(Functions.IsSlugAvailable);
  const createExam = useFunction(Functions.CreateExam);
  const [saving, setSaving] = useState(false);
  const [slugCheckInProgress, setSlugCheckInProgress] = useState(false);
  const [urlInvalid, setUrlInvalid] = useState<boolean | undefined>(undefined);
  const [, setLocation] = useLocation();
  const [, , removeAccessCode] = useLocalStorage("accessCode", "");
  const [, , removeEditCode] = useLocalStorage("editCode", "");
  const logEvent = useLogEvent();

  const addExam = useCallback(
    async function (event: FormEvent<HTMLFormElement>) {
      event.preventDefault();

      const data = new FormData(event.target as any);

      setSaving(true);
      removeAccessCode();
      removeEditCode();
      try {
        await progress(
          createExam({
            exam: {
              title: data.get("title") as string,
              description: data.get("description") as string,
              threshold: Number(data.get("threshold")),
              private: data.get("private") === "on",
            },
            owner: data.get("email") as string,
          }),
          "Creating exam",
        );
        logEvent("create_exam", { slug });
        setLocation(`/${slug}`);
      } catch (error) {
        console.error(error);
      } finally {
        setSaving(false);
      }
    },
    [createExam, logEvent, removeAccessCode, removeEditCode, setLocation, slug],
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
          <Description
            onChange={(event) => {
              if (event.target.checkValidity()) {
                event.target.setAttribute("aria-invalid", "false");
              } else {
                event.target.setAttribute("aria-invalid", "true");
              }
            }}
            defaultValue={
              USE_DUMMY_DATA
                ? "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent ut libero diam. Maecenas venenatis facilisis ex, in consectetur ipsum. Vivamus at ipsum semper nulla facilisis efficitur. Donec quis nibh hendrerit, elementum urna id, porttitor dui. Nullam egestas nisi vitae ligula vestibulum tristique. Etiam luctus iaculis tortor, vel laoreet nulla condimentum et. Cras risus metus, sagittis et sollicitudin eu, ullamcorper non erat. Quisque pulvinar leo a lectus finibus blandit. Donec ipsum nulla, consequat ac massa sit amet, rutrum semper urna. Nulla dapibus nunc a magna vulputate, quis accumsan tortor vehicula. Ut tristique arcu ac orci aliquet aliquet. Vestibulum cursus eros sed ullamcorper dictum. Vestibulum vitae scelerisque turpis. Sed tristique est massa, eu gravida nulla porta sit amet. Pellentesque urna erat, euismod vitae risus eget, convallis consequat lectus."
                : undefined
            }
          />
          <Email
            defaultValue={USE_DUMMY_DATA ? "hongaar@gmail.com" : undefined}
            onChange={(event) => {
              if (event.target.checkValidity()) {
                event.target.setAttribute("aria-invalid", "false");
              } else {
                event.target.setAttribute("aria-invalid", "true");
              }
            }}
            helper="We'll send you a link so you can edit this exam later. Also, we'll
              never share your email with anyone else."
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
