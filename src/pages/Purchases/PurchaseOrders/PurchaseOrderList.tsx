import { useNavigate } from "react-router-dom";
import TableBar from "@/components/ui/table-bar";
import TableSelect, { type label } from "@/components/ui/table-select";
import { ButtonGroup, IconButton, Pagination, Stack, Text } from "@chakra-ui/react";
import { useState } from "react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import EmptyDataScreen from "@/components/ui/screens/empty-data-screen";
import { useAllPurchaseOrders } from "@/queries/purchase-orders.queries.ts";
import type { PurchaseOrderDTO } from "@/api/purchase-orders.ts";

export default function PurchaseOrderListPage() {
    const navigate = useNavigate();
    const { data, isLoading } = useAllPurchaseOrders();
    const [selectedOrder, setSelectedOrder] = useState<PurchaseOrderDTO | null>(null);
    const [page, setPage] = useState(1);

    const orders = data?.purchaseOrders ?? [];
    const pageSize = 10;
    const currentOrders = orders.slice((page - 1) * pageSize, page * pageSize);

    const labels: label<PurchaseOrderDTO>[] = [
        {
            labelName: "Número",
            propName: "number",
            isSortable: true,
            sortFunction: (a, b) => a.number.localeCompare(b.number),
        },
        {
            labelName: "Proveedor",
            propName: "supplierName",
            isSortable: true,
            sortFunction: (a, b) => a.supplierName.localeCompare(b.supplierName),
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
            isSortable: true,
            sortFunction: (a, b) => a.date.localeCompare(b.date),
        },
        {
            labelName: "Estado",
            propName: "state",
            isSortable: true,
            sortFunction: (a, b) => a.state - b.state,
        },
    ];

    const handleCreate = () => {
        navigate("/compras/ordenes-de-compra/nuevo");
    };

    const handleEdit = () => {
        if (!selectedOrder) return;
        navigate(`/compras/ordenes-de-compra/${selectedOrder.id}`);
    };

    const handleDelete = () => {
        if (!selectedOrder) return;
    };

    return (
        <Stack gap={4} p={4}>
            <Text fontSize="3xl" fontWeight="bold">
                Lista de Órdenes de Compra
            </Text>

            <TableBar
                selected={selectedOrder}
                onCreate={handleCreate}
                onEdit={selectedOrder ? handleEdit : undefined}
                onDelete={handleDelete}
            />

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
                onSelect={(item) => setSelectedOrder(item)}
                onDoubleClick={(item) => navigate(`/compras/ordenes-de-compra/${item.id}`)}
            />

            <Pagination.Root
                count={orders.length}
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