type Props = {
  defaultValue?: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  helper?: string;
};

export function Title({ defaultValue, onChange, helper }: Props) {
  return (
    <label>
      Title
      <input
        name="title"
        placeholder="A short, descriptive title"
        aria-label="Title"
        aria-describedby="title-helper"
        required
        maxLength={50}
        defaultValue={defaultValue}
        onChange={onChange}
      />
      {helper ? <small id="title-helper">{helper}</small> : undefined}
    </label>
  );
}
