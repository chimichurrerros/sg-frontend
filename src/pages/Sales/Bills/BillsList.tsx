import { Box, Button, IconButton, Input, Stack, Text } from "@chakra-ui/react";
import { Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { billStatusEnumParse } from "@/types/bills";
import TableSelect, { type label } from "@/components/ui/tables/table-select";
import { useAllBills } from "@/queries/bills.queries";
import { useGetAllCustomers } from "@/queries/customers.queries";
import { parseDate } from "@/constants/date";
import EmptyDataScreen from "@/components/ui/screens/empty-data-screen";
import { toaster } from "@/components/ui/toaster";
import { parsePrice } from "@/constants/price";
import PaginationControl from "@/components/ui/pagination-control";
import PageSizeControl from "@/components/ui/page-size-control";
import { DatePickerWrapper } from "@/components/ui/wrappers/date-picker-wrapper";
import type { Bill } from "@/api/sales.api";
import type { BillFilterParams } from "@/api/bills.api";

export default function BillsListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  const [params, setParams] = useState<BillFilterParams>(() => ({
    page: Number(searchParams.get("page")) || 1,
    pageSize: Number(searchParams.get("pageSize")) || 10,
    number: searchParams.get("number") || undefined,
    customerName: searchParams.get("customerName") || undefined,
    customerRuc: searchParams.get("customerRuc") || undefined,
    startDate: searchParams.get("startDate") || undefined,
    endDate: searchParams.get("endDate") || undefined,
  }));

  const {
    data: allBills,
    isPending: loadingAllBills,
    isError: isErrorAllBills,
    error: errorAllBills,
  } = useAllBills(params);
  const { data: customers } = useGetAllCustomers();

  useEffect(() => {
    if (isErrorAllBills) {
      toaster.create({
        title: "Error al traer las Facturas",
        description: errorAllBills?.message,
        type: "error",
      });
    }
  }, [isErrorAllBills, errorAllBills]);

  useEffect(() => {
    const sp = new URLSearchParams();
    if (params.page && params.page !== 1) sp.set("page", String(params.page));
    if (params.pageSize && params.pageSize !== 10) sp.set("pageSize", String(params.pageSize));
    if (params.number) sp.set("number", params.number);
    if (params.customerName) sp.set("customerName", params.customerName);
    if (params.customerRuc) sp.set("customerRuc", params.customerRuc);
    if (params.startDate) sp.set("startDate", params.startDate);
    if (params.endDate) sp.set("endDate", params.endDate);
    setSearchParams(sp, { replace: true });
  }, [params, setSearchParams]);

  const updateFilter = (patch: Partial<BillFilterParams>) => {
    setParams((prev) => ({ ...prev, ...patch, page: 1 }));
  };

  const getCustomerName = (customerId: number) =>
    customers?.find((c) => c.id === customerId)?.name ?? "-";
  const getCustomerRuc = (customerId: number) =>
    customers?.find((c) => c.id === customerId)?.ruc || "-"

  const labels: label<Bill>[] = [
    {
      labelName: "Número",
      propName: "number",
      isSortable: true,
      sortFunction: (a: Bill, b: Bill) => a.number.localeCompare(b.number),
    },
    {
      labelName: "Nombre",
      isComponent: true,
      render: (item: Bill) => getCustomerName(item.customerId),
      isSortable: true,
      sortFunction: (a: Bill, b: Bill) =>
        getCustomerName(a.customerId).localeCompare(getCustomerName(b.customerId)),
    },
    {
      labelName: "RUC",
      isComponent: true,
      render: (item: Bill) => getCustomerRuc(item.customerId),
      isSortable: true,
      sortFunction: (a: Bill, b: Bill) =>
        getCustomerRuc(a.customerId).localeCompare(getCustomerRuc(b.customerId)),
    },
    {
      labelName: "Fecha",
      propName: "date",
      transformFunction: (value: string) => parseDate(value),
      isSortable: true,
      sortFunction: (a: Bill, b: Bill) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    },
    { labelName: "Total", propName: "total", transformFunction: (value) => parsePrice(value) },
    { labelName: "IVA", propName: "taxTotal", transformFunction: (value) => parsePrice(value) },
    { labelName: "Estado", propName: "billState", transformFunction: (value) => billStatusEnumParse[Number(value)] },
  ];

  const handleViewBill = () => {
    if (!selectedBill) return;
    navigate(`/ventas/facturas/${selectedBill.id}`);
  };

  return (
    <Stack gap={2} p={5}>
      <Text fontWeight="bold" fontSize="3xl">
        Listado de Facturas
      </Text>

      <Box display="flex" flexDirection="row" justifyContent="space-between" alignItems="center">
        <Box display="flex" flexDirection="row" gap={2} alignItems="center">
          <Text fontSize="sm" color="gray.500" whiteSpace="nowrap">
            Registros por pág.
          </Text>
          <PageSizeControl paramsChangeFunction={setParams} params={params} max={30} min={5} />
        </Box>
        <IconButton
          paddingX={5}
          bgColor="brand.secondary"
          disabled={!selectedBill}
          onClick={handleViewBill}
        >
          <Eye size={20} />
          Ver
        </IconButton>
      </Box>

      {/* Filtros */}
      <Box borderWidth="1px" borderRadius="lg" py={3} px={6}>
        <Text mb={1} fontSize="md" fontWeight="bold">Filtros</Text>
        <Box display="flex" flexDirection="row" gap={4} alignItems="center" flexWrap="wrap">
          <Input
            placeholder="N° Factura"
            width="160px"
            value={params.number ?? ""}
            onChange={(e) => updateFilter({ number: e.target.value || undefined })}
          />
          <Input
            placeholder="Nombre del cliente"
            width="200px"
            value={params.customerName ?? ""}
            onChange={(e) => updateFilter({ customerName: e.target.value || undefined })}
          />
          <Input
            placeholder="RUC del cliente"
            width="160px"
            value={params.customerRuc ?? ""}
            onChange={(e) => updateFilter({ customerRuc: e.target.value || undefined })}
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
        key={JSON.stringify(allBills?.bills ?? [])}
        data={allBills?.bills ?? []}
        loading={loadingAllBills}
        labels={labels}
        loadingMessage="Cargando Facturas..."
        height="auto"
        noItemsComponent={
          <EmptyDataScreen
            title="No hay Facturas registradas"
            message="Registra nuevas Facturas para verlas en esta lista."
          />
        }
        onSelect={(item: Bill | null) => {
          setSelectedBill(item);
        }}
        onDoubleClick={(item: Bill) => navigate(`/ventas/facturas/${item.id}`)}
      />
      <PaginationControl
        pagination={allBills?.pagination || null}
        onPageChange={(page) => setParams((prev) => ({ ...prev, page }))}
      />
    </Stack>
  );
}
