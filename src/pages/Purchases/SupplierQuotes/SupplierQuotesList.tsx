import type { SupplierQuote, SupplierQuoteFilterParams } from "@/api/supplierQuote.api";
import { DestructiveActionDialog } from "@/components/ui/dialogs/destructive-action-dialog";
import PaginationControl from "@/components/ui/pagination-control";
import EmptyDataScreen from "@/components/ui/screens/empty-data-screen";
import type { label } from "@/components/ui/table-select";
import TableSelect from "@/components/ui/table-select";
import { DatePickerWrapper } from "@/components/ui/date-picker-wrapper";
import { toaster } from "@/components/ui/toaster";
import { useEditSupplierQuote, useGetSupplierQuotes } from "@/queries/supplier-quotes.queries";
import { supplierQuoteStatusMap } from "@/types/purchases";
import { parseDate } from "@/constants/date";
import { Box, Button, IconButton, Input, Text } from "@chakra-ui/react";
import { ExternalLink, Pencil, Plus, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { LuSearch } from "react-icons/lu";
import { useNavigate, useSearchParams } from "react-router-dom";
import PageSizeControl from "@/components/ui/page-size-control";
import { parsePrice } from "@/constants/price";
import { useAllSuppliers } from "@/queries/suppliers.queries";
import { ComboboxWrapper } from "@/components/ui/combobox-wrapper";

const stateOptions = Object.entries(supplierQuoteStatusMap).map(
  ([key, label]) => ({ label, value: key }),
);

export default function SupplierQuotesList() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [params, setParams] = useState<SupplierQuoteFilterParams>(() => ({
    page: Number(searchParams.get("page")) || 1,
    pageSize: Number(searchParams.get("pageSize")) || 10,
    supplierId: searchParams.get("supplierId") ? Number(searchParams.get("supplierId")) : undefined,
    purchaseRequestId: searchParams.get("purchaseRequestId") ? Number(searchParams.get("purchaseRequestId")) : undefined,
    requestForQuotationId: searchParams.get("requestForQuotationId") ? Number(searchParams.get("requestForQuotationId")) : undefined,
    state: searchParams.get("state") ? Number(searchParams.get("state")) : undefined,
    startDate: searchParams.get("startDate") || undefined,
    endDate: searchParams.get("endDate") || undefined,
    minTotal: searchParams.get("minTotal") ? Number(searchParams.get("minTotal")) : undefined,
    maxTotal: searchParams.get("maxTotal") ? Number(searchParams.get("maxTotal")) : undefined,
  }));

  const [selected, setSelected] = useState<SupplierQuote | null>(null);
  const { data: supplierQuotes, isPending: loadingSupplierQuotes, error: supplierQuotesError, isError } = useGetSupplierQuotes(params);
  const { data: suppliersData } = useAllSuppliers();
  const editSupplierQuote = useEditSupplierQuote();
  const navigate = useNavigate();

  const labels: label<SupplierQuote>[] = [
    { labelName: "ID", propName: "id", isSortable: true, sortFunction: (a: SupplierQuote, b: SupplierQuote) => a.id - b.id },
    { labelName: "Proveedor", propName: "supplierName", isSortable: true, sortFunction: (a: SupplierQuote, b: SupplierQuote) => a.supplierName.localeCompare(b.supplierName) },
    { labelName: "Fecha", propName: "date", transformFunction:(value: Date) => parseDate(value), isSortable: true, sortFunction: (a: SupplierQuote, b: SupplierQuote) => a.date.getTime() - b.date.getTime() },
    { labelName: "Monto Total", propName: "total", isSortable: true, transformFunction: (value)=>parsePrice(value), sortFunction: (a: SupplierQuote, b: SupplierQuote) => a.total - b.total },
    { labelName: "Estado", propName: "state", transformFunction: (value: number) => supplierQuoteStatusMap[value] || "Desconocido" },
  ];

  useEffect(() => {
    if (isError) {
      toaster.create({ title: "Error al cargar las cotizaciones: " + (supplierQuotesError?.message || "Error desconocido"), type: "error" });
    }
  }, [isError, supplierQuotesError]);

  useEffect(() => {
    const sp = new URLSearchParams();
    if (params.page && params.page !== 1) sp.set("page", String(params.page));
    if (params.pageSize && params.pageSize !== 10) sp.set("pageSize", String(params.pageSize));
    if (params.supplierId) sp.set("supplierId", String(params.supplierId));
    if (params.purchaseRequestId) sp.set("purchaseRequestId", String(params.purchaseRequestId));
    if (params.requestForQuotationId) sp.set("requestForQuotationId", String(params.requestForQuotationId));
    if (params.state) sp.set("state", String(params.state));
    if (params.startDate) sp.set("startDate", params.startDate);
    if (params.endDate) sp.set("endDate", params.endDate);
    if (params.minTotal) sp.set("minTotal", String(params.minTotal));
    if (params.maxTotal) sp.set("maxTotal", String(params.maxTotal));
    setSearchParams(sp, { replace: true });
  }, [params, setSearchParams]);

  const updateFilter = useCallback((patch: Partial<SupplierQuoteFilterParams>) => {
    setParams((prev) => ({
      ...prev,
      ...patch,
      page: 1,
    }));
  }, []);

  return (
    <Box display="flex" flexDirection="column" gap={5}>
      <Text fontSize="2xl" fontWeight="bold">
        Lista de Cotizaciones de Proveedores
      </Text>

      <Box display="flex" flexDirection="row" gap={2} justifyContent="space-between" alignItems="center">
        <Box display="flex" flexDirection="row" gap={2} alignItems="center">
          <Text fontSize="sm" color="gray.500">Registros por Pág. </Text>
          <PageSizeControl paramsChangeFunction={setParams} params={params} max={30} min={5}  />
        </Box>
        <Box display="flex" flexDirection="row" gap={2}>
          <IconButton variant="ghost" size="sm"
            disabled={!selected || selected?.associatedPurchaseOrderId === null}
            onClick={() => { selected && navigate("/compras/ordenes-de-compra/" + selected.associatedPurchaseOrderId) }}>
            <ExternalLink />
            Compra Asociada
          </IconButton>
          <DestructiveActionDialog trigger={
            <IconButton padding={2} variant="outline" disabled={!selected || editSupplierQuote.isPending || selected.state === 2 || selected.associatedPurchaseOrderId !== null}>
              {editSupplierQuote.isPending ? "..." : <X />}
              Rechazar
            </IconButton>
          }
            title={"Rechazar Cotización"}
            description="Una vez rechazada, podrá ser visualizada pero ya no editable ni se podrá generar una compra a partir de ella"
            onAccept={() => { selected && editSupplierQuote.mutate({ id: selected?.id, data: { state: 2 } }) }}
          />
          <IconButton padding={2} bgColor="brand.secondary" disabled={!selected} onClick={() => selected && navigate(`/compras/cotizaciones-proveedores/${selected.id}`)}>
            <Pencil />
            Editar
          </IconButton>
          <IconButton padding={2} bgColor="brand.primary" onClick={() => navigate("/compras/cotizaciones-proveedores/nueva")}>
            <Plus />
            Nuevo
          </IconButton>
        </Box>
      </Box>

      <Box borderWidth="1px" borderRadius="lg" py={3} px={6}>
        <Text mb={1} fontSize="md" fontWeight="bold">Filtros</Text>
        <Box display="flex" flexDirection="row" gap={4} alignItems="center" flexWrap="wrap">
          <ComboboxWrapper
            options={suppliersData?.suppliers
              ? suppliersData.suppliers.map((s) => ({ label: s.businessName, value: s.id.toString() }))
              : []}
            placeholder="Proveedor..."
            value={params.supplierId?.toString()}
            onValueChange={(value) => updateFilter({ supplierId: value ? parseInt(value) : undefined })}
            clearable={true}
            width="200px"
          />
          <Input
            placeholder="N° Pedido"
            width="140px"
            type="number"
            value={params.purchaseRequestId ?? ""}
            onChange={(e) => updateFilter({ purchaseRequestId: e.target.value ? parseInt(e.target.value) : undefined })}
          />
          {/* <Input
            placeholder="N° RFQ"
            width="140px"
            type="number"
            value={params.requestForQuotationId ?? ""}
            onChange={(e) => updateFilter({ requestForQuotationId: e.target.value ? parseInt(e.target.value) : undefined })}
          /> */}
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

      <TableSelect<SupplierQuote>
        key={JSON.stringify(supplierQuotes)}
        data={supplierQuotes?.supplierQuotes || []}
        labels={labels}
        onSelect={(item) => setSelected(item)}
        onDoubleClick={(item) => navigate(`/compras/cotizaciones-proveedores/${item.id}`)}
        loading={loadingSupplierQuotes}
        maxHeight="50vh"
        noItemsComponent={
          <EmptyDataScreen
            title="No se encontraron cotizaciones"
            message="No hay cotizaciones de proveedores para mostrar en este momento. Puedes crear una nueva cotización haciendo clic en el botón 'Nuevo'."
            icon={<LuSearch size={48} color="gray" />}
          />
        }
      />
      <PaginationControl
        pagination={supplierQuotes?.pagination || null}
        onPageChange={(page) => setParams((prev) => ({ ...prev, page }))}
      />
    </Box>
  );
}
