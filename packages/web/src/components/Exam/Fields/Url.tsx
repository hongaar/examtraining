import { Delayed } from "../../Delayed";

type Props = {
  busy?: boolean;
  slug: string;
  invalid?: boolean;
};

function getUrlPrefix() {
  // Returns current protocol, hostname and port (if not 80 or 443)
  return `${window.location.protocol}//${window.location.hostname}${
    window.location.port ? `:${window.location.port}` : ""
  }`;
}

export function Url({ busy, slug, invalid }: Props) {
  return (
    <label>
      URL
      {busy ? (
        <Delayed>
          <div>
            <small aria-busy="true">Checking if URL is available...</small>
          </div>
        </Delayed>
      ) : null}
      <input
        name="slug"
        placeholder="Slug"
        aria-label="Slug"
        aria-describedby="slug-helper"
        aria-invalid={invalid}
        readOnly
        disabled
        value={`${getUrlPrefix()}/${slug}`}
      />
      <small id="slug-helper">This will be the URL of the exam.</small>
    </label>
  );
}
