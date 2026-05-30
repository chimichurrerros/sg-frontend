import { InputGroup, NumberInput } from "@chakra-ui/react"

export interface CurrencyInputProps {
  value?: string | number
  onValueChange?: (value: number) => void
  disabled?: boolean
  invalid?: boolean
  min?: number
}

export function CurrencyInput({
  value,
  onValueChange,
  disabled = false,
  invalid = false,
  min,
}: CurrencyInputProps) {
  return (
    <NumberInput.Root
      value={String(value ?? 0)}
      onValueChange={(details) => onValueChange?.(details.valueAsNumber)}
      formatOptions={{ style: "decimal" }}
      locale="es-PY"
      min={min}
      disabled={disabled}
      invalid={invalid}
    >
      <InputGroup startElement="Gs.">
        <NumberInput.Input />
      </InputGroup>
    </NumberInput.Root>
  )
}
