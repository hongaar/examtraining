import { InputHTMLAttributes, useState } from "react";

type Props = InputHTMLAttributes<HTMLInputElement>;

export function ControlledInput({ defaultValue, ...props }: Props) {
  const [value, setValue] = useState(defaultValue);
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(parseInt(event.target.value));
  };

  return <input value={value} onChange={handleChange} {...props} />;
}
