import { useNavigate, useSearchParams } from "react-router-dom";
import TableSelect, { type label } from "@/components/ui/table-select";
import { Box, Button, IconButton, Stack, Text } from "@chakra-ui/react";
import { ComboboxWrapper } from "@/components/ui/combobox-wrapper";
import { useCallback, useEffect, useState } from "react";
import { LuPlus } from "react-icons/lu";
import EmptyDataScreen from "@/components/ui/screens/empty-data-screen";
import { useGetPurchaseReceipts } from "@/queries/purchase-receipts.queries";
import { useAllSuppliers } from "@/queries/suppliers.queries";
import { useAllBranches } from "@/queries/branches.queries";
import { parseDate } from "@/constants/date";
import { parsePrice } from "@/constants/price";
import type { PurchaseReceiptResponse, PurchaseReceiptFilterParams } from "@/api/purchaseReceipts.api";
import PaginationControl from "@/components/ui/pagination-control";
import PageSizeControl from "@/components/ui/page-size-control";
import { DatePickerWrapper } from "@/components/ui/date-picker-wrapper";
import { Eye, Package } from "lucide-react";

export default function PurchaseReceiptList() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [params, setParams] = useState<PurchaseReceiptFilterParams>(() => ({
        page: Number(searchParams.get("page")) || 1,
        pageSize: Number(searchParams.get("pageSize")) || 10,
        supplierId: searchParams.get("supplierId") ? Number(searchParams.get("supplierId")) : undefined,
        branchId: searchParams.get("branchId") ? Number(searchParams.get("branchId")) : undefined,
        startDate: searchParams.get("startDate") || undefined,
        endDate: searchParams.get("endDate") || undefined,
    }));

    const { data, isLoading } = useGetPurchaseReceipts(params);
    const { data: suppliersData } = useAllSuppliers();
    const { data: branchesData } = useAllBranches();

    const labels: label<PurchaseReceiptResponse>[] = [
        {
            labelName: "Nro. Factura",
            propName: "number",
            isSortable: true,
            sortFunction: (a, b) => (a.number || "").localeCompare(b.number || ""),
        },
        {
            labelName: "Proveedor",
            propName: "supplierName",
            isSortable: true,
            sortFunction: (a, b) => (a.supplierName || "").localeCompare(b.supplierName || ""),
        },
        {
            labelName: "Sucursal",
            propName: "branchName",
            isSortable: true,
            sortFunction: (a, b) => (a.branchName || "").localeCompare(b.branchName || ""),
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
            labelName: "Total",
            propName: "total",
            isComponent: true,
            render: (item) => parsePrice(item.total),
            isSortable: true,
            sortFunction: (a, b) => a.total - b.total,
        },
        {
            labelName: "Ver",
            isComponent: true,
            render: (item) => (
                <IconButton
                    size="xs"
                    variant="outline"
                    aria-label="Ver recepción"
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/compras/recepcion-ordenes-compra/${item.id}`);
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
        if (params.supplierId) sp.set("supplierId", String(params.supplierId));
        if (params.branchId) sp.set("branchId", String(params.branchId));
        if (params.startDate) sp.set("startDate", params.startDate);
        if (params.endDate) sp.set("endDate", params.endDate);
        setSearchParams(sp, { replace: true });
    }, [params, setSearchParams]);

    const updateFilter = useCallback((patch: Partial<PurchaseReceiptFilterParams>) => {
        setParams((prev) => ({ ...prev, ...patch, page: 1 }));
    }, []);

    const handleCreate = () => {
        navigate("/compras/recepcion-ordenes-compra/nueva");
    };

    const supplierOptions = (suppliersData?.suppliers || []).map((s) => ({
        value: s.id.toString(),
        label: `${s.businessName}${s.fantasyName ? ` (${s.fantasyName})` : ""}`,
    }));

    const branchOptions = (branchesData?.branches || []).map((b) => ({
        value: b.id.toString(),
        label: b.name,
    }));

    return (
        <Stack gap={4} p={4} height="100%" minHeight="0">
            <Text fontSize="3xl" fontWeight="bold">
                Recepciones de Órdenes de Compra
            </Text>

            <Box display="flex" flexDirection="row" gap={2} justifyContent="space-between" alignItems="center">
                <Box display="flex" flexDirection="row" gap={2} alignItems="center">
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

            <Box borderWidth="1px" borderRadius="lg" py={3} px={6}>
                <Text mb={1} fontSize="md" fontWeight="bold">Filtros</Text>
                <Box display="flex" flexDirection="row" gap={4} alignItems="center" flexWrap="wrap">
                    <ComboboxWrapper
                        options={supplierOptions}
                        placeholder="Proveedor..."
                        value={params.supplierId?.toString()}
                        onValueChange={(value) => updateFilter({ supplierId: value ? parseInt(value) : undefined })}
                        clearable={true}
                        width="200px"
                    />
                    <ComboboxWrapper
                        options={branchOptions}
                        placeholder="Sucursal..."
                        value={params.branchId?.toString()}
                        onValueChange={(value) => updateFilter({ branchId: value ? parseInt(value) : undefined })}
                        clearable={true}
                        width="200px"
                    />
                    <DatePickerWrapper
                        placeholder="Fecha inicio"
                        width="160px"
                        value={params.startDate ?? null}
                        onChange={(dates) => updateFilter({ startDate: dates[0] || undefined })}
                    />
                    <DatePickerWrapper
                        placeholder="Fecha fin"
                        width="160px"
                        value={params.endDate ?? null}
                        onChange={(dates) => updateFilter({ endDate: dates[0] || undefined })}
                    />
                    <Button
                        colorScheme="gray"
                        marginLeft="auto"
                        onClick={() => setParams({ page: 1, pageSize: 10 })}
                    >
                        Limpiar
                    </Button>
                </Box>
            </Box>

            <TableSelect
                data={data?.purchaseReceipts ?? []}
                labels={labels}
                loading={isLoading}
                noItemsComponent={
                    <EmptyDataScreen
                        title="No hay recepciones"
                        message="Crea una recepción de orden de compra para verla en la lista."
                        icon={<Package size={48} color="gray" />}
                    />
                }
                onSelect={() => undefined}
                onDoubleClick={(item) => navigate(`/compras/recepcion-ordenes-compra/${item.id}`)}
            />

            <PaginationControl
                pagination={data?.pagination || null}
                onPageChange={(page) => setParams((prev) => ({ ...prev, page }))}
            />
        </Stack>
    );
}
