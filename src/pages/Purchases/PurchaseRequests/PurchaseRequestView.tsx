import { purchaseRequestStateMap } from "@/api/purchaseRequest.api";
import { toaster } from "@/components/ui/toaster";
import { useGetPurchaseRequestById } from "@/queries/purchase-request.queries";
import {
  Box,
  Button,
  Field,
  Flex,
  Heading,
  Spinner,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { LuArrowLeft } from "react-icons/lu";
import { useNavigate, useParams } from "react-router-dom";
import PurchaseProductsTable, {
  type PurchaseProductRow,
} from "../components/PurchaseProductsTable";

export default function PurchaseRequestView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [observation, setObservation] = useState("");
  const [products, setProducts] = useState<PurchaseProductRow[]>([]);
  const purchaseRequestId = Number(id);

  const {
    data: purchaseRequest,
    isPending,
    isError,
    error,
  } = useGetPurchaseRequestById(purchaseRequestId);

  useEffect(() => {
    if (purchaseRequest) {
      setObservation(purchaseRequest.observation ?? "");
      setProducts(
        (purchaseRequest.details ?? []).map((d) => ({
          id: d.id,
          productId: d.productId,
          productName: d.productName,
          quantityRequested: d.quantityRequested,
        }))
      );
    }
  }, [purchaseRequest]);

  useEffect(() => {
    if (isError) {
      toaster.create({
        title: "Error al cargar el pedido de compra",
        description: error?.message || "Error desconocido",
        type: "error",
      });
    }
  }, [isError, error]);

  if (isPending) {
    return (
      <Flex justify="center" align="center" height="100%">
        <Spinner />
      </Flex>
    );
  }

  if (isError || !purchaseRequest) {
    return (
      <Flex justify="center" align="center" height="100%">
        <Text>Error al cargar el pedido de compra</Text>
      </Flex>
    );
  }

  const formatDate = (value: Date) => {
    const d = new Date(value);
    return d.toLocaleDateString("es-PY", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <Stack gap={4} paddingInline="5%" height="100%">
      <Flex alignItems="center" justifyContent="space-between">
        <Heading size="xl">
          Pedido de Compra N° {purchaseRequest.id}
        </Heading>
        <Flex gap={2}>
          <Button
            variant="ghost"
            size="sm"
            alignSelf="start"
            onClick={() => navigate("/compras/pedidos")}
          >
            <LuArrowLeft /> Volver al listado
          </Button>
        </Flex>
      </Flex>

      <Stack gap={4} height="100%" display="flex" flexDirection="column">
        <Box
          display="flex"
          flexDirection="row"
          gap={6}
          p={4}
          border="1px solid"
          borderColor="gray.200"
          borderRadius="md"
        >
          <Box>
            <Text fontSize="sm" color="gray.500">
              Usuario
            </Text>
            <Text fontWeight="medium">{purchaseRequest.userName}</Text>
          </Box>
          <Box>
            <Text fontSize="sm" color="gray.500">
              Fecha
            </Text>
            <Text fontWeight="medium">
              {formatDate(purchaseRequest.date)}
            </Text>
          </Box>
          <Box>
            <Text fontSize="sm" color="gray.500">
              Estado
            </Text>
            <Text fontWeight="medium">
              {purchaseRequestStateMap[
                purchaseRequest.purchaseRequestState
              ] || "Desconocido"}
            </Text>
          </Box>
        </Box>

        <Field.Root>
          <Field.Label>Observación</Field.Label>
          <Textarea
            placeholder="Sin observaciones"
            value={observation}
            readOnly
          />
        </Field.Root>

        <Text fontWeight="semibold" fontSize="sm" mt={2}>
          Productos
        </Text>

        <Box flex="1" minHeight="0">
          <PurchaseProductsTable
            products={products}
            onDataChange={setProducts}
            readOnly
          />
        </Box>
      </Stack>
    </Stack>
  );
}
