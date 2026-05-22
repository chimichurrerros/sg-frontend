import { Select, createListCollection } from "@chakra-ui/react";
import { useState, useEffect } from "react";

interface SelectWrapperProps<T extends string = string> {
  placeholder?: string;
  options: { label: string; value: T }[];
  width?: string;
  defaultValue?: T;
  value?: T;
  disabled?: boolean;
  onValueChange?: (value: T) => void;
}

export function SelectWrapper<T extends string>({
  placeholder,
  options,
  width = "200px",
  defaultValue,
  disabled = false,
  value,
  onValueChange,
}: SelectWrapperProps<T>) {
  const [internalValue, setInternalValue] = useState<T | undefined>(value ?? defaultValue);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const collection = createListCollection({
    items: options.map((opt) => ({ label: opt.label, value: opt.value })),
  });

  const selectedValue = internalValue ? [internalValue] : undefined;
  const selectedLabel = options.find(o => o.value === internalValue)?.label;

  return (
    <Select.Root
      collection={collection}
      value={selectedValue}
      onValueChange={(e) => {
        const val = e.value[0] as T;
        setInternalValue(val);
        onValueChange?.(val);
      }}
      width={width}
      disabled={disabled}
    >
      <Select.HiddenSelect />
      <Select.Control>
        <Select.Trigger height="auto" minHeight="2.5rem">
          <span style={{ whiteSpace: "normal", wordBreak: "break-word", flex: 1 }}>
            {selectedLabel ?? placeholder}
          </span>
          <Select.Indicator />
        </Select.Trigger>
      </Select.Control>
      <Select.Positioner>
        <Select.Content>
          {collection.items.map((item) => (
            <Select.Item item={item} key={item.value}>
              {item.label}
              <Select.ItemIndicator />
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Positioner>
    </Select.Root>
  );
}