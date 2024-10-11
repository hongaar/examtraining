import { STRING_MAX_LENGTH } from "../../../api";

type Props = {
  className?: string;
  defaultValue?: string | null;
};

export function ExplanationPrompt({ className, defaultValue }: Props) {
  return (
    <label className={className}>
      Explanation prompt
      <textarea
        name="explanationPrompt"
        placeholder="Explanation prompt"
        aria-label="Explanation prompt"
        aria-describedby="explanationPrompt-helper"
        defaultValue={defaultValue || ""}
        maxLength={STRING_MAX_LENGTH}
        rows={5}
      />
      <small id="explanationPrompt-helper">
        A system message which is added to the prompt when a students asks for
        an explanation of a question using ChatGPT. This is not visible to the
        students.
      </small>
    </label>
  );
}
