import { useRef } from "react";
import { DEFAULT_EXPLANATION_PROMPT, STRING_MAX_LENGTH } from "../../../api";

type Props = {
  className?: string;
  defaultValue?: string | null;
};

export function ExplanationPrompt({ className, defaultValue }: Props) {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <label className={className}>
      Explanation prompt
      <textarea
        ref={textAreaRef}
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
        students.{" "}
        <a
          className="contrast"
          href="."
          onClick={(event) => {
            event.preventDefault();
            if (textAreaRef.current) {
              textAreaRef.current.value = DEFAULT_EXPLANATION_PROMPT;
            }
          }}
        >
          Reset to default prompt
        </a>
        .{" "}
        <a
          className="contrast"
          href="https://platform.openai.com/docs/guides/prompt-engineering"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn more about prompt engineering
        </a>
        .
      </small>
    </label>
  );
}
