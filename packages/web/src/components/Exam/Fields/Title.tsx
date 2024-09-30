import { TITLE_MAX_LENGTH } from "../../../api";

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
        type="text"
        placeholder="A short, descriptive title"
        aria-label="Title"
        aria-describedby="title-helper"
        required
        maxLength={TITLE_MAX_LENGTH}
        defaultValue={defaultValue}
        onChange={onChange}
      />
      {helper ? <small id="title-helper">{helper}</small> : undefined}
    </label>
  );
}
