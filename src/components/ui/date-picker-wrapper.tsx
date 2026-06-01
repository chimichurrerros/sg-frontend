// src/components/ui/date-picker-wrapper.tsx
import { DatePicker, Portal } from "@chakra-ui/react";
import { LuCalendar } from "react-icons/lu";
import { parseDate } from "@chakra-ui/react"; // parseDate viene de Chakra UI

export function DatePickerWrapper(
    { width, onChange, placeholder, value }:
    { 
        value: string | null | undefined;
        width?: string;
        onChange: (date: string[]) => void;
        placeholder?: string;
    }
) {
    return (
        <DatePicker.Root
            locale="es-PY"
            width={width || "100%"}
            value={value ? [parseDate(value)] : []}
            onValueChange={(e) => onChange(e.value[0]?.toString() ? [e.value[0].toString()] : [])}
        >
            <DatePicker.Control>
                <DatePicker.Input placeholder={placeholder || "Fecha"} />
                <DatePicker.IndicatorGroup>
                    <DatePicker.Trigger>
                        <LuCalendar />
                    </DatePicker.Trigger>
                </DatePicker.IndicatorGroup>
            </DatePicker.Control>
            <Portal>
                <DatePicker.Positioner>
                    <DatePicker.Content>
                        <DatePicker.View view="day">
                            <DatePicker.Header />
                            <DatePicker.DayTable />
                        </DatePicker.View>
                        <DatePicker.View view="month">
                            <DatePicker.Header />
                            <DatePicker.MonthTable />
                        </DatePicker.View>
                        <DatePicker.View view="year">
                            <DatePicker.Header />
                            <DatePicker.YearTable />
                        </DatePicker.View>
                    </DatePicker.Content>
                </DatePicker.Positioner>
            </Portal>
        </DatePicker.Root>
    );
}