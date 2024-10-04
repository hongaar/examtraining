import { STRING_MAX_LENGTH } from "../../../api";

type Props = {
  defaultValue?: string;
};

export function Explanation({ defaultValue }: Props) {
  return (
    <label>
      Explanation
      <textarea
        name="explanation"
        placeholder="The explanation"
        aria-label="Explanation"
        aria-describedby="explanation-helper"
        maxLength={STRING_MAX_LENGTH}
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
      <small id="explanation-helper">
        Optional. This will be shown after a question has been answered. You can
        use{" "}
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
