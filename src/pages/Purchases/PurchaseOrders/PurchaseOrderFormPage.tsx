import { useNavigate, useParams } from "react-router-dom";
import {
    Button,
    ButtonGroup,
    createListCollection,
    Field,
    Grid,
    Heading,
    Input,
    Portal,
    Select,
    Stack,
    Table,
    Text,
} from "@chakra-ui/react";
import { useState } from "react";
import { LuArrowLeft, LuSave } from "react-icons/lu";
import { useGetAllPurchaseRequests } from "@/queries/purchase-request.queries.ts";
import { useGetPurchaseOrderDraft, useCreatePurchaseOrder, useGetPurchaseOrder } from "@/queries/purchase-orders.queries.ts";
import { useMe } from "@/queries/auth.queries";
import { toaster } from "@/components/ui/toaster";

export default function PurchaseOrderFormPage() {
    const navigate = useNavigate();
    const { id } = useParams<{ id?: string }>();        
    const orderId = id ? Number(id) : undefined;         
    const isViewMode = Boolean(orderId);
    const [selectedRequestId, setSelectedRequestId] = useState<number>(0);

    const { data: currentUser } = useMe();
    const { data: requestsData } = useGetAllPurchaseRequests();
    const { data: draftData, isLoading: loadingDraft } = useGetPurchaseOrderDraft(
        selectedRequestId > 0 ? selectedRequestId : undefined
    );
    const { data: orderData } = useGetPurchaseOrder(orderId);
    const createOrder = useCreatePurchaseOrder();

    const draft = draftData?.purchaseOrder;
    const today = new Date().toLocaleDateString("es-PY", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });

    const requestCollection = createListCollection({
        items: (requestsData?.purchaseRequests ?? []).map((r) => ({
            label: `${r.id} - ${new Date(r.date).toLocaleDateString("es-PY")}`,
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

    return (
    <Stack gap={4} paddingInline="5%">
        <Button
            variant="ghost"
            size="sm"
            alignSelf="start"
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
                    <Field.Label>Cotización de Pedido</Field.Label>
                    <Select.Root
                        collection={requestCollection}
                        value={selectedRequestId ? [String(selectedRequestId)] : []}
                        onValueChange={(e) => setSelectedRequestId(Number(e.value[0]))}
                    >
                        <Select.HiddenSelect />
                        <Select.Control>
                            <Select.Trigger>
                                <Select.ValueText placeholder="Seleccionar cotización" />
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
                        ? new Date(orderData?.purchaseOrder.date ?? "").toLocaleDateString("es-PY", { day: "2-digit", month: "2-digit", year: "numeric" })
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
                <Field.Label>Proveedor</Field.Label>
                <Input
                    value={isViewMode ? orderData?.purchaseOrder.supplierName ?? "" : draft?.supplierName ?? ""}
                    disabled
                />
            </Field.Root>

            <Field.Root>
                <Field.Label>Estado</Field.Label>
                <Input value="ACTIVO" disabled />
            </Field.Root>
        </Grid>

        {(isViewMode ? orderData?.purchaseOrder : draft) && (
            <Table.Root borderWidth="1px" borderRadius="md" overflow="hidden">
                <Table.Header>
                    <Table.Row>
                        <Table.ColumnHeader>Secuencia</Table.ColumnHeader>
                        <Table.ColumnHeader>Producto</Table.ColumnHeader>
                        <Table.ColumnHeader>Proveedor</Table.ColumnHeader>
                        <Table.ColumnHeader>Cantidad</Table.ColumnHeader>
                        <Table.ColumnHeader>Precio Unitario</Table.ColumnHeader>
                        <Table.ColumnHeader textAlign="end">Precio Subtotal</Table.ColumnHeader>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {(isViewMode ? orderData?.purchaseOrder.details : draft?.details)?.map((detail, index) => (
                        <Table.Row key={detail.id}>
                            <Table.Cell>{index + 1}</Table.Cell>
                            <Table.Cell>{detail.productName}</Table.Cell>
                            <Table.Cell>{detail.supplierName}</Table.Cell>
                            <Table.Cell>{detail.quantityOrdered}</Table.Cell>
                            <Table.Cell>{detail.price}</Table.Cell>
                            <Table.Cell textAlign="end">
                                {(detail.price * detail.quantityOrdered).toFixed(2)}
                            </Table.Cell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table.Root>
        )}

        {!draft && selectedRequestId > 0 && !loadingDraft && !isViewMode && (
            <Text color="gray.500" fontSize="sm">
                No se encontró cotización para esta solicitud.
            </Text>
        )}

        <ButtonGroup alignSelf="end">
            <Button
                variant="outline"
                onClick={() => navigate("/compras/ordenes-de-compra")}
                disabled={createOrder.isPending}
            >
                {isViewMode ? "Volver" : "Cancelar"}
            </Button>
            {!isViewMode && (
                <Button
                    bgColor="brand.primary"
                    onClick={handleSubmit}
                    disabled={!draft || createOrder.isPending}
                    loading={createOrder.isPending}
                >
                    <LuSave /> Guardar
                </Button>
            )}
        </ButtonGroup>
    </Stack>
    );
}