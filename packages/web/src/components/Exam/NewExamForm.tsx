import { FirestoreCollection, sluggify } from "@examtraining/core";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Functions, progress } from "../../api";
import { useCollectionOnce } from "../../hooks";
import { useFunction } from "../../hooks/useFunction";
import { Description, Email, Private, Title, Url } from "./Fields";

const DUMMY_DATA = true;

export function NewExamForm() {
  console.debug("Rendering component NewExamForm");

  const [slug, setSlug] = useState("");
  const [exams] = useCollectionOnce(FirestoreCollection.Exams);
  const createExam = useFunction(Functions.CreateExam);
  const [saving, setSaving] = useState(false);
  const [existingsSlugs, setExistingSlugs] = useState<string[]>([]);
  const [urlInvalid, setUrlInvalid] = useState<boolean | undefined>(undefined);
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (exams !== null) {
      setExistingSlugs(exams.map((exam) => exam.id));
    }
  }, [exams]);

  const addExam = useCallback(
    async function (event: FormEvent<HTMLFormElement>) {
      event.preventDefault();

      const data = new FormData(event.target as any);

      setSaving(true);
      try {
        await progress(
          createExam({
            title: data.get("title") as string,
            description: data.get("description") as string,
            owner: data.get("email") as string,
            private: data.get("private") === "on",
          }),
          "Creating exam",
        );
        setLocation(`/${slug}`);
      } catch (error) {
        console.error(error);
      } finally {
        setSaving(false);
      }
    },
    [createExam, setLocation, slug],
  );

  return (
    <form onSubmit={addExam}>
      <article>
        <fieldset>
          <Title
            defaultValue={DUMMY_DATA ? "Dit is een test" : undefined}
            onChange={(event) => {
              setSlug(sluggify(event.target.value));

              if (event.target.checkValidity()) {
                event.target.setAttribute("aria-invalid", "false");
              } else {
                event.target.setAttribute("aria-invalid", "true");
              }

              if (existingsSlugs.includes(sluggify(event.target.value))) {
                setUrlInvalid(true);
                event.target.setAttribute("aria-invalid", "true");
              } else {
                setUrlInvalid(undefined);
                event.target.setAttribute("aria-invalid", "false");
              }
            }}
            helper={
              urlInvalid
                ? "This URL for this name is already in use."
                : undefined
            }
          />
          <Url slug={slug} invalid={urlInvalid} />
          <Description
            onChange={(event) => {
              if (event.target.checkValidity()) {
                event.target.setAttribute("aria-invalid", "false");
              } else {
                event.target.setAttribute("aria-invalid", "true");
              }
            }}
            defaultValue={
              DUMMY_DATA
                ? "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent ut libero diam. Maecenas venenatis facilisis ex, in consectetur ipsum. Vivamus at ipsum semper nulla facilisis efficitur. Donec quis nibh hendrerit, elementum urna id, porttitor dui. Nullam egestas nisi vitae ligula vestibulum tristique. Etiam luctus iaculis tortor, vel laoreet nulla condimentum et. Cras risus metus, sagittis et sollicitudin eu, ullamcorper non erat. Quisque pulvinar leo a lectus finibus blandit. Donec ipsum nulla, consequat ac massa sit amet, rutrum semper urna. Nulla dapibus nunc a magna vulputate, quis accumsan tortor vehicula. Ut tristique arcu ac orci aliquet aliquet. Vestibulum cursus eros sed ullamcorper dictum. Vestibulum vitae scelerisque turpis. Sed tristique est massa, eu gravida nulla porta sit amet. Pellentesque urna erat, euismod vitae risus eget, convallis consequat lectus."
                : undefined
            }
          />
          <Email
            defaultValue={DUMMY_DATA ? "hongaar@gmail.com" : undefined}
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
              disabled={saving}
              aria-busy={saving ? "true" : "false"}
              type="submit"
            >
              Create
            </button>
          </fieldset>
        </footer>
      </article>
    </form>
  );
}
