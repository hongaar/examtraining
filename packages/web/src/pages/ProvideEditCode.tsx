import { useState } from "react";
import { useLocalStorage } from "usehooks-ts";
import { Footer, Header, Main } from "../components";

type Props = {
  returnTo: string;
};

export function ProvideEditCode({ returnTo }: Props) {
  console.debug("Rendering page ProvideEditCode");

  const [busy, setBusy] = useState(false);
  const [editCode, setEditCode] = useLocalStorage("editCode", "");

  return (
    <>
      <Header>Provide edit code</Header>
      <Main>
        <article>
          <form
            onSubmit={(e) => {
              e.preventDefault();

              setBusy(true);

              const form = e.target as HTMLFormElement;
              const formData = new FormData(form);
              const editCode = String(formData.get("editCode")).toLowerCase();

              setEditCode(editCode);

              window.location.href = returnTo;
            }}
          >
            <div>
              The edit code was sent by email when the exam was created.
              <br />
              <br />
            </div>
            <fieldset role="group">
              <input
                name="editCode"
                type="text"
                required
                placeholder="Enter the edit code to edit this exam"
                aria-label="Edit code"
                aria-describedby="edit-code-helper"
                aria-invalid={!busy && editCode ? "true" : undefined}
                onChange={(event) => {
                  if (event.target.checkValidity()) {
                    event.target.setAttribute("aria-invalid", "false");
                  } else {
                    event.target.setAttribute("aria-invalid", "true");
                  }
                }}
              />
              <button
                type="submit"
                disabled={busy}
                aria-busy={busy ? "true" : "false"}
              >
                Edit exam
              </button>
            </fieldset>{" "}
            {!busy && editCode ? (
              <small id="edit-code-helper" className="invalid">
                The edit code you provided is incorrect.
              </small>
            ) : null}
          </form>
        </article>
      </Main>
      <Footer />
    </>
  );
}
