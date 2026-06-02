import { requestForQuotationStateMap } from "@/api/requestForQuotation.api";
import { toaster } from "@/components/ui/toaster";
import { useGetRequestForQuotationById } from "@/queries/request-for-quotation.queries";
import {
  Box,
  Button,
  Flex,
  Heading,
  Spinner,
  Stack,
  Table,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { useEffect } from "react";
import { LuArrowLeft } from "react-icons/lu";
import { useNavigate, useParams } from "react-router-dom";

const formatDateTime = (value: string) => {
  const d = new Date(value);
  return d.toLocaleDateString("es-PY", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDate = (value: string) => {
  const d = new Date(value);
  return d.toLocaleDateString("es-PY", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

export default function RequestForQuotationView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const rfqId = Number(id);

  const {
    data: rfq,
    isPending,
    isError,
    error,
  } = useGetRequestForQuotationById(rfqId);

  useEffect(() => {
    if (isError) {
      toaster.create({
        title: "Error al cargar la solicitud de cotización",
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

  if (isError || !rfq) {
    return (
      <Flex justify="center" align="center" height="100%">
        <Text>Error al cargar la solicitud de cotización</Text>
      </Flex>
    );
  }

  return (
    <Stack gap={6} paddingInline="5%" py={6} height="100%">
      <Flex alignItems="center" justifyContent="space-between">
        <Heading size="xl">
          Solicitud de Cotización N° {rfq.id}
        </Heading>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/compras/solicitudes-cotizacion")}
        >
          <LuArrowLeft /> Volver al listado
        </Button>
      </Flex>

      {/* Info Card */}
      <Box borderWidth="1px" borderColor="gray.200" borderRadius="lg" p={6}>
        <Flex direction="row" gap={16} flexWrap="wrap" mb={6}>
          <Box>
            <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wide" mb={1}>
              Proveedor
            </Text>
            <Text fontWeight="semibold" fontSize="md">{rfq.supplierName}</Text>
          </Box>
          <Box>
            <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wide" mb={1}>
              Fecha
            </Text>
            <Text fontWeight="semibold" fontSize="md">{formatDateTime(rfq.date)}</Text>
          </Box>
          <Box>
            <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wide" mb={1}>
              Estado
            </Text>
            <Text fontWeight="semibold" fontSize="md">
              {requestForQuotationStateMap[rfq.state] || "Desconocido"}
            </Text>
          </Box>
          <Box>
            <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wide" mb={1}>
              N° Pedido de Compra
            </Text>
            <Text fontWeight="semibold" fontSize="md">{rfq.purchaseRequestId}</Text>
          </Box>
          <Box>
            <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wide" mb={1}>
              Fecha Pedido
            </Text>
            <Text fontWeight="semibold" fontSize="md">{formatDate(rfq.purchaseRequestDate)}</Text>
          </Box>
          <Box>
            <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wide" mb={1}>
              Estado Pedido
            </Text>
            <Text fontWeight="semibold" fontSize="md">
              {requestForQuotationStateMap[rfq.purchaseRequestState] || "Desconocido"}
            </Text>
          </Box>
        </Flex>

        {/* Observation */}
        <Box>
          <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wide" mb={1}>
            Observación
          </Text>
          <Textarea
            placeholder="Sin observaciones"
            value={rfq.observation ?? ""}
            readOnly
            variant="subtle"
            size="sm"
          />
        </Box>
      </Box>

      {/* Products Section */}
      <Box flex="1" minHeight="0" display="flex" flexDirection="column">
        <Text fontWeight="semibold" fontSize="sm" mb={3}>
          Productos Solicitados
        </Text>
        <Box flex="1" borderWidth="1px" borderColor="gray.200" borderRadius="lg" overflow="hidden">
          <Table.ScrollArea height="100%">
            <Table.Root size="sm" stickyHeader>
              <Table.Header>
                <Table.Row bg="gray.100">
                  <Table.ColumnHeader px={4} fontWeight="bold">Producto</Table.ColumnHeader>
                  <Table.ColumnHeader px={4} fontWeight="bold">Categoría</Table.ColumnHeader>
                  <Table.ColumnHeader px={4} fontWeight="bold">Cantidad Solicitada</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {rfq.products && rfq.products.length > 0 ? (
                  rfq.products.map((product, index) => (
                    <Table.Row key={index} _even={{ bg: "gray.50" }}>
                      <Table.Cell px={4}>{product.productName}</Table.Cell>
                      <Table.Cell px={4}>{product.categoryName}</Table.Cell>
                      <Table.Cell px={4}>{product.quantityRequested}</Table.Cell>
                    </Table.Row>
                  ))
                ) : (
                  <Table.Row>
                    <Table.Cell colSpan={3} textAlign="center" py={4}>
                      No hay productos registrados.
                    </Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
            </Table.Root>
          </Table.ScrollArea>
        </Box>
      </Box>
    </Stack>
  );
}
