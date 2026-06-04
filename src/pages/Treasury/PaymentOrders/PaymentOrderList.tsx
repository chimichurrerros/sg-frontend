import { useNavigate, useSearchParams } from "react-router-dom";
import TableSelect, { type label } from "@/components/ui/table-select";
import { Box, IconButton, Stack, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { LuPlus } from "react-icons/lu";
import EmptyDataScreen from "@/components/ui/screens/empty-data-screen";
import { useGetPaymentOrders } from "@/queries/paymentOrders.queries";
import { parseDate } from "@/constants/date";
import { parsePrice } from "@/constants/price";
import type { PaymentOrderResponseDto, PaymentOrderFilterParams } from "@/api/paymentOrders.api";
import { paymentOrderStateMap } from "@/api/paymentOrders.api";
import PaginationControl from "@/components/ui/pagination-control";
import PageSizeControl from "@/components/ui/page-size-control";
import { Banknote, Eye } from "lucide-react";

export default function PaymentOrderList() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [params, setParams] = useState<PaymentOrderFilterParams>(() => ({
        page: Number(searchParams.get("page")) || 1,
        pageSize: Number(searchParams.get("pageSize")) || 10,
    }));

    const { data, isLoading } = useGetPaymentOrders(params);

    const labels: label<PaymentOrderResponseDto>[] = [
        {
            labelName: "N° Orden de Pago",
            propName: "id",
            isSortable: true,
            sortFunction: (a, b) => a.id - b.id,
        },
        {
            labelName: "Fecha",
            propName: "date",
            transformFunction: (value: string) => parseDate(value),
            isSortable: true,
            sortFunction: (a, b) => a.date.localeCompare(b.date),
        },
        {
            labelName: "Total",
            propName: "total",
            transformFunction: (value: number) => parsePrice(value),
            isSortable: true,
            sortFunction: (a, b) => a.total - b.total,
        },
        {
            labelName: "Proveedor",
            propName: "supplierName",
            transformFunction: (value: string) => value || "-",
            isSortable: true,
            sortFunction: (a, b) => (a.supplierName || "").localeCompare(b.supplierName || ""),
        },
        {
            labelName: "Método de Pago",
            propName: "paymentMethod",
            transformFunction: (value: string) => value || "-",
        },
        {
            labelName: "Estado",
            propName: "stateId",
            transformFunction: (value: string) => paymentOrderStateMap[value] || value || "-",
        },
        {
            labelName: "Ver",
            isComponent: true,
            render: (item) => (
                <IconButton
                    size="xs"
                    variant="outline"
                    aria-label="Ver orden de pago"
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/tesoreria/ordenes-pago/${item.id}`);
                    }}
                >
                    <Eye size={14} />
                </IconButton>
            ),
        },
    ];

    useEffect(() => {
        const sp = new URLSearchParams();
        if (params.page && params.page !== 1) sp.set("page", String(params.page));
        if (params.pageSize && params.pageSize !== 10) sp.set("pageSize", String(params.pageSize));
        setSearchParams(sp, { replace: true });
    }, [params, setSearchParams]);

    const handleCreate = () => {
        navigate("/tesoreria/ordenes-pago/nueva");
    };

    return (
        <Stack gap={4} p={4} height="100%" minHeight="0">
            <Text fontSize="3xl" fontWeight="bold">Órdenes de Pago</Text>
            <Box display="flex" flexDirection="row" gap={2} justifyContent="space-between" alignItems="center">
                <Box display="flex" flexDirection="row" gap={2} alignItems="center">
                    <Text fontSize="sm" color="gray.500" alignSelf="center">Registros por Pág. </Text>
                    <PageSizeControl paramsChangeFunction={setParams} params={params} max={30} min={5} />
                </Box>
                <IconButton padding={2} colorPalette="brand" onClick={handleCreate}>
                    <LuPlus /> Nuevo
                </IconButton>
            </Box>
            <TableSelect
                data={data?.paymentOrders ?? []}
                labels={labels}
                loading={isLoading}
                noItemsComponent={
                    <EmptyDataScreen
                        title="No hay órdenes de pago"
                        message="Crea una orden de pago para verla en la lista."
                        icon={<Banknote size={48} color="gray" />}
                    />
                }
                onSelect={() => undefined}
                onDoubleClick={(item) => navigate(`/tesoreria/ordenes-pago/${item.id}`)}
            />
            <PaginationControl pagination={data?.pagination || null} onPageChange={(page) => setParams((prev) => ({ ...prev, page }))} />
        </Stack>
    );
}
