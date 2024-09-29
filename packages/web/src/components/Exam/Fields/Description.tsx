type Props = {
  defaultValue?: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
};

export function Description({ defaultValue, onChange }: Props) {
  return (
    <label>
      Description
      <textarea
        name="description"
        placeholder="A longer description"
        aria-label="Description"
        aria-describedby="description-helper"
        defaultValue={defaultValue}
        maxLength={1000}
        rows={5}
        onChange={onChange}
      />
      <small id="title-helper">
        A longer description of the exam. This is optional. You can use{" "}
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
