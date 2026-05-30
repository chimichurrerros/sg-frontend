import { Box } from "@chakra-ui/react/box";
import { Button, DatePicker, Grid, GridItem, HStack, IconButton, Input, InputGroup, NumberInput, Portal, Select, Text, VStack } from "@chakra-ui/react";
import { LuCalendar } from "react-icons/lu";
import { CalendarOff, CalendarPlus, DollarSign, ExternalLink, FolderOpen, Heading } from "lucide-react";
import React, { useState } from "react";
import TableSelect, { type label } from "@/components/ui/table-select";
import PaginationControl from "@/components/ui/pagination-control";
import EmptyDataScreen from "@/components/ui/screens/empty-data-screen";
import { useNavigate } from "react-router-dom";
import type { CustomerQuote, CustomerQuotesParams } from "@/api/customer-quotes.api";
import { useCustomerQuotes } from "@/queries/customer-quotes.queries";
import PageSizeControl from "@/components/ui/page-size-control";
import { parsePrice } from "@/constants/price";
import { parseDate } from "@/constants/date";
import { DatePickerWrapper } from "@/components/ui/date-picker-wrapper";
import { ComboboxWrapper } from "@/components/ui/combobox-wrapper";
import { useGetAllCustomers } from "@/queries/customers.queries";


export default function BudgetsPage() {
    const [selected, setSelected] = React.useState<CustomerQuote | null>(null);
    const [params, setParams] = useState<CustomerQuotesParams>({ page: 1, pageSize: 10 })
    const { data: budgets, isPending, isError, error } = useCustomerQuotes(params)
    const navigate = useNavigate()

    const labels: label<CustomerQuote>[] = [
        { labelName: "ID", propName: "id", isSortable: true, sortFunction: (a, b) => a.id - b.id },
        { labelName: "Número", propName: "number", isSortable: true, sortFunction: (a, b) => a.number.localeCompare(b.number) },
        { labelName: "Cliente", propName: "customerName", isSortable: true, sortFunction: (a, b) => a.customerName.localeCompare(b.customerName) },
        { labelName: "Fecha", propName: "date", transformFunction: (value) => parseDate(value), isSortable: true, sortFunction: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() },
        { labelName: "Creado por", propName: "userName", isSortable: true, sortFunction: (a, b) => a.userName.localeCompare(b.userName) },
        {labelName: "Fecha Expiración", propName: "expirationDate",transformFunction: (value) => parseDate(value), isSortable: true, sortFunction: (a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime() },
        { labelName: "Total", propName: "importValue", transformFunction: (value) => parsePrice(value), isSortable: true, sortFunction: (a, b) => a.importValue - b.importValue },
    ];

    const { data: customers, isPending: isCustomersPending } = useGetAllCustomers()
    function handlePageChange(newPage: number) {
        if (!budgets?.pagination) return;
        if (newPage > budgets.pagination.totalPages || newPage < 1) return;
        setParams({ ...params, page: newPage });
    }
    return (
        <Box padding={5} display="flex" flexDirection="column" gap={4}>
            <Text fontWeight="bold" fontSize="3xl">Listado de Presupuestos</Text>
            {/* Buttons and filters */}
            <Box display="flex" flexDirection="row" gap={2} justifyContent="space-between" alignItems="center">
                <Box display="flex" flexDirection="row" gap={2} alignItems="center">
                    <Text fontSize="sm" color="gray.500"> Registros por página: </Text>
                    <PageSizeControl paramsChangeFunction={setParams} params={params} max={30} min={5} />
                </Box>
                <Box display="flex" flexDirection="row" gap={2}>
                    <IconButton padding={2} variant="subtle" disabled={!selected || !selected.associatedSalesOrderId} onClick={() => navigate(`/ventas/${selected?.associatedSalesOrderId}`)}>
                        <ExternalLink size={20} />
                        Ver Venta Asociada
                    </IconButton>
                    <IconButton padding={2} variant="outline" disabled={!selected} onClick={() => navigate(`/ventas/presupuestos/${selected?.id}`)}>
                        <FolderOpen size={20} />
                        Abrir Ficha
                    </IconButton>
                    <IconButton padding={2} bgColor="brand.secondary" disabled={!selected}>
                        <DollarSign size={20} />
                        Aprobar presupuesto
                    </IconButton>
                    <IconButton padding={2} bgColor="brand.primary" onClick={() => navigate("/ventas/presupuestos/crear")}>
                        <CalendarPlus size={20} />
                        Nuevo
                    </IconButton>
                </Box>
            </Box>

            {/* Filters */}
            <Box borderWidth="1px"
                borderRadius="lg" py={3} px={6}>
                <Text mb={1} fontSize="md" fontWeight="bold">Filtros</Text>
                <Box


                    bg="white"
                    alignItems="center"
                    display="flex"
                    flexDirection="row"
                    gap={4}
                >
                    <ComboboxWrapper
                        options={customers ? customers.map((customer) => ({ label: customer.name, value: customer.id.toString() })) : []}
                        disabled={isCustomersPending} placeholder="Seleccionar Cliente..."
                        onValueChange={(value) => setParams({ ...params, customerId: value ? parseInt(value) : undefined })}
                        value={params.customerId?.toString()}
                        clearable={true}
                    />
                    <Input placeholder="Por nombre de cliente" width={"30%"}
                        value={params.customerName || ""}
                        onChange={(e) => setParams({ ...params, customerName: e.target.value })} />
                    <DatePickerWrapper
                        value={params.date} width={"20%"}
                        placeholder="Fecha de creación"
                        onChange={(dates: string[]) => setParams({ ...params, date: dates[0] })} />
                    <DatePickerWrapper
                        value={params.expirationDate} width={"20%"}
                        placeholder="Fecha de expiración"
                        onChange={(dates: string[]) => setParams({ ...params, expirationDate: dates[0] })} />
                    <HStack justify="flex-end">
                        <Button colorScheme="gray" onClick={() => setParams({ page: 1, pageSize: 10 })}>
                            Limpiar
                        </Button>
                    </HStack>
                </Box></Box>


            {/* Table */}
            <Box display="flex" flexDirection="column" gap={5} alignContent="center" w="full">
                <TableSelect
                    labels={labels}
                    data={budgets?.customerQuotes || []}
                    onSelect={(item: CustomerQuote | null) => setSelected(item)}
                    onDoubleClick={(item: CustomerQuote) => navigate(`/ventas/presupuestos/${item.id}`)}
                    loading={isPending}
                    error={error}
                    isError={isError}
                    maxHeight="60vh"
                    noItemsComponent={
                        <EmptyDataScreen
                            title="Sin Presupuestos"
                            message="No hay presupuestos disponibles para mostrar, crea uno nuevo o limpia los filtros de búsqueda"
                            icon={<CalendarOff size={32} />}
                        />
                    }
                />
                <PaginationControl
                    pagination={budgets?.pagination || null}
                    variant={"outline"}
                    buttonColor="brand.secondary"
                    onPageChange={handlePageChange}
                    btnSize={"sm"}
                />
            </Box>
        </Box>

    );
}