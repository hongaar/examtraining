type Props = {
  defaultChecked?: boolean;
};

export function Private({ defaultChecked }: Props) {
  return (
    <label>
      <input
        name="private"
        type="checkbox"
        role="switch"
        defaultChecked={defaultChecked}
      />
      Private exam
      <small id="email-helper">
        <br />
        Make this exam private. This will require students to use a unique link
        or enter an access code which we'll also both send to your email.
      </small>
    </label>
  );
}
