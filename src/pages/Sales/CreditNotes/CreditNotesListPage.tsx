import { Box } from "@chakra-ui/react/box";
import { Button, DatePicker, HStack, IconButton, Input, Portal, Text, type DateValue } from "@chakra-ui/react";
import { CalendarOff, ExternalLink, FileText } from "lucide-react";
import React, { useRef, useState } from "react";
import TableSelect, { type label } from "@/components/ui/table-select";
import PaginationControl from "@/components/ui/pagination-control";
import EmptyDataScreen from "@/components/ui/screens/empty-data-screen";
import { useNavigate } from "react-router-dom";
import PageSizeControl from "@/components/ui/page-size-control";
import { parsePrice } from "@/constants/price";
import { parseDate } from "@/constants/date";
import { DatePickerWrapper } from "@/components/ui/date-picker-wrapper";
import { parseDate as parseDateChakra } from "@chakra-ui/react"
import { useGetCreditNotes } from "@/queries/credit-notes.queries";
import type { CreditNote, GetCreditNoteParams } from "@/api/credit-notes-api";
import { LuCalendar } from "react-icons/lu";

export default function CreditNotesPage() {
    const [selected, setSelected] = React.useState<CreditNote | null>(null);
    const [params, setParams] = useState<GetCreditNoteParams>({ page: 1, pageSize: 10 });
    const { data: creditNotesData, isPending, isError, error } = useGetCreditNotes(params);
    const navigate = useNavigate();

    const labels: label<CreditNote>[] = [
        { labelName: "ID", propName: "id", isSortable: true, sortFunction: (a, b) => a.id - b.id },
        { labelName: "Nº Factura", propName: "billNumber", isSortable: true, sortFunction: (a, b) => a.billNumber.localeCompare(b.billNumber) },
        { labelName: "Cliente", propName: "customerName", isSortable: true, sortFunction: (a, b) => a.customerName.localeCompare(b.customerName) },
        { labelName: "RUC", propName: "customerRuc", isSortable: true, sortFunction: (a, b) => a.customerRuc.localeCompare(b.customerRuc) },
        { labelName: "Fecha", propName: "date", transformFunction: (value) => parseDate(value), isSortable: true, sortFunction: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() },
        {
            labelName: "Motivo", propName: "reason", isSortable: true, transformFunction: (value: string) => {
                return value ? value.length > 50 ? `${value.substring(0, 50)}...` : value : "-";
            }, sortFunction: (a, b) => a.reason.localeCompare(b.reason)
        },
        { labelName: "Total", propName: "total", transformFunction: (value) => parsePrice(value), isSortable: true, sortFunction: (a, b) => a.total - b.total },
    ];

    function handlePageChange(newPage: number) {
        if (!creditNotesData?.pagination) return;
        if (newPage > creditNotesData.pagination.totalPages || newPage < 1) return;
        setParams({ ...params, page: newPage });
    }
    const dateRangeRef = useRef<{ min: string; max: string }>({
        min: params.minDate || "",
        max: params.maxDate || ""
    });

    const getInitialDateRange = (): DateValue[] => {
        const dates: DateValue[] = [];
        if (params.minDate) dates.push(parseDateChakra(params.minDate));
        if (params.maxDate) dates.push(parseDateChakra(params.maxDate));
        return dates;
    };

    return (
        <Box padding={5} display="flex" flexDirection="column" gap={4}>
            <Text fontWeight="bold" fontSize="3xl">Listado de Notas de Crédito</Text>

            <Box display="flex" flexDirection="row" gap={2} justifyContent="space-between" alignItems="center">
                <Box display="flex" flexDirection="row" gap={2} alignItems="center">
                    <Text fontSize="sm" color="gray.500"> Registros por página: </Text>
                    <PageSizeControl paramsChangeFunction={setParams} params={params} max={30} min={5} />
                </Box>
                <Box display="flex" flexDirection="row" gap={2}>
                    <IconButton padding={2} variant="subtle" disabled={!selected} onClick={() => navigate(`/ventas/notas-de-credito/${selected?.id}`)}>
                        <FileText size={20} />
                        Ver Detalle
                    </IconButton>
                    <IconButton padding={2} variant="outline" disabled={!selected} onClick={() => navigate(`/ventas/facturas/${selected?.billId}`)}>
                        <ExternalLink size={20} />
                        Ver Factura Asociada
                    </IconButton>
                </Box>
            </Box>

            <Box borderWidth="1px" borderRadius="lg" py={3} px={6}>
                <Text mb={1} fontSize="md" fontWeight="bold">Filtros</Text>
                <Box
                    bg="white"
                    alignItems="center"
                    display="flex"
                    flexDirection="row"
                    gap={4}
                    flexWrap="wrap"
                >
                    <Input
                        placeholder="Número de factura..."
                        width={"15%"}
                        value={params.billNumber || ""}
                        onChange={(e) => setParams({ ...params, billNumber: e.target.value, page: 1 })}
                    />
                    <Input
                        placeholder="Nombre del cliente..."
                        width={"20%"}
                        value={params.customerName || ""}
                        onChange={(e) => setParams({ ...params, customerName: e.target.value, page: 1 })}
                    />
                    <Input
                        placeholder="RUC del cliente..."
                        width={"15%"}
                        value={params.customerRuc || ""}
                        onChange={(e) => setParams({ ...params, customerRuc: e.target.value, page: 1 })}
                    />
                    <Input
                        placeholder="Motivo..."
                        width={"20%"}
                        value={params.reason || ""}
                        onChange={(e) => setParams({ ...params, reason: e.target.value, page: 1 })}
                    />
                    <DatePickerWrapper
                        value={params.date}
                        width={"15%"}
                        placeholder="Fecha exacta"
                        onChange={(dates: string[]) => setParams({ ...params, date: dates[0], page: 1 })}
                    />
                    <DatePicker.Root
                        selectionMode="range"
                        maxWidth="300px"
                        defaultValue={getInitialDateRange()}
                        value={[params.minDate ? parseDateChakra(params.minDate) : undefined, params.maxDate ? parseDateChakra(params.maxDate) : undefined]}
                        onValueChange={(e) => {
                            const min = e.value[0]?.toString() || "";
                            const max = e.value[1]?.toString() || "";
                            dateRangeRef.current = { min, max };
                            setParams({ ...params, minDate: min, maxDate: max, page: 1 });
                        }}
                    >
                        <DatePicker.Control>
                            <DatePicker.Input index={0} placeholder="Fecha desde" />
                            <DatePicker.Input index={1} placeholder="Fecha hasta" />
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
                    {/* <DatePickerWrapper
                        value={params.minDate}
                        width={"15%"}
                        placeholder="Fecha desde"
                        onChange={(dates: string[]) => setParams({ ...params, minDate: dates[0], page: 1 })}
                    />
                    <DatePickerWrapper
                        value={params.maxDate}
                        width={"15%"}
                        placeholder="Fecha hasta"
                        onChange={(dates: string[]) => setParams({ ...params, maxDate: dates[0], page: 1 })}
                    /> */}
                    <HStack justify="flex-end">
                        <Button colorScheme="gray" onClick={() => setParams({ page: 1, pageSize: 10 })}>
                            Limpiar
                        </Button>
                    </HStack>
                </Box>
            </Box>

            <Box display="flex" flexDirection="column" gap={5} alignContent="center" w="full">
                <TableSelect
                    labels={labels}
                    data={creditNotesData?.creditNotes || []}
                    onSelect={(item: CreditNote | null) => setSelected(item)}
                    onDoubleClick={(item: CreditNote) => navigate(`/ventas/notas-de-credito/${item.id}`)}
                    loading={isPending}
                    error={error}
                    isError={isError}
                    maxHeight="60vh"
                    noItemsComponent={
                        <EmptyDataScreen
                            title="Sin Notas de Crédito"
                            message="No hay notas de crédito disponibles para mostrar, crea una nueva o limpia los filtros de búsqueda"
                            icon={<CalendarOff size={32} />}
                        />
                    }
                />
                <PaginationControl
                    pagination={creditNotesData?.pagination || null}
                    variant={"outline"}
                    buttonColor="brand.secondary"
                    onPageChange={handlePageChange}
                    btnSize={"sm"}
                />
            </Box>
        </Box>
    );
}