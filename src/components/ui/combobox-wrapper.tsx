// components/ui/combobox-wrapper.tsx
"use client";

import {
  Combobox,
  Portal,
  createListCollection,
} from "@chakra-ui/react";
import { useState, useMemo } from "react";

interface ComboboxWrapperProps<T extends string = string> {
  placeholder?: string;
  label?: string;
  options: { label: string; value: T }[];
  width?: string;
  defaultValue?: T;
  value?: T;
  onValueChange?: (value: T) => void;
  clearable?: boolean;
}

export function ComboboxWrapper<T extends string>({
  placeholder = "Buscar...",
  label,
  options,
  width = "320px",
  defaultValue,
  value,
  onValueChange,
}: ComboboxWrapperProps<T>) {
  const [inputValue, setInputValue] = useState("");

  // Filtrar opciones basado en el inputValue
  const filteredOptions = useMemo(() => {
    if (!inputValue) return options;
    const searchLower = inputValue.toLowerCase();
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(searchLower) ||
      opt.value.toLowerCase().includes(searchLower)
    );
  }, [options, inputValue]);

  const collection = createListCollection({
    items: filteredOptions,
  });

  const initialValue = value ? [value] : defaultValue ? [defaultValue] : undefined;

  const handleValueChange = (e: { value: string[] }) => {
    onValueChange?.(e.value[0] as T);
    setInputValue(""); // Limpiar búsqueda al seleccionar
  };

  return (
    <Combobox.Root
      collection={collection}
      onValueChange={handleValueChange}
      value={initialValue}
      width={width}
      inputValue={inputValue}
      onInputValueChange={(e) => setInputValue(e.inputValue)}
    >
      {label && <Combobox.Label>{label}</Combobox.Label>}
      <Combobox.Control>
        <Combobox.Input placeholder={placeholder} />
        <Combobox.IndicatorGroup>
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