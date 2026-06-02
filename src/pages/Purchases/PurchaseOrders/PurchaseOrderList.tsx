import { useNavigate } from "react-router-dom";
import TableSelect, { type label } from "@/components/ui/table-select";
import { Box, IconButton, Stack, Text, InputGroup, Input } from "@chakra-ui/react";
import { useState } from "react";
import { LuPlus, LuSearch } from "react-icons/lu";
import EmptyDataScreen from "@/components/ui/screens/empty-data-screen";
import { useAllPurchaseOrders } from "@/queries/purchase-orders.queries.ts";
import { parseDate } from "@/constants/date";
import { parsePrice } from "@/constants/price";
import type { PurchaseOrderDTO } from "@/api/purchase-orders.ts";
import PaginationControl from "@/components/ui/pagination-control";
import PageSizeControl from "@/components/ui/page-size-control";
import type { PaginationParams } from "@/types/types";

export default function PurchaseOrderListPage() {
    const navigate = useNavigate();
    const [params, setParams] = useState<PaginationParams>({ page: 1, pageSize: 10 });
    const { data, isLoading } = useAllPurchaseOrders();

    const orders = data?.purchaseOrders ?? [];

    const pagination = {
        currentPage: params.page,
        pageSize: params.pageSize,
        totalElements: orders.length,
    };

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
            isComponent: true,
            render: (item) => parsePrice(item.total),
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
                    1: "Pendiente",
                    2: "Confirmado",
                    3: "Parcialmente Recibido",
                    4: "Recibido",
                    5: "Cancelado",
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

            <Box display="flex" flexDirection="row" gap={2} justifyContent="space-between" alignItems="center">
                <InputGroup flex="1" startElement={<LuSearch />}>
                    <Input placeholder="Buscar Órdenes..." />
                </InputGroup>
                <Box display="flex" flexDirection="row" gap={2}>
                    <Text fontSize="sm" color="gray.500" alignSelf="center">Registros por Pág. </Text>
                    <PageSizeControl paramsChangeFunction={setParams} params={params} max={30} min={5} />
                </Box>
                <IconButton
                    padding={2}
                    colorPalette="brand"
                    onClick={handleCreate}
                >
                    <LuPlus />
                    Nuevo
                </IconButton>
            </Box>

            <TableSelect
                data={orders.slice((params.page - 1) * params.pageSize, params.page * params.pageSize)}
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

            <PaginationControl
                pagination={pagination}
                onPageChange={(page: number) => { setParams({ ...params, page }) }}
            />
        </Stack>
    );
}