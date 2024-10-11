type Props = {
  defaultValue?: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export function Email({ defaultValue, onChange }: Props) {
  return (
    <label>
      Email address
      <input
        type="email"
        name="email"
        placeholder="Email address"
        autoComplete="email"
        aria-label="Email address"
        aria-describedby="email-helper"
        required
        defaultValue={defaultValue}
        onChange={onChange}
      />
      <small id="title-helper">
        We'll send you a link so you can edit this exam later. Of course, we'll
        never share your email address with anyone else.
      </small>
    </label>
  );
}
