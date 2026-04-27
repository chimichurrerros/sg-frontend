import { Select, createListCollection } from "@chakra-ui/react";

interface SelectWrapperProps<T extends string = string> {
  placeholder?: string;
  options: { label: string; value: T }[];
  width?: string;
  defaultValue?: T;
  value?: T;
  onValueChange?: (value: T) => void;
}

export function SelectWrapper<T extends string>({
  placeholder,
  options,
  width = "200px",
  defaultValue,
  value,
  onValueChange,
}: SelectWrapperProps<T>) {
  const collection = createListCollection({
    items: options.map((opt) => ({
      label: opt.label,
      value: opt.value,
    })),
  });

  const selectedValue = value ? [value] : defaultValue ? [defaultValue] : undefined;

  return (
    <Select.Root
      collection={collection}
      value={selectedValue}
      onValueChange={(e) => onValueChange?.(e.value[0] as T)}
      width={width}
    >
      <Select.HiddenSelect />
      <Select.Control>
        <Select.Trigger>
          <Select.ValueText placeholder={placeholder} />
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