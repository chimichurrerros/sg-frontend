import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  ButtonGroup,
  createListCollection,
  Field,
  Flex,
  Grid,
  Heading,
  Input,
  Portal,
  Select,
  Spinner,
  Stack,
  Table,
  Text,
} from "@chakra-ui/react";
import { useState } from "react";
import { LuArrowLeft, LuSave } from "react-icons/lu";
import { useGetAllPurchaseRequests } from "@/queries/purchase-request.queries.ts";
import { useGetPurchaseOrderDraft, useCreatePurchaseOrder, useGetPurchaseOrder } from "@/queries/purchase-orders.queries.ts";
import { useMe } from "@/queries/auth.queries";
import { parseDate } from "@/constants/date";
import { toaster } from "@/components/ui/toaster";
import { parsePrice } from "@/constants/price";
import TableEditable, { type EditableLabel } from "@/components/ui/table-edit";

const formatDateTime = (value: string) => {
  const d = new Date(value);
  return d.toLocaleDateString("es-PY", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });
};

const purchaseOrderStates: Record<number, string> = {
  1: "Pendiente",
  2: "Confirmado",
  3: "Parcialmente Recibido",
  4: "Recibido",
  5: "Cancelado",
};

export default function PurchaseOrderFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const orderId = id ? Number(id) : undefined;
  const isViewMode = Boolean(orderId);
  const [selectedRequestId, setSelectedRequestId] = useState<number>(0);

  const { data: currentUser } = useMe();
  const { data: requestsData } = useGetAllPurchaseRequests();
  const { data: draftData, isLoading: loadingDraft } = useGetPurchaseOrderDraft(
    selectedRequestId > 0 ? selectedRequestId : undefined,
  );
  const { data: orderData, isLoading: loadingOrder } = useGetPurchaseOrder(orderId);
  const createOrder = useCreatePurchaseOrder();

  const draft = draftData?.purchaseOrder;
  const today = parseDate(new Date());
  const details = isViewMode ? orderData?.purchaseOrder.details : draft?.details;
  const purchaseOrdersForSupplier = orderData?.purchaseOrder.purchaseOrdersForSupplier;

  const detailLabels: EditableLabel<any>[] = [
    { labelName: "Producto", propName: "productName" },
    { labelName: "Proveedor", propName: "supplierName" },
    { labelName: "Cantidad", propName: "quantityOrdered" },
    {
      labelName: "Precio Unitario",
      isComponent: true,
      render: (item: any) => parsePrice(item.price),
    },
    {
      labelName: "Precio Subtotal",
      isComponent: true,
      render: (item: any) => parsePrice(item.price * item.quantityOrdered),
    },
  ];

  const requestCollection = createListCollection({
    items: (requestsData?.purchaseRequests ?? []).map((r) => ({
      label: `${r.id} - ${parseDate(r.date)}`,
      value: String(r.id),
    })),
  });

  const handleSubmit = async () => {
    if (!draft) return;
    try {
      await createOrder.mutateAsync({
        purchaseRequestId: draft.purchaseRequestId,
        supplierId: draft.supplierId,
        details: draft.details.map((d) => ({
          productId: d.productId,
          quantityOrdered: d.quantityOrdered,
          supplierQuoteDetailId: d.supplierQuoteDetailId,
        })),
      });
      toaster.create({ title: "Orden de compra creada con éxito", type: "success" });
      navigate("/compras/ordenes-de-compra");
    } catch {
      toaster.create({ title: "Error al crear la orden de compra", type: "error" });
    }
  };

  if (isViewMode && loadingOrder) {
    return (
      <Flex justify="center" align="center" height="100%">
        <Spinner />
      </Flex>
    );
  }

  if (isViewMode && orderData) {
    const po = orderData.purchaseOrder;
    return (
      <Stack gap={6} paddingInline="5%" py={6} height="100%">
        {/* Header */}
        <Flex alignItems="center" justifyContent="space-between">
          <Heading size="xl">
            Orden de Compra {po.number}
          </Heading>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/compras/ordenes-de-compra")}
          >
            <LuArrowLeft /> Volver a órdenes de compra
          </Button>
        </Flex>

        {/* Info Card */}
        <Box borderWidth="1px" borderColor="gray.200" borderRadius="lg" p={6}>
          <Flex direction="row" gap={16} flexWrap="wrap" mb={0}>
            <Box>
              <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wide" mb={1}>
                N° Orden
              </Text>
              <Text fontWeight="semibold" fontSize="md">{po.number}</Text>
            </Box>
            <Box>
              <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wide" mb={1}>
                N° Pedido
              </Text>
              <Text fontWeight="semibold" fontSize="md">{po.purchaseRequestId}</Text>
            </Box>
            <Box>
              <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wide" mb={1}>
                Fecha
              </Text>
              <Text fontWeight="semibold" fontSize="md">{formatDateTime(po.date)}</Text>
            </Box>
            <Box>
              <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wide" mb={1}>
                Estado
              </Text>
              <Text fontWeight="semibold" fontSize="md">
                {purchaseOrderStates[po.state] || "Desconocido"}
              </Text>
            </Box>
            <Box>
              <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wide" mb={1}>
                Total General
              </Text>
              <Text fontWeight="bold" fontSize="lg" color="brand.primary">
                {parsePrice(po.total)}
              </Text>
            </Box>
          </Flex>
        </Box>

        {/* Per-Supplier Sections */}
        {purchaseOrdersForSupplier && purchaseOrdersForSupplier.length > 0 ? (
          purchaseOrdersForSupplier.map((supOrder) => (
            <Box
              key={supOrder.id}
              borderWidth="1px"
              borderColor="gray.200"
              borderRadius="lg"
              overflow="hidden"
            >
              {/* Supplier Header */}
              <Box bg="gray.50" px={6} py={4} borderBottomWidth="1px" borderColor="gray.200">
                <Flex direction="row" gap={10} flexWrap="wrap" alignItems="center">
                  <Box>
                    <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wide" mb={1}>
                      Proveedor
                    </Text>
                    <Text fontWeight="bold" fontSize="md">{supOrder.supplier.businessName}</Text>
                  </Box>
                  {supOrder.supplier.ruc && (
                    <Box>
                      <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wide" mb={1}>
                        RUC
                      </Text>
                      <Text fontSize="sm">{supOrder.supplier.ruc}</Text>
                    </Box>
                  )}
                  {supOrder.supplier.phone && (
                    <Box>
                      <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wide" mb={1}>
                        Teléfono
                      </Text>
                      <Text fontSize="sm">{supOrder.supplier.phone}</Text>
                    </Box>
                  )}
                  {supOrder.supplier.address && (
                    <Box>
                      <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wide" mb={1}>
                        Dirección
                      </Text>
                      <Text fontSize="sm">{supOrder.supplier.address}</Text>
                    </Box>
                  )}
                  <Box marginLeft="auto">
                    <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wide" mb={1}>
                      Subtotal
                    </Text>
                    <Text fontWeight="bold" fontSize="md" color="brand.primary">
                      {parsePrice(supOrder.total)}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wide" mb={1}>
                      Estado OC Proveedor
                    </Text>
                    <Text fontSize="sm">
                      {purchaseOrderStates[supOrder.state] || "Desconocido"}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wide" mb={1}>
                      N° OC Proveedor
                    </Text>
                    <Text fontSize="sm">{supOrder.number}</Text>
                  </Box>
                </Flex>
              </Box>

              {/* Products Table */}
              <Box>
                <Table.ScrollArea>
                  <Table.Root size="sm">
                    <Table.Header>
                      <Table.Row bg="gray.100">
                        <Table.ColumnHeader px={4} fontWeight="bold">Producto</Table.ColumnHeader>
                        <Table.ColumnHeader px={4} fontWeight="bold">Cant. Ordenada</Table.ColumnHeader>
                        <Table.ColumnHeader px={4} fontWeight="bold">Cant. Recibida</Table.ColumnHeader>
                        <Table.ColumnHeader px={4} fontWeight="bold">Precio Unit.</Table.ColumnHeader>
                        <Table.ColumnHeader px={4} fontWeight="bold">Subtotal</Table.ColumnHeader>
                        <Table.ColumnHeader px={4} fontWeight="bold">IVA</Table.ColumnHeader>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {supOrder.details.map((detail, idx) => (
                        <Table.Row key={detail.id} _even={{ bg: "gray.50" }}>
                          <Table.Cell px={4}>{detail.productName}</Table.Cell>
                          <Table.Cell px={4}>{detail.quantityOrdered}</Table.Cell>
                          <Table.Cell px={4}>{detail.quantityReceived}</Table.Cell>
                          <Table.Cell px={4}>{parsePrice(detail.price)}</Table.Cell>
                          <Table.Cell px={4}>{parsePrice(detail.price * detail.quantityOrdered)}</Table.Cell>
                          <Table.Cell px={4}>{detail.taxRate}%</Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table.Root>
                </Table.ScrollArea>
              </Box>
            </Box>
          ))
        ) : (
          /* Fallback: flat details if no per-supplier data */
          <Box borderWidth="1px" borderColor="gray.200" borderRadius="lg" overflow="hidden">
            <Box bg="gray.50" px={6} py={3} borderBottomWidth="1px" borderColor="gray.200">
              <Text fontWeight="bold">Productos</Text>
            </Box>
            {details && (
              <TableEditable
                data={details}
                labels={detailLabels}
                onDataChange={() => {}}
                readOnly={true}
                height="auto"
              />
            )}
          </Box>
        )}
      </Stack>
    );
  }

  return (
    <Stack gap={4} paddingInline="5%">
      <Button
        variant="ghost"
        size="sm"
        alignSelf="end"
        onClick={() => navigate("/compras/ordenes-de-compra")}
      >
        <LuArrowLeft /> Volver a órdenes de compra
      </Button>

      <Heading size="xl">
        {isViewMode ? `Orden de Compra ${orderData?.purchaseOrder.number ?? ""}` : "Nueva Orden de Compra"}
      </Heading>

      <Grid templateColumns="1fr 1fr 1fr" gap={4}>
        {!isViewMode && (
          <Field.Root required>
            <Field.Label>Pedido de Productos</Field.Label>
            <Select.Root
              collection={requestCollection}
              value={selectedRequestId ? [String(selectedRequestId)] : []}
              onValueChange={(e) => setSelectedRequestId(Number(e.value[0]))}
            >
              <Select.HiddenSelect />
              <Select.Control>
                <Select.Trigger>
                  <Select.ValueText placeholder="Seleccionar pedido" />
                </Select.Trigger>
                <Select.IndicatorGroup>
                  <Select.ClearTrigger />
                  <Select.Indicator />
                </Select.IndicatorGroup>
              </Select.Control>
              <Portal>
                <Select.Positioner>
                  <Select.Content>
                    {requestCollection.items.map((item) => (
                      <Select.Item item={item} key={item.value}>
                        {item.label}
                        <Select.ItemIndicator />
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Positioner>
              </Portal>
            </Select.Root>
          </Field.Root>
        )}

        <Field.Root>
          <Field.Label>Fecha</Field.Label>
          <Input
            value={isViewMode
              ? parseDate(orderData?.purchaseOrder.date)
              : today}
            disabled
          />
        </Field.Root>

        <Field.Root>
          <Field.Label>Usuario</Field.Label>
          <Input
            value={currentUser ? `${currentUser.name} ${currentUser.lastName}` : ""}
            disabled
          />
        </Field.Root>

        <Field.Root>
          <Field.Label>Estado</Field.Label>
          <Input
            value={purchaseOrderStates[draft?.state ?? 0] ?? "Desconocido"}
            disabled
          />
        </Field.Root>
      </Grid>

      {details && (
        <TableEditable
          data={details}
          labels={detailLabels}
          onDataChange={() => {}}
          readOnly={true}
          height="auto"
        />
      )}

      {!draft && selectedRequestId > 0 && !loadingDraft && !isViewMode && (
        <Text color="gray.500" fontSize="sm">
          No se encontró cotización para esta solicitud.
        </Text>
      )}

      {!isViewMode && (
        <ButtonGroup alignSelf="end">
          <Button
            variant="outline"
            onClick={() => navigate("/compras/ordenes-de-compra")}
            disabled={createOrder.isPending}
          >
            Cancelar
          </Button>
          <Button
            bgColor="brand.primary"
            onClick={handleSubmit}
            disabled={!draft || createOrder.isPending}
            loading={createOrder.isPending}
          >
            <LuSave /> Guardar
          </Button>
        </ButtonGroup>
      )}
    </Stack>
  );
}
