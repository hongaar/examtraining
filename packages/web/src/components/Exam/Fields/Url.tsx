import { Delayed } from "../../Delayed";

type Props = {
  busy?: boolean;
  slug: string;
  invalid?: boolean;
};

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
        value={`examtraining.online/${slug}`}
      />
      <small id="slug-helper">This will be the URL of the exam.</small>
    </label>
  );
}
