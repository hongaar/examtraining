type Props = {
  slug: string;
  invalid?: boolean;
};

export function Url({ slug, invalid }: Props) {
  return (
    <label>
      URL
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
