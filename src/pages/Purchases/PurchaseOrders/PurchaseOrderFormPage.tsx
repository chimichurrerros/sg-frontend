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
import { parseDate } from "@/constants/date";
import { toaster } from "@/components/ui/toaster";
import { parsePrice } from "@/constants/price";
import TableEditable, { type EditableLabel } from "@/components/ui/table-edit";

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
    const today = parseDate(new Date());
    const details = isViewMode ? orderData?.purchaseOrder.details : draft?.details;
    const detailLabels: EditableLabel<any>[] = [
    { labelName: "Producto", propName: "productName" },
    { labelName: "Proveedor", propName: "supplierName" },
    { labelName: "Cantidad", propName: "quantityOrdered" },
    {
        labelName: "Precio Unitario",
        isComponent: true,
        render: (item) => parsePrice(item.price),
    },
    {
        labelName: "Precio Subtotal",
        isComponent: true,
        render: (item) => parsePrice(item.price * item.quantityOrdered),
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

            {/* Campo 'Proveedor' eliminado según solicitud */}

            <Field.Root>
                <Field.Label>Estado</Field.Label>
                <Input
                    value={(() => {
                        const purchaseOrderStates: Record<number, string> = {
                             1: "Pendiente",
                             2: "Confirmado",
                             3: "Parcialmente Recibido",
                             4: "Recibido",
                             5: "Cancelado",
                        };
                        const state = isViewMode
                            ? orderData?.purchaseOrder.state
                            : draft?.state;
                        return purchaseOrderStates[state ?? 0] ?? "Desconocido";
                    })()}
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