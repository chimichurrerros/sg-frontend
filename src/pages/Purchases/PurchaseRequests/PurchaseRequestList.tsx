import type { PurchaseRequest } from "@/api/purchaseRequest.api";
import { purchaseRequestStateMap } from "@/api/purchaseRequest.api";
import PageSizeControl from "@/components/ui/page-size-control";
import PaginationControl from "@/components/ui/pagination-control";
import EmptyDataScreen from "@/components/ui/screens/empty-data-screen";
import TableSelect, { type label } from "@/components/ui/table-select";
import { toaster } from "@/components/ui/toaster";
import { useGetPurchaseRequests } from "@/queries/purchase-request.queries";
import type { PaginationParams } from "@/types/types";
import {
  Box,
  IconButton,
  Input,
  InputGroup,
  Text,
} from "@chakra-ui/react";
import { NotebookPen, Plus, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { LuSearch } from "react-icons/lu";
import { useNavigate } from "react-router-dom";

const formatDate = (value: Date) => {
  const d = new Date(value);
  return d.toLocaleDateString("es-PY", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const purchaseRequestLabels: label<PurchaseRequest>[] = [
  {
    labelName: "N° Pedido",
    propName: "id",
    isSortable: true,
    sortFunction: (a, b) => a.id - b.id,
  },
  {
    labelName: "Usuario",
    propName: "userName",
    isSortable: true,
    sortFunction: (a, b) => a.userName.localeCompare(b.userName),
  },
  {
    labelName: "Fecha",
    propName: "date",
    isSortable: true,
    sortFunction: (a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime(),
    transformFunction: (value: Date) => formatDate(value),
  },
  {
    labelName: "Estado",
    propName: "purchaseRequestState",
    isSortable: true,
    sortFunction: (a, b) => a.purchaseRequestState - b.purchaseRequestState,
    transformFunction: (value: number) =>
      purchaseRequestStateMap[value] || "Desconocido",
  },
  {
    labelName: "Observación",
    propName: "observation",
    isSortable: true,
    sortFunction: (a, b) =>
      (a.observation ?? "").localeCompare(b.observation ?? ""),
  },
  {
    labelName: "Cant. Productos",
    propName: "details",
    isSortable: false,
    transformFunction: (value: PurchaseRequest["details"]) =>
      String(value?.length ?? 0),
  },
];

export default function PurchaseRequestList() {
  const [params, setParams] = useState<PaginationParams>({
    page: 1,
    pageSize: 10,
  });
  const {
    data: purchaseRequests,
    isPending,
    isError,
    error,
  } = useGetPurchaseRequests(params);
  const [selected, setSelected] = useState<PurchaseRequest | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isError) {
      toaster.create({
        title: "Error al traer los pedidos de compra",
        description: error?.message || "Error desconocido",
        type: "error",
      });
    }
  }, [isError, error]);

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
        Pedidos de Compra
      </Text>

      <Box
        display="flex"
        flexDirection="row"
        gap={2}
        justifyContent="space-between"
        alignItems="center"
      >
        <InputGroup flex="1" startElement={<LuSearch />}>
          <Input placeholder="Buscar pedidos..." />
        </InputGroup>

        <Box display="flex" flexDirection="row" gap={2}>
          <Text fontSize="sm" color="gray.500" alignSelf="center">
            Registros por Pág.
          </Text>
          <PageSizeControl paramsChangeFunction={setParams} params={params} max={30} min={5} />
        </Box>

        <IconButton
          padding={2}
          colorPalette="brand"
          onClick={() => navigate("/compras/pedidos/nuevo")}
        >
          <Plus />
          Nuevo
        </IconButton>
        <IconButton
          padding={2}
          variant="outline"
          disabled={!selected}
          onClick={() =>
            selected && navigate(`/compras/pedidos/${selected.id}`)
          }
        >
          <Eye />
          Ver
        </IconButton>
      </Box>

      <Box flex="1" minHeight="0" mb={2}>
        <TableSelect
          key={JSON.stringify(purchaseRequests?.purchaseRequests)}
          data={purchaseRequests?.purchaseRequests ?? []}
          loading={isPending}
          labels={purchaseRequestLabels}
          onSelect={(pr) => setSelected(pr)}
          minheight="0"
          noItemsComponent={
            <EmptyDataScreen
              title="No se encontraron pedidos de compra"
              message="No hay pedidos de compra para mostrar en este momento."
              icon={<NotebookPen />}
            />
          }
          onDoubleClick={(pr) =>
            navigate(`/compras/pedidos/${pr.id}`)
          }
        />

        <PaginationControl
          pagination={purchaseRequests?.pagination || null}
          onPageChange={(page) => setParams({ ...params, page })}
          variant="outline"
          buttonColor="brand.primary"
          btnSize="sm"
        />
      </Box>
    </Box>
  );
}
