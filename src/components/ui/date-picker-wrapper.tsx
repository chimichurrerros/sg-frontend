import { DatePicker, Portal } from "@chakra-ui/react";
import { LuCalendar } from "react-icons/lu";
import { parseDate } from "@chakra-ui/react";

export function DatePickerWrapper(
    { width, onChange, placeholder, value, readOnly =false}:
    { 
        value: string | null | undefined;
        width?: string;
        onChange: (date: string[]) => void;
        placeholder?: string;
        readOnly?: boolean;
    }
) {
    return (
        <DatePicker.Root
            width={width || "100%"}
            value={value ? [parseDate(value)] : []}
            onValueChange={(e) => onChange(e.value[0]?.toString() ? [e.value[0].toString()] : [])}
            readOnly={readOnly}
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