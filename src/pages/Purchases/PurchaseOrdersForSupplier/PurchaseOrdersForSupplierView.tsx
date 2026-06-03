import { purchaseOrderForSupplierStateMap } from "@/api/purchaseOrderForSupplier.api";
import PageTitle from "@/components/ui/title";
import { toaster } from "@/components/ui/toaster";
import { useGetPurchaseOrderForSupplierById } from "@/queries/purchase-orders-for-supplier.queries";
import {
  Box,
  Button,
  Flex,
  Heading,
  Spinner,
  Stack,
  Table,
  Text,
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

const formatPrice = (value: number) =>
  new Intl.NumberFormat("es-PY", { style: "currency", currency: "PYG", minimumFractionDigits: 0 }).format(value);

export default function PurchaseOrdersForSupplierView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const orderId = Number(id);

  const {
    data: order,
    isPending,
    isError,
    error,
  } = useGetPurchaseOrderForSupplierById(orderId);

  useEffect(() => {
    if (isError) {
      toaster.create({
        title: "Error al cargar la orden de compra",
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

  if (isError || !order) {
    return (
      <Flex justify="center" align="center" height="100%">
        <Text>Error al cargar la orden de compra</Text>
      </Flex>
    );
  }

  return (
    <Stack gap={6} paddingInline="5%" py={6} height="100%">
      <Flex alignItems="center" justifyContent="space-between">
        <PageTitle>
          Orden de Compra N° {order.id}
        </PageTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/compras/ordenes-por-proveedor")}
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
            <Text fontWeight="semibold" fontSize="md">{order.supplierName}</Text>
          </Box>
          <Box>
            <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wide" mb={1}>
              RUC
            </Text>
            <Text fontWeight="semibold" fontSize="md">{order.supplier.ruc}</Text>
          </Box>
          <Box>
            <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wide" mb={1}>
              Teléfono
            </Text>
            <Text fontWeight="semibold" fontSize="md">{order.supplier.phone}</Text>
          </Box>
          <Box>
            <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wide" mb={1}>
              Dirección
            </Text>
            <Text fontWeight="semibold" fontSize="md">{order.supplier.address}</Text>
          </Box>
          <Box>
            <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wide" mb={1}>
              Número
            </Text>
            <Text fontWeight="semibold" fontSize="md">{order.number}</Text>
          </Box>
          <Box>
            <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wide" mb={1}>
              Fecha
            </Text>
            <Text fontWeight="semibold" fontSize="md">{formatDateTime(order.date)}</Text>
          </Box>
          <Box>
            <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wide" mb={1}>
              Estado
            </Text>
            <Text fontWeight="semibold" fontSize="md">
              {purchaseOrderForSupplierStateMap[order.state] || "Desconocido"}
            </Text>
          </Box>
          <Box>
            <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wide" mb={1}>
              Total
            </Text>
            <Text fontWeight="semibold" fontSize="md">
              {formatPrice(order.total)}
            </Text>
          </Box>
        </Flex>
      </Box>

      {/* Products Section */}
      <Box flex="1" minHeight="0" display="flex" flexDirection="column">
        <Text fontWeight="semibold" fontSize="sm" mb={3}>
          Productos
        </Text>
        <Box flex="1" borderWidth="1px" borderColor="gray.200" borderRadius="lg" overflow="hidden">
          <Table.ScrollArea height="100%">
            <Table.Root size="sm" stickyHeader>
              <Table.Header>
                <Table.Row bg="gray.100">
                  <Table.ColumnHeader px={4} fontWeight="bold">Producto</Table.ColumnHeader>
                  <Table.ColumnHeader px={4} fontWeight="bold">Cant. Ordenada</Table.ColumnHeader>
                  <Table.ColumnHeader px={4} fontWeight="bold">Cant. Recibida</Table.ColumnHeader>
                  <Table.ColumnHeader px={4} fontWeight="bold">Precio Unitario</Table.ColumnHeader>
                  <Table.ColumnHeader px={4} fontWeight="bold">Subtotal</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {order.details && order.details.length > 0 ? (
                  order.details.map((detail, index) => (
                    <Table.Row key={index} _even={{ bg: "gray.50" }}>
                      <Table.Cell px={4}>{detail.productName}</Table.Cell>
                      <Table.Cell px={4}>{detail.quantityOrdered}</Table.Cell>
                      <Table.Cell px={4}>{detail.quantityReceived}</Table.Cell>
                      <Table.Cell px={4}>{formatPrice(detail.price)}</Table.Cell>
                      <Table.Cell px={4}>{formatPrice(detail.price * detail.quantityOrdered)}</Table.Cell>
                    </Table.Row>
                  ))
                ) : (
                  <Table.Row>
                    <Table.Cell colSpan={5} textAlign="center" py={4}>
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
