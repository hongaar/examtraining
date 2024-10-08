import { useRef } from "react";
import { STRING_MAX_LENGTH } from "../../../api";

type Props = {
  defaultValue?: string;
  addAnswers: (answers: string[]) => void;
};

function extractQuestionAndAnswers(text: string) {
  let question = "";
  const answers: string[] = [];

  const lines = text
    .trim()
    .split("\n")
    .map((line) => line.trim());

  let currentAnswerIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    // Check if the first line starts with a number followed by a dot or colon
    if (i === 0) {
      const match = lines[i].match(/^\d+[.:]?\s*(.+)$/);
      if (match) {
        question = match[1];
        continue;
      }
    }

    // Check if the line begins a new answer
    const answerMatch = lines[i].match(/^[-•a-zA-Z][.:]?\s+(.+)$/);
    if (answerMatch) {
      currentAnswerIndex++;
      answers[currentAnswerIndex] = answerMatch[1];
      continue;
    }

    if (currentAnswerIndex === -1) {
      question += "\n" + lines[i];
    } else {
      answers[currentAnswerIndex] += " " + lines[i];
    }
  }

  question = question.trim();

  return {
    question,
    answers,
  };
}

export function Description({ defaultValue, addAnswers }: Props) {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  function parsePastedText(text: string) {
    const { question, answers } = extractQuestionAndAnswers(text);

    addAnswers(answers);

    return question;
  }

  return (
    <label>
      Description
      <textarea
        ref={textAreaRef}
        name="description"
        placeholder="The question"
        aria-label="Description"
        aria-describedby="description-helper"
        required
        maxLength={STRING_MAX_LENGTH}
        rows={3}
        defaultValue={defaultValue}
        onPaste={(event) => {
          event.preventDefault();

          const target = event.target as HTMLTextAreaElement;
          const text = event.clipboardData.getData("text/plain");

          if (textAreaRef !== null && textAreaRef.current !== null) {
            // Clear selected text and replace it with the pasted text
            const selectionStart = textAreaRef.current.selectionStart;
            const selectionEnd = textAreaRef.current.selectionEnd;
            textAreaRef.current.value =
              textAreaRef.current.value.substring(0, selectionStart) +
              parsePastedText(text) +
              textAreaRef.current.value.substring(selectionEnd);
          }

          if (target.checkValidity()) {
            target.setAttribute("aria-invalid", "false");
          } else {
            target.setAttribute("aria-invalid", "true");
          }
        }}
        onChange={(event) => {
          if (event.target.checkValidity()) {
            event.target.setAttribute("aria-invalid", "false");
          } else {
            event.target.setAttribute("aria-invalid", "true");
          }
        }}
      />
      <small id="description-helper">
        This will be shown as the main question text.
      </small>
    </label>
  );
}
