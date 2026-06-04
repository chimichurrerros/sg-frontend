import { useNavigate, useSearchParams } from "react-router-dom";
import TableSelect, { type label } from "@/components/ui/tables/table-select";
import { Box, Button, IconButton, Stack, Text, Input } from "@chakra-ui/react";
import { ComboboxWrapper } from "@/components/ui/wrappers/combobox-wrapper";
import { useCallback, useEffect, useState } from "react";
import { LuPlus } from "react-icons/lu";
import EmptyDataScreen from "@/components/ui/screens/empty-data-screen";
import { useGetPurchaseReturns } from "@/queries/purchase-returns.queries";
import { useAllSuppliers } from "@/queries/suppliers.queries";
import { useGetAllPurchaseReturnReasons } from "@/queries/purchase-return-reasons.queries";
import { parseDate } from "@/constants/date";
import { parsePrice } from "@/constants/price";
import type { PurchaseReturnResponse, PurchaseReturnFilterParams } from "@/api/purchaseReturns.api";
import PaginationControl from "@/components/ui/pagination-control";
import PageSizeControl from "@/components/ui/page-size-control";
import { DatePickerWrapper } from "@/components/ui/wrappers/date-picker-wrapper";
import { HandHelping, Eye } from "lucide-react";

export default function PurchaseReturnList() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [params, setParams] = useState<PurchaseReturnFilterParams>(() => ({
        page: Number(searchParams.get("page")) || 1,
        pageSize: Number(searchParams.get("pageSize")) || 10,
        supplierName: searchParams.get("supplierName") || undefined,
        number: searchParams.get("number") || undefined,
        date: searchParams.get("date") || undefined,
        reasonId: searchParams.get("reasonId") ? Number(searchParams.get("reasonId")) : undefined,
    }));

    const { data, isLoading } = useGetPurchaseReturns(params);
    const { data: suppliersData } = useAllSuppliers();
    const { data: reasonsData } = useGetAllPurchaseReturnReasons();

    const labels: label<PurchaseReturnResponse>[] = [
        { labelName: "Nro. Devolución", propName: "number", isSortable: true, sortFunction: (a, b) => (a.number || "").localeCompare(b.number || "") },
        { labelName: "Proveedor", propName: "supplierName", isSortable: true, sortFunction: (a, b) => (a.supplierName || "").localeCompare(b.supplierName || "") },
        { labelName: "Sucursal", propName: "branchName", isSortable: true, sortFunction: (a, b) => (a.branchName || "").localeCompare(b.branchName || "") },
        { labelName: "Motivo", propName: "reasonName", isSortable: true, sortFunction: (a, b) => (a.reasonName || "").localeCompare(b.reasonName || "") },
        { labelName: "Fecha", propName: "date", isComponent: true, render: (item) => parseDate(item.date), isSortable: true, sortFunction: (a, b) => a.date.localeCompare(b.date) },
        { labelName: "Total", propName: "total", isComponent: true, render: (item) => parsePrice(item.total), isSortable: true, sortFunction: (a, b) => a.total - b.total },
        {
            labelName: "Ver",
            isComponent: true,
            render: (item) => (
                <IconButton
                    size="xs"
                    variant="outline"
                    aria-label="Ver devolución"
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/compras/devoluciones/${item.id}`);
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
        if (params.supplierName) sp.set("supplierName", params.supplierName);
        if (params.number) sp.set("number", params.number);
        if (params.date) sp.set("date", params.date);
        if (params.reasonId) sp.set("reasonId", String(params.reasonId));
        setSearchParams(sp, { replace: true });
    }, [params, setSearchParams]);

    const updateFilter = useCallback((patch: Partial<PurchaseReturnFilterParams>) => {
        setParams((prev) => ({ ...prev, ...patch, page: 1 }));
    }, []);

    const handleCreate = () => {
        navigate("/compras/devoluciones/nueva");
    };

    const supplierOptions = (suppliersData?.suppliers || []).map((s) => ({
        value: s.businessName,
        label: `${s.businessName}${s.fantasyName ? ` (${s.fantasyName})` : ""}`,
    }));

    const reasonOptions = (reasonsData?.reasons || []).map((r) => ({
        value: r.id.toString(),
        label: r.name,
    }));

    return (
        <Stack gap={4} p={4} height="100%" minHeight="0">
            <Text fontSize="3xl" fontWeight="bold">Devoluciones de Compra</Text>
            <Box display="flex" flexDirection="row" gap={2} justifyContent="space-between" alignItems="center">
                <Box display="flex" flexDirection="row" gap={2} alignItems="center">
                    <Text fontSize="sm" color="gray.500" alignSelf="center">Registros por Pág. </Text>
                    <PageSizeControl paramsChangeFunction={setParams} params={params} max={30} min={5} />
                </Box>
                <IconButton padding={2} colorPalette="brand" onClick={handleCreate}>
                    <LuPlus /> Nuevo
                </IconButton>
            </Box>
            <Box borderWidth="1px" borderRadius="lg" py={3} px={6}>
                <Text mb={1} fontSize="md" fontWeight="bold">Filtros</Text>
                <Box display="flex" flexDirection="row" gap={4} alignItems="center" flexWrap="wrap">
                    <ComboboxWrapper options={supplierOptions} placeholder="Proveedor..." value={params.supplierName} onValueChange={(value) => updateFilter({ supplierName: value || undefined })} clearable width="220px" />
                    <Input placeholder="Nro. Devolución" width="180px" size="sm" value={params.number || ""} onChange={(e) => updateFilter({ number: e.target.value || undefined })} />
                    <ComboboxWrapper options={reasonOptions} placeholder="Motivo..." value={params.reasonId?.toString()} onValueChange={(value) => updateFilter({ reasonId: value ? parseInt(value) : undefined })} clearable width="200px" />
                    <DatePickerWrapper placeholder="Fecha" width="160px" value={params.date ?? null} onChange={(dates) => updateFilter({ date: dates[0] || undefined })} />
                    <Button colorScheme="gray" marginLeft="auto" onClick={() => setParams({ page: 1, pageSize: 10 })}>Limpiar</Button>
                </Box>
            </Box>
            <TableSelect data={data?.purchaseReturns ?? []} labels={labels} loading={isLoading}
                noItemsComponent={<EmptyDataScreen title="No hay devoluciones" message="Crea una devolución de compra para verla en la lista." icon={<HandHelping size={48} color="gray" />} />}
                onSelect={() => undefined}
                onDoubleClick={(item) => navigate(`/compras/devoluciones/${item.id}`)} />
            <PaginationControl pagination={data?.pagination || null} onPageChange={(page) => setParams((prev) => ({ ...prev, page }))} />
        </Stack>
    );
}
