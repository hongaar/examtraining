import { InputHTMLAttributes } from "react";
import { ControlledInput } from "./ControlledInput";

type Props = { percentage?: boolean } & InputHTMLAttributes<HTMLInputElement>;

export function Range({ className, percentage = false, ...props }: Props) {
  return (
    <ControlledInput
      {...props}
      type="range"
      className={`${className}${percentage ? " percentage" : ""}`}
    />
  );
}
