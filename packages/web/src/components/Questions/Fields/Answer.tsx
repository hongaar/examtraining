import { Answer as AnswerType } from "@examtraining/core";
import { STRING_MAX_LENGTH } from "../../../api";

type Props = {
  answer?: AnswerType;
  inputRef?: React.MutableRefObject<HTMLInputElement | undefined>;
  onChange: (value: string) => void;
  onCorrect?: () => void;
  withRemove?: boolean;
  onRemove?: () => void;
};

export function Answer({
  answer,
  inputRef,
  onChange,
  onCorrect,
  onRemove,
}: Props) {
  function handleChangeDescription(event: React.ChangeEvent<HTMLInputElement>) {
    if (answer) {
      if (event.target.checkValidity()) {
        event.target.setAttribute("aria-invalid", "false");
      } else {
        event.target.setAttribute("aria-invalid", "true");
      }
    }

    onChange(event.target.value);
  }

  function handleChangeCorrect(event: React.ChangeEvent<HTMLInputElement>) {
    onCorrect?.();
  }

  return (
    <div className="answer">
      <label>
        <input
          type="checkbox"
          name="correct"
          role="switch"
          aria-label="Correct"
          disabled={!answer}
          checked={answer?.correct}
          onChange={handleChangeCorrect}
        />
        {answer ? (
          answer.correct ? (
            "✅"
          ) : (
            "❌"
          )
        ) : (
          <span className="visually-hidden">❌</span>
        )}
      </label>
      <input
        ref={inputRef as any}
        type="text"
        name="description"
        placeholder={answer ? "The answer goes here" : "Add a new answer"}
        maxLength={STRING_MAX_LENGTH}
        aria-label="Answer"
        required={answer ? true : undefined}
        value={answer ? answer.description : ""}
        onChange={handleChangeDescription}
      />
      {answer ? (
        <>
          <button
            className="outline secondary"
            type="button"
            onClick={onRemove}
          >
            Remove
          </button>
        </>
      ) : null}
    </div>
  );
}
