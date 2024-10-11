type Props = {
  defaultChecked?: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export function AI({ defaultChecked, onChange }: Props) {
  return (
    <label>
      <input
        name="enableAI"
        type="checkbox"
        role="switch"
        defaultChecked={defaultChecked}
        onChange={onChange}
      />
      Enable ChatGPT explanations
    </label>
  );
}
