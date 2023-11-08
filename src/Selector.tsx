import React from "react";
import Select from "react-dropdown-select";
import { Nullable } from "./types";

type Props<T> = {
  options: T[];
  value?: Nullable<T>;
  onChange?: (arg?: T) => void;
  onCreate?: (arg?: T) => void;
  valueIndex?: string;
  labelIndex?: string;
  disabled?: boolean;
};

function Selector<T extends object>({
  valueIndex,
  labelIndex,
  options,
  onChange,
  onCreate,
  value,
  disabled,
}: Props<T>) {
  return (
    <Select
      create={Boolean(onCreate) ?? false}
      valueField={valueIndex && String(valueIndex)}
      labelField={labelIndex && String(labelIndex)}
      values={value ? [value] : []}
      onChange={(value: T[]) => {
        onChange?.(value && value.length ? value[0] : undefined);
      }}
      options={options}
      onCreateNew={onCreate}
      disabled={disabled}
    />
  );
}

export default React.memo(Selector);
