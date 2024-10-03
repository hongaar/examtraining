import { Range } from "../..";

type Props = {
  defaultValue?: number;
};

export function Threshold({ defaultValue = 75 }: Props) {
  return (
    <label>
      Pass threshold
      <Range
        percentage
        name="threshold"
        aria-label="Threshold"
        aria-describedby="threshold-helper"
        required
        min={0}
        max={100}
        defaultValue={defaultValue}
      />
      <small id="threshold-helper">
        Determine the minimum percentage of questions which need a correct
        answer in order to pass the exam.
      </small>
    </label>
  );
}
