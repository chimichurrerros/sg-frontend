import { Box } from "@chakra-ui/react/box";
import { Button, DatePicker, HStack, IconButton, Input, Portal, Text, type DateValue } from "@chakra-ui/react";
import { CalendarOff, ExternalLink, FolderOpen, HandCoins } from "lucide-react";
import React, { useRef, useState } from "react";
import TableSelect, { type label } from "@/components/ui/table-select";
import PaginationControl from "@/components/ui/pagination-control";
import EmptyDataScreen from "@/components/ui/screens/empty-data-screen";
import { useNavigate } from "react-router-dom";
import PageSizeControl from "@/components/ui/page-size-control";
import { parsePrice } from "@/constants/price";
import { parseDate } from "@/constants/date";
import { parseDate as parseDateChakra } from "@chakra-ui/react";
import { DatePickerWrapper } from "@/components/ui/date-picker-wrapper";
import { ComboboxWrapper } from "@/components/ui/combobox-wrapper";
import type { SaleReturn, SaleReturnParams } from "@/api/returns.api";

import { useGetSalesReturns } from "@/queries/sales-return.queries";
import { useAllBranches } from "@/queries/branches.queries";
import { LuCalendar } from "react-icons/lu";
export default function ReturnsPage() {
    const [selected, setSelected] = React.useState<SaleReturn | null>(null);
    const [params, setParams] = useState<SaleReturnParams>({ page: 1, pageSize: 10 });
    const { data: returnsData, isPending, isError, error } = useGetSalesReturns(params);
    const navigate = useNavigate();

    const labels: label<SaleReturn>[] = [
        { labelName: "ID", propName: "id", isSortable: true, sortFunction: (a, b) => a.id - b.id },
        { labelName: "Nº Pedido", propName: "salesOrderNumber", isSortable: true, sortFunction: (a, b) => a.salesOrderNumber.localeCompare(b.salesOrderNumber) },
        { labelName: "Cliente", propName: "customerName", isSortable: true, sortFunction: (a, b) => a.customerName.localeCompare(b.customerName) },
        { labelName: "RUC", propName: "customerRuc", isSortable: true, sortFunction: (a, b) => a.customerRuc.localeCompare(b.customerRuc) },
        { labelName: "Sucursal", propName: "branchName", isSortable: true, sortFunction: (a, b) => a.branchName.localeCompare(b.branchName) },
        { labelName: "Fecha", propName: "date", transformFunction: (value) => parseDate(value), isSortable: true, sortFunction: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() },
        { labelName: "Motivo", propName: "reason", isSortable: true, transformFunction: (value: string) => value.length > 50 ? `${value.substring(0, 50)}...` : value, sortFunction: (a, b) => a.reason.localeCompare(b.reason) },
        { labelName: "Total", propName: "total", transformFunction: (value) => parsePrice(value), isSortable: true, sortFunction: (a, b) => a.total - b.total },
    ];

    const { data: branches, isPending: isBranchesPending } = useAllBranches();

    function handlePageChange(newPage: number) {
        if (!returnsData?.pagination) return;
        if (newPage > returnsData.pagination.totalPages || newPage < 1) return;
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
            <Text fontWeight="bold" fontSize="3xl">Listado de Devoluciones</Text>

            {/* Buttons and filters */}
            <Box display="flex" flexDirection="row" gap={2} justifyContent="space-between" alignItems="center">
                <Box display="flex" flexDirection="row" gap={2} alignItems="center">
                    <Text fontSize="sm" color="gray.500"> Registros por página: </Text>
                    <PageSizeControl paramsChangeFunction={setParams} params={params} max={30} min={5} />
                </Box>
                <Box display="flex" flexDirection="row" gap={2}>
                    <IconButton padding={2} variant="subtle" disabled={!selected} onClick={() => navigate(`/ventas/devoluciones/${selected?.id}`)}>
                        <FolderOpen size={20} />
                        Ver Detalle
                    </IconButton>
                    <IconButton padding={2} variant="outline" disabled={!selected} onClick={() => navigate(`/ventas/${selected?.salesOrderId}`)}>
                        <ExternalLink size={20} />
                        Ver Venta Asociada
                    </IconButton>
                    <IconButton padding={2} bgColor="brand.primary" onClick={() => navigate("/ventas/devoluciones/crear")}>
                        <HandCoins size={20} />
                        Nueva Devolución
                    </IconButton>
                </Box>
            </Box>

            {/* Filters */}
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
                        placeholder="Número de pedido..."
                        width={"15%"}
                        value={params.salesOrderNumber || ""}
                        onChange={(e) => setParams({ ...params, salesOrderNumber: e.target.value, page: 1 })}
                    />
                    <Input
                        placeholder="Nombre del cliente..."
                        width={"20%"}
                        value={params.customerName || ""}
                        onChange={(e) => setParams({ ...params, customerName: e.target.value, page: 1 })}
                    />
                    <Input
                        placeholder="RUC del cliente..."
                        width={"20%"}
                        value={params.customerRuc || ""}
                        onChange={(e) => setParams({ ...params, customerRuc: e.target.value, page: 1 })}
                    />
                    <ComboboxWrapper
                        options={branches ? branches.branches.map((branch) => ({ label: branch.name, value: branch.id.toString() })) : []}
                        disabled={isBranchesPending}
                        placeholder="Seleccionar Sucursal..."
                        onValueChange={(value) => setParams({ ...params, branchId: value ? parseInt(value) : undefined, page: 1 })}
                        value={params.branchId?.toString()}
                        clearable={true}
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
                        value = {[params.minDate ? parseDateChakra(params.minDate) : undefined, params.maxDate ? parseDateChakra(params.maxDate) : undefined]}
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

            {/* Table */}
            <Box display="flex" flexDirection="column" gap={5} alignContent="center" w="full">
                <TableSelect
                    labels={labels}
                    data={returnsData?.salesReturns || []}
                    onSelect={(item: SaleReturn | null) => setSelected(item)}
                    onDoubleClick={(item: SaleReturn) => navigate(`/ventas/devoluciones/${item.id}`)}
                    loading={isPending}
                    error={error}
                    isError={isError}
                    maxHeight="60vh"
                    noItemsComponent={
                        <EmptyDataScreen
                            title="Sin Devoluciones"
                            message="No hay devoluciones disponibles para mostrar, crea una nueva o limpia los filtros de búsqueda"
                            icon={<CalendarOff size={32} />}
                        />
                    }
                />
                <PaginationControl
                    pagination={returnsData?.pagination || null}
                    variant={"outline"}
                    buttonColor="brand.secondary"
                    onPageChange={handlePageChange}
                    btnSize={"sm"}
                />
            </Box>
        </Box>
    );
}