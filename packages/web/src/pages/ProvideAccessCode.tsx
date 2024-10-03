import { useState } from "react";
import { useLocalStorage } from "usehooks-ts";
import { Footer, Header, Main } from "../components";

type Props = {
  returnTo: string;
};

export function ProvideAccessCode({ returnTo }: Props) {
  console.debug("Rendering page ProvideAccessCode");

  const [busy, setBusy] = useState(false);
  const [accessCode] = useLocalStorage("accessCode", "");

  return (
    <>
      <Header>Provide access code</Header>
      <Main>
        <article>
          <form
            onSubmit={(e) => {
              e.preventDefault();

              setBusy(true);

              const form = e.target as HTMLFormElement;
              const formData = new FormData(form);
              const accessCode = String(
                formData.get("accessCode"),
              ).toLowerCase();

              window.location.href = `${returnTo}?accessCode=${accessCode}`;
            }}
          >
            <p>This exam is private and requires an access code to view it.</p>
            <fieldset role="group">
              <input
                name="accessCode"
                type="text"
                required
                placeholder="Enter the access code to view this exam"
                aria-label="Access code"
                aria-describedby="access-code-helper"
                aria-invalid={accessCode ? "true" : undefined}
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
                View exam
              </button>
            </fieldset>{" "}
            {accessCode ? (
              <small id="access-code-helper" className="invalid">
                The access code you provided is incorrect.
              </small>
            ) : null}
          </form>
        </article>
      </Main>
      <Footer />
    </>
  );
}
