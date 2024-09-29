type Props = {
  defaultValue?: string;
};

export function Description({ defaultValue }: Props) {
  return (
    <label>
      Description
      <textarea
        name="description"
        placeholder="The question"
        aria-label="Description"
        aria-describedby="description-helper"
        required
        maxLength={255}
        rows={3}
        defaultValue={defaultValue}
        onChange={(event) => {
          if (event.target.checkValidity()) {
            event.target.setAttribute("aria-invalid", "false");
          } else {
            event.target.setAttribute("aria-invalid", "true");
          }
        }}
      />
      <small id="description-helper">
        This will be shown as the main question text. You can use{" "}
        <a
          href="https://www.markdownguide.org/basic-syntax/"
          target="_blank"
          rel="noreferrer"
        >
          Markdown formatting
        </a>
        .
      </small>
    </label>
  );
}
