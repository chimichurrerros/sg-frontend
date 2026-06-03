import {
  Combobox,
  Portal,
  createListCollection,
} from "@chakra-ui/react";
import { useState, useMemo, useEffect } from "react";
import { X } from "lucide-react";

interface ComboboxWrapperProps<T extends string = string> {
  placeholder?: string;
  label?: string;
  options: { label: string; value: T }[];
  width?: string;
  defaultValue?: T;
  value?: T;
  onValueChange?: (value: T) => void;
  clearable?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  onClear?: () => void;
}

export function ComboboxWrapper<T extends string>({
  placeholder = "Buscar...",
  label,
  options,
  width = "320px",
  defaultValue,
  value,
  disabled = false,
  clearable = false,
  hidden = false,
  onClear,
  onValueChange,
}: ComboboxWrapperProps<T>) {
  const [inputValue, setInputValue] = useState("");
  
  const [selectedValue, setSelectedValue] = useState<T | undefined>(value || defaultValue);

  useEffect(() => {
    setSelectedValue(value);
    if (!value) {
      setInputValue("");
    }
  }, [value]);

  const filteredOptions = useMemo(() => {
    if (!inputValue) return options;
    const searchLower = inputValue.toLowerCase();
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(searchLower) ||
      opt.value.toLowerCase().includes(searchLower)
    );
  }, [options, inputValue]);

  const collection = createListCollection({ items: filteredOptions });

  const currentValue = selectedValue ? [selectedValue] : [];

  const handleValueChange = (e: { value: string[] }) => {
    const newValue = e.value[0] as T;
    setSelectedValue(newValue);
    onValueChange?.(newValue);
    setInputValue("");
  };

  const handleClear = () => {
    setSelectedValue(undefined);
    onValueChange?.("" as T);
    setInputValue("");
    onClear?.();
  };

  const hasValue = !!selectedValue && selectedValue !== "";

  return (
    <Combobox.Root
      collection={collection}
      onValueChange={handleValueChange}
      value={currentValue}
      width={width}
      inputValue={inputValue}
      onInputValueChange={(e) => setInputValue(e.inputValue)}
      disabled={disabled}
      hidden={hidden}
    >
      {label && <Combobox.Label>{label}</Combobox.Label>}
      <Combobox.Control>
        <Combobox.Input placeholder={placeholder} />
        <Combobox.IndicatorGroup>
          {clearable && hasValue && (
            <X
              size={14}
              cursor="pointer"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
            />
          )}
          <Combobox.Trigger />
        </Combobox.IndicatorGroup>
      </Combobox.Control>
      <Portal>
        <Combobox.Positioner>
          <Combobox.Content>
            {filteredOptions.length === 0 ? (
              <Combobox.Empty>No hay resultados</Combobox.Empty>
            ) : (
              collection.items.map((item) => (
                <Combobox.Item item={item} key={item.value}>
                  {item.label}
                  <Combobox.ItemIndicator />
                </Combobox.Item>
              ))
            )}
          </Combobox.Content>
        </Combobox.Positioner>
      </Portal>
    </Combobox.Root>
  );
}