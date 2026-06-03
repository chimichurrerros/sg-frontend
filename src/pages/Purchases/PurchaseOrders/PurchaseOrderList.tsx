import { useNavigate, useSearchParams } from "react-router-dom";
import TableSelect, { type label } from "@/components/ui/tables/table-select";
import { Box, Button, IconButton, Input, Stack, Text } from "@chakra-ui/react";
import { ComboboxWrapper } from "@/components/ui/wrappers/combobox-wrapper";
import { useCallback, useEffect, useState } from "react";
import { LuPlus, LuSearch } from "react-icons/lu";
import EmptyDataScreen from "@/components/ui/screens/empty-data-screen";
import { useGetPurchaseOrders } from "@/queries/purchase-orders.queries.ts";
import { parseDate } from "@/constants/date";
import { parsePrice } from "@/constants/price";
import type { PurchaseOrderDTO, PurchaseOrderFilterParams } from "@/api/purchase-orders.ts";
import PaginationControl from "@/components/ui/pagination-control";
import PageSizeControl from "@/components/ui/page-size-control";
import { DatePickerWrapper } from "@/components/ui/wrappers/date-picker-wrapper";

const purchaseOrderStates: Record<number, string> = {
  1: "Pendiente",
  2: "Confirmado",
  3: "Parcialmente Recibido",
  4: "Recibido",
  5: "Cancelado",
};

const stateOptions = Object.entries(purchaseOrderStates).map(
  ([key, label]) => ({ label, value: key }),
);

export default function PurchaseOrderListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [params, setParams] = useState<PurchaseOrderFilterParams>(() => ({
    page: Number(searchParams.get("page")) || 1,
    pageSize: Number(searchParams.get("pageSize")) || 10,
    purchaseRequestId: searchParams.get("purchaseRequestId") ? Number(searchParams.get("purchaseRequestId")) : undefined,
    state: searchParams.get("state") ? Number(searchParams.get("state")) : undefined,
    startDate: searchParams.get("startDate") || undefined,
    endDate: searchParams.get("endDate") || undefined,
    minTotal: searchParams.get("minTotal") ? Number(searchParams.get("minTotal")) : undefined,
    maxTotal: searchParams.get("maxTotal") ? Number(searchParams.get("maxTotal")) : undefined,
  }));

  const { data, isLoading } = useGetPurchaseOrders(params);

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
      render: (item) => purchaseOrderStates[item.state] ?? item.state,
      isSortable: true,
      sortFunction: (a, b) => a.state - b.state,
    },
  ];

  useEffect(() => {
    const sp = new URLSearchParams();
    if (params.page && params.page !== 1) sp.set("page", String(params.page));
    if (params.pageSize && params.pageSize !== 10) sp.set("pageSize", String(params.pageSize));
    if (params.purchaseRequestId) sp.set("purchaseRequestId", String(params.purchaseRequestId));
    if (params.state) sp.set("state", String(params.state));
    if (params.startDate) sp.set("startDate", params.startDate);
    if (params.endDate) sp.set("endDate", params.endDate);
    if (params.minTotal) sp.set("minTotal", String(params.minTotal));
    if (params.maxTotal) sp.set("maxTotal", String(params.maxTotal));
    setSearchParams(sp, { replace: true });
  }, [params, setSearchParams]);

  const updateFilter = useCallback((patch: Partial<PurchaseOrderFilterParams>) => {
    setParams((prev) => ({ ...prev, ...patch, page: 1 }));
  }, []);

  const handleCreate = () => {
    navigate("/compras/ordenes-de-compra/nuevo");
  };

  return (
    <Stack gap={4} p={4} height="100%" minHeight="0">
      <Text fontSize="3xl" fontWeight="bold">
        Lista de Órdenes de Compra
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
          <Input
            placeholder="N° Pedido"
            width="140px"
            type="number"
            value={params.purchaseRequestId ?? ""}
            onChange={(e) => updateFilter({ purchaseRequestId: e.target.value ? parseInt(e.target.value) : undefined })}
          />
          <ComboboxWrapper
            options={stateOptions}
            placeholder="Estado..."
            value={params.state?.toString()}
            onValueChange={(value) => updateFilter({ state: value ? parseInt(value) : undefined })}
            clearable={true}
            width="160px"
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
          <Input
            placeholder="Monto min"
            width="140px"
            type="number"
            value={params.minTotal ?? ""}
            onChange={(e) => updateFilter({ minTotal: e.target.value ? Number(e.target.value) : undefined })}
          />
          <Input
            placeholder="Monto max"
            width="140px"
            type="number"
            value={params.maxTotal ?? ""}
            onChange={(e) => updateFilter({ maxTotal: e.target.value ? Number(e.target.value) : undefined })}
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
        data={data?.purchaseOrders ?? []}
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
        pagination={data?.pagination || null}
        onPageChange={(page) => setParams((prev) => ({ ...prev, page }))}
      />
    </Stack>
  );
}
