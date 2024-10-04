import CreatableSelect from "react-select/creatable";

type Props = {
  options?: string[];
  defaultValue?: string[];
};

export function Category({ options = [], defaultValue }: Props) {
  return (
    <label>
      Categories
      <CreatableSelect
        className="select"
        classNamePrefix="select"
        isMulti
        options={
          options.map((option) => ({ value: option, label: option })) as any
        }
        name="categories"
        placeholder="Categories"
        aria-label="Categories"
        aria-describedby="categoryieshelper"
        defaultValue={
          defaultValue?.map((option) => ({
            value: option,
            label: option,
          })) as any
        }
      />
      <small id="categoryies-helper">
        Optional. Assign a category to a question. Students can choose to train
        only on certain categories. You can start typing and press{" "}
        <kbd>Enter</kbd> to add a new category.
      </small>
    </label>
  );
}
