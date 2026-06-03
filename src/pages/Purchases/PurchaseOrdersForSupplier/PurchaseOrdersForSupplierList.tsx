import type { PurchaseOrderForSupplier, PurchaseOrderForSupplierFilterParams } from "@/api/purchaseOrderForSupplier.api";
import { purchaseOrderForSupplierStateMap } from "@/api/purchaseOrderForSupplier.api";
import PageSizeControl from "@/components/ui/page-size-control";
import PaginationControl from "@/components/ui/pagination-control";
import EmptyDataScreen from "@/components/ui/screens/empty-data-screen";
import TableSelect, { type label } from "@/components/ui/tables/table-select";
import { toaster } from "@/components/ui/toaster";
import { useGetPurchaseOrdersForSupplier } from "@/queries/purchase-orders-for-supplier.queries";
import { useAllSuppliers } from "@/queries/suppliers.queries";
import { ComboboxWrapper } from "@/components/ui/wrappers/combobox-wrapper";
import {
  Box,
  Button,
  HStack,
  IconButton,
  Text,
} from "@chakra-ui/react";
import { Eye } from "lucide-react";
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

const formatPrice = (value: number) =>
  new Intl.NumberFormat("es-PY", { style: "currency", currency: "PYG", minimumFractionDigits: 0 }).format(value);

const stateOptions = Object.entries(purchaseOrderForSupplierStateMap).map(
  ([key, label]) => ({ label, value: key }),
);

const labels: label<PurchaseOrderForSupplier>[] = [
  { labelName: "N° Orden", propName: "id", isSortable: true, sortFunction: (a, b) => a.id - b.id },
  { labelName: "Proveedor", propName: "supplierName", isSortable: true, sortFunction: (a, b) => a.supplierName.localeCompare(b.supplierName) },
  { labelName: "Número", propName: "number", isSortable: true, sortFunction: (a, b) => a.number.localeCompare(b.number) },
  { labelName: "Fecha", propName: "date", isSortable: true, sortFunction: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(), transformFunction: (value: string) => formatDate(value) },
  { labelName: "Total", propName: "total", isSortable: true, sortFunction: (a, b) => a.total - b.total, transformFunction: (value: number) => formatPrice(value) },
  { labelName: "Estado", propName: "state", isSortable: true, sortFunction: (a, b) => a.state - b.state, transformFunction: (value: number) => purchaseOrderForSupplierStateMap[value] || "Desconocido" },
];

export default function PurchaseOrdersForSupplierList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [params, setParams] = useState<PurchaseOrderForSupplierFilterParams>(() => ({
    page: Number(searchParams.get("page")) || 1,
    pageSize: Number(searchParams.get("pageSize")) || 10,
    supplierId: searchParams.get("supplierId") ? Number(searchParams.get("supplierId")) : undefined,
    state: searchParams.get("state") ? Number(searchParams.get("state")) : undefined,
  }));

  const { data, isPending, isError, error } = useGetPurchaseOrdersForSupplier(params);
  const { data: suppliersData } = useAllSuppliers();
  const [selected, setSelected] = useState<PurchaseOrderForSupplier | null>(null);

  useEffect(() => {
    if (isError) {
      toaster.create({
        title: "Error al cargar las órdenes de compra por proveedor",
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
    if (params.state) sp.set("state", String(params.state));
    setSearchParams(sp, { replace: true });
  }, [params, setSearchParams]);

  const updateFilter = useCallback((patch: Partial<PurchaseOrderForSupplierFilterParams>) => {
    setParams((prev) => ({ ...prev, ...patch, page: 1 }));
  }, []);

  return (
    <Box display="flex" flexDirection="column" gap={4} p={4} height="100%" minHeight="0">
      <Text fontSize="2xl" fontWeight="bold">
        Órdenes de Compra por Proveedor
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
            selected && navigate(`/compras/ordenes-por-proveedor/${selected.id}`)
          }
        >
          <Eye />
          Ver
        </IconButton>
      </Box>

      <Box borderWidth="1px" borderRadius="lg" py={3} px={6}>
        <Text mb={1} fontSize="md" fontWeight="bold">Filtros</Text>
        <Box display="flex" flexDirection="row" gap={4} alignItems="center">
          <ComboboxWrapper
            options={suppliersData?.suppliers
              ? suppliersData.suppliers.map((s) => ({ label: s.businessName, value: s.id.toString() }))
              : []}
            placeholder="Seleccionar Proveedor..."
            value={params.supplierId?.toString()}
            onValueChange={(value) =>
              updateFilter({ supplierId: value ? parseInt(value) : undefined })
            }
            clearable={true}
            width="280px"
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
          key={JSON.stringify(data?.purchaseOrdersForSupplier)}
          data={data?.purchaseOrdersForSupplier ?? []}
          loading={isPending}
          labels={labels}
          onSelect={(item) => setSelected(item)}
          minheight="0"
          noItemsComponent={
            <EmptyDataScreen
              title="No se encontraron órdenes de compra"
              message="No hay órdenes de compra por proveedor para mostrar en este momento."
              icon={<Eye />}
            />
          }
          onDoubleClick={(item) =>
            navigate(`/compras/ordenes-por-proveedor/${item.id}`)
          }
        />

        <PaginationControl
          pagination={data?.pagination || null}
          onPageChange={(page) => setParams((prev) => ({ ...prev, page }))}
          variant="outline"
          buttonColor="brand.primary"
          btnSize="sm"
        />
      </Box>
    </Box>
  );
}
