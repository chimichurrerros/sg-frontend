import { useNavigate } from "react-router-dom";
import TableSelect, { type label } from "@/components/ui/table-select";
import { ButtonGroup, IconButton, Pagination, Stack, Text, Flex, InputGroup, Input, Spacer, Button } from "@chakra-ui/react";
import { useState } from "react";
import { LuChevronLeft, LuChevronRight, LuPlus, LuSearch } from "react-icons/lu";
import EmptyDataScreen from "@/components/ui/screens/empty-data-screen";
import { useAllPurchaseOrders } from "@/queries/purchase-orders.queries.ts";
import { parseDate } from "@/constants/date";
import type { PurchaseOrderDTO } from "@/api/purchase-orders.ts";

export default function PurchaseOrderListPage() {
    const navigate = useNavigate();
    const { data, isLoading } = useAllPurchaseOrders();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");

    const orders = data?.purchaseOrders ?? [];
    const stateLabels: Record<number, string> = {
        0: "Pendiente",
        1: "Aprobado",
        2: "Rechazado",
        3: "Completado",
    };
    const filteredOrders = orders.filter((order) => {
        if (!search.trim()) return true;
        const term = search.toLowerCase();
        const date = parseDate(order.date);
        const values = [
            order.number,
            order.supplierName,
            String(order.total),
            date,
            stateLabels[order.state] ?? String(order.state),
        ];
        return values.some((value) => value.toLowerCase().includes(term));
    });
    const pageSize = 10;
    const currentOrders = filteredOrders.slice((page - 1) * pageSize, page * pageSize);

    const labels: label<PurchaseOrderDTO>[] = [
        {
            labelName: "Código",
            propName: "number",
            isSortable: true,
            sortFunction: (a, b) => a.number.localeCompare(b.number),
        },
        {
            labelName: "Total",
            propName: "total",
            isSortable: true,
            sortFunction: (a, b) => a.total - b.total,
        },
        {
            labelName: "Fecha",
            propName: "date",
            isComponent: true,
            render: (item) => parseDate(item.date),
            isSortable: true,
            sortFunction: (a, b) => a.date.localeCompare(b.date),
        },
        {
            labelName: "Estado",
            propName: "state",
            isComponent: true,
            render: (item) => {
                const states: Record<number, string> = {
                    0: "Pendiente",
                    1: "Aprobado",
                    2: "Rechazado",
                    3: "Completado",
                };
                return states[item.state] ?? item.state;
            },
            isSortable: true,
            sortFunction: (a, b) => a.state - b.state,
        },
    ];

    const handleCreate = () => {
        navigate("/compras/ordenes-de-compra/nuevo");
    };


    return (
        <Stack gap={4} p={4}>
            <Text fontSize="3xl" fontWeight="bold">
                Lista de Órdenes de Compra
            </Text>

            <Flex gap="0.8rem">
                <InputGroup startElement={<LuSearch />} maxW="32rem">
                    <Input
                        placeholder="Buscar"
                        variant="subtle"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                    />
                </InputGroup>
                <Spacer />
                <Button size="sm" colorPalette="brand" onClick={handleCreate}>
                    <LuPlus /> Nuevo
                </Button>
            </Flex>
                

            <TableSelect
                data={currentOrders}
                labels={labels}
                loading={isLoading}
                noItemsComponent={
                    <EmptyDataScreen
                        title="No hay órdenes de compra"
                        message="Crea una orden de compra para verla en la lista."
                    />
                }
                onSelect={() => undefined}
                onDoubleClick={(item) => navigate(`/compras/ordenes-de-compra/${item.id}`)}
            />

            <Pagination.Root
                count={filteredOrders.length}
                pageSize={pageSize}
                page={page}
                onPageChange={(e) => setPage(e.page)}
                display="flex"
                justifyContent="center"
            >
                <ButtonGroup attached variant="outline" size="sm">
                    <Pagination.PrevTrigger asChild>
                        <IconButton>
                            <LuChevronLeft />
                        </IconButton>
                    </Pagination.PrevTrigger>
                    <Pagination.Items
                        render={(pageItem) => (
                            <IconButton
                                variant={{ base: "outline", _selected: "solid" }}
                                zIndex={{ _selected: "1" }}
                                _selected={{ bg: "brand.primary", color: "white" }}
                            >
                                {pageItem.value}
                            </IconButton>
                        )}
                    />
                    <Pagination.NextTrigger asChild>
                        <IconButton>
                            <LuChevronRight />
                        </IconButton>
                    </Pagination.NextTrigger>
                </ButtonGroup>
            </Pagination.Root>
        </Stack>
    );
}