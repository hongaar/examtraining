type Props = {
  defaultValue?: number;
};

export function Threshold({ defaultValue = 75 }: Props) {
  return (
    <label>
      Pass threshold
      <input
        name="threshold"
        type="range"
        aria-label="Threshold"
        aria-describedby="threshold-helper"
        required
        min={0}
        max={100}
        defaultValue={defaultValue}
        onChange={(event) => {
          event.target.setAttribute("data-tooltip", `${event.target.value}%`);
        }}
        data-tooltip={`${defaultValue}%`}
      />
      <small id="threshold-helper">
        Determine the minimum percentage of questions which need a correct
        answer in order to pass the exam.
      </small>
    </label>
  );
}
