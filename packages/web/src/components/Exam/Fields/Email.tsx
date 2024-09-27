type Props = {
  defaultValue?: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  helper?: string;
};

export function Email({ defaultValue, onChange, helper }: Props) {
  return (
    <label>
      Email
      <input
        type="email"
        name="email"
        placeholder="Email"
        autoComplete="email"
        aria-label="Email"
        aria-describedby="email-helper"
        required
        defaultValue={defaultValue}
        onChange={onChange}
      />
      {helper ? <small id="title-helper">{helper}</small> : undefined}
    </label>
  );
}
