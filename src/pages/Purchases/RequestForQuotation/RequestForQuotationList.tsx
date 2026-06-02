import type { RequestForQuotation } from "@/api/requestForQuotation.api";
import { requestForQuotationStateMap } from "@/api/requestForQuotation.api";
import type { RequestForQuotationFilterParams } from "@/api/requestForQuotation.api";
import PageSizeControl from "@/components/ui/page-size-control";
import PaginationControl from "@/components/ui/pagination-control";
import EmptyDataScreen from "@/components/ui/screens/empty-data-screen";
import TableSelect, { type label } from "@/components/ui/table-select";
import { toaster } from "@/components/ui/toaster";
import { useGetRequestForQuotations } from "@/queries/request-for-quotation.queries";
import { useAllSuppliers } from "@/queries/suppliers.queries";
import { ComboboxWrapper } from "@/components/ui/combobox-wrapper";
import {
  Box,
  Button,
  HStack,
  IconButton,
  Input,
  Text,
} from "@chakra-ui/react";
import { NotebookPen, Eye } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const formatDate = (value: string) => {
  const d = new Date(value);
  return d.toLocaleDateString("es-PY", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const requestForQuotationLabels: label<RequestForQuotation>[] = [
  {
    labelName: "N° Solicitud",
    propName: "id",
    isSortable: true,
    sortFunction: (a, b) => a.id - b.id,
  },
  {
    labelName: "Proveedor",
    propName: "supplierName",
    isSortable: true,
    sortFunction: (a, b) => a.supplierName.localeCompare(b.supplierName),
  },
  {
    labelName: "Fecha",
    propName: "date",
    isSortable: true,
    sortFunction: (a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime(),
    transformFunction: (value: string) => formatDate(value),
  },
  {
    labelName: "Estado",
    propName: "state",
    isSortable: true,
    sortFunction: (a, b) => a.state - b.state,
    transformFunction: (value: number) =>
      requestForQuotationStateMap[value] || "Desconocido",
  },
  {
    labelName: "N° Pedido",
    propName: "purchaseRequestId",
    isSortable: true,
    sortFunction: (a, b) => a.purchaseRequestId - b.purchaseRequestId,
  },
  {
    labelName: "Estado Pedido",
    propName: "purchaseRequestState",
    isSortable: true,
    sortFunction: (a, b) => a.purchaseRequestState - b.purchaseRequestState,
    transformFunction: (value: number) =>
      requestForQuotationStateMap[value] || "Desconocido",
  },
  {
    labelName: "Observación",
    propName: "observation",
    transformFunction:(value)=> value? value.length > 20 ? value.slice(0,20)+ "...":value: "-",
    isSortable: true,
    sortFunction: (a, b) =>
      (a.observation ?? "").localeCompare(b.observation ?? ""),
  },
  {
    labelName: "Cant. Productos",
    propName: "products",
    isSortable: false,
    transformFunction: (value: RequestForQuotation["products"]) =>
      String(value?.length ?? 0),
  },
];

export default function RequestForQuotationList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [params, setParams] = useState<RequestForQuotationFilterParams>(() => ({
    page: Number(searchParams.get("page")) || 1,
    pageSize: Number(searchParams.get("pageSize")) || 10,
    supplierId: searchParams.get("supplierId") ? Number(searchParams.get("supplierId")) : undefined,
    purchaseRequestId: searchParams.get("purchaseRequestId") ? Number(searchParams.get("purchaseRequestId")) : undefined,
    state: searchParams.get("state") ? Number(searchParams.get("state")) : undefined,
  }));

  const {
    data: requestForQuotations,
    isPending,
    isError,
    error,
  } = useGetRequestForQuotations(params);
  const [selected, setSelected] = useState<RequestForQuotation | null>(null);
  const { data: suppliersData } = useAllSuppliers();

  useEffect(() => {
    if (isError) {
      toaster.create({
        title: "Error al traer las solicitudes de cotización",
        description: error?.message || "Error desconocido",
        type: "error",
      });
    }
  }, [isError, error]);

  useEffect(() => {
    const sp = new URLSearchParams();
    if (params.page && params.page !== 1) sp.set("page", String(params.page));
    if (params.pageSize && params.pageSize !== 10) sp.set("pageSize", String(params.pageSize));
    if (params.supplierId) sp.set("supplierId", String(params.supplierId));
    if (params.purchaseRequestId) sp.set("purchaseRequestId", String(params.purchaseRequestId));
    if (params.state) sp.set("state", String(params.state));
    setSearchParams(sp, { replace: true });
  }, [params, setSearchParams]);

  const updateFilter = useCallback((patch: Partial<RequestForQuotationFilterParams>) => {
    setParams((prev) => ({
      ...prev,
      ...patch,
      page: 1,
    }));
  }, []);

  const stateOptions = Object.entries(requestForQuotationStateMap).map(
    ([key, label]) => ({ label, value: key })
  );

  return (
    <Box
      display="flex"
      flexDirection="column"
      gap={4}
      p={4}
      height="100%"
      minHeight="0"
    >
      <Text fontSize="2xl" fontWeight="bold">
        Solicitudes de Cotización por Proveedor
      </Text>

      <Box
        display="flex"
        flexDirection="row"
        gap={2}
        justifyContent="space-between"
        alignItems="center"
      >
        <Box display="flex" flexDirection="row" gap={2} alignItems="center">
          <Text fontSize="sm" color="gray.500">
            Registros por Pág.
          </Text>
          <PageSizeControl paramsChangeFunction={setParams} params={params} max={30} min={5} />
        </Box>

        <IconButton
          padding={2}
          variant="outline"
          disabled={!selected}
          onClick={() =>
            selected && navigate(`/compras/solicitudes-cotizacion/${selected.id}`)
          }
        >
          <Eye />
          Ver
        </IconButton>
      </Box>

      {/* Filters */}
      <Box borderWidth="1px" borderRadius="lg" py={3} px={6}>
        <Text mb={1} fontSize="md" fontWeight="bold">Filtros</Text>
        <Box display="flex" flexDirection="row" gap={4} alignItems="center">
          <ComboboxWrapper
            options={
              suppliersData?.suppliers
                ? suppliersData.suppliers.map((s) => ({
                    label: s.businessName,
                    value: s.id.toString(),
                  }))
                : []
            }
            placeholder="Seleccionar Proveedor..."
            value={params.supplierId?.toString()}
            onValueChange={(value) =>
              updateFilter({ supplierId: value ? parseInt(value) : undefined })
            }
            clearable={true}
            width="280px"
          />
          <Input
            placeholder="N° Pedido de Compra"
            width="200px"
            type="number"
            value={params.purchaseRequestId ?? ""}
            onChange={(e) =>
              updateFilter({
                purchaseRequestId: e.target.value ? parseInt(e.target.value) : undefined,
              })
            }
          />
          <ComboboxWrapper
            options={stateOptions}
            placeholder="Seleccionar Estado..."
            value={params.state?.toString()}
            onValueChange={(value) =>
              updateFilter({ state: value ? parseInt(value) : undefined })
            }
            clearable={true}
            width="200px"
          />
          <HStack marginLeft="auto">
            <Button
              colorScheme="gray"
              onClick={() => setParams({ page: 1, pageSize: 10 })}
            >
              Limpiar
            </Button>
          </HStack>
        </Box>
      </Box>

      <Box flex="1" minHeight="0" mb={2}>
        <TableSelect
          key={JSON.stringify(requestForQuotations?.requestForQuotations)}
          data={requestForQuotations?.requestForQuotations ?? []}
          loading={isPending}
          labels={requestForQuotationLabels}
          onSelect={(rfq) => setSelected(rfq)}
          minheight="0"
          noItemsComponent={
            <EmptyDataScreen
              title="No se encontraron solicitudes de cotización"
              message="No hay solicitudes de cotización para mostrar en este momento."
              icon={<NotebookPen />}
            />
          }
          onDoubleClick={(rfq) =>
            navigate(`/compras/solicitudes-cotizacion/${rfq.id}`)
          }
        />

        <PaginationControl
          pagination={requestForQuotations?.pagination || null}
          onPageChange={(page) => setParams((prev) => ({ ...prev, page }))}
          variant="outline"
          buttonColor="brand.primary"
          btnSize="sm"
        />
      </Box>
    </Box>
  );
}
