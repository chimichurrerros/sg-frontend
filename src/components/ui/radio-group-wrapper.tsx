// components/ui/radio-group-wrapper.tsx
import { RadioGroup, Stack } from "@chakra-ui/react";

interface RadioOption {
  label: string;
  value: string;
}

interface RadioGroupWrapperProps {
  options: RadioOption[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  direction?: "row" | "column";
  gap?: number;
}

export function RadioGroupWrapper({
  options,
  defaultValue,
  value,
  onValueChange,
  direction = "row",
  gap = 4,
}: RadioGroupWrapperProps) {
  return (
    <RadioGroup.Root
      value={value || defaultValue}
      onValueChange={(e: any) => onValueChange?.(e.value)}
    >
      <Stack direction={direction} gap={gap}>
        {options.map((option) => (
          <RadioGroup.Item key={option.value} value={option.value}>
            <RadioGroup.ItemHiddenInput />
            <RadioGroup.ItemIndicator />
            <RadioGroup.ItemText>{option.label}</RadioGroup.ItemText>
          </RadioGroup.Item>
        ))}
      </Stack>
    </RadioGroup.Root>
  );
}