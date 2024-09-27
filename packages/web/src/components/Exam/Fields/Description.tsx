type Props = {
  defaultValue?: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  helper?: string;
};

export function Description({ defaultValue, onChange, helper }: Props) {
  return (
    <label>
      Description
      <textarea
        name="description"
        placeholder="A longer description"
        aria-label="Description"
        aria-describedby="description-helper"
        defaultValue={defaultValue}
        maxLength={500}
        rows={5}
        onChange={onChange}
      />
      {helper ? <small id="title-helper">{helper}</small> : undefined}
    </label>
  );
}
