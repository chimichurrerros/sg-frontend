import { useParams, useNavigate } from "react-router-dom";
import { Box, Flex, Grid, GridItem, HStack, IconButton, Separator, Text, VStack } from "@chakra-ui/react";
import { useGetPaymentOrderById } from "@/queries/paymentOrders.queries";
import { useEffect } from "react";
import { toaster } from "@/components/ui/toaster";
import { paymentOrderStateMap } from "@/api/paymentOrders.api";
import { parseDate } from "@/constants/date";
import { parsePrice } from "@/constants/price";
import TableEditable, { type EditableLabel } from "@/components/ui/tables/table-edit";
import EmptyDataScreen from "@/components/ui/screens/empty-data-screen";
import { LoadingScreen } from "@/components/ui/screens/loading-screen";
import { ErrorScreen } from "@/components/ui/screens/error-screen";
import type { PaymentOrderBillDto, PaymentOrderCreditNoteDto, PaymentOrderMovementDto } from "@/api/paymentOrders.api";
import {
    ArrowLeft,
    Building2,
    CalendarDays,
    CreditCard,
    DollarSign,
    FileInputIcon,
    Hash,
    ShoppingCart,
    ExternalLink,
    Receipt,
} from "lucide-react";

export default function PaymentOrderView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const paymentOrderId = Number(id);

    const { data: wrapper, isPending, isError, error } = useGetPaymentOrderById(paymentOrderId);

    useEffect(() => {
        if (isError) {
            toaster.create({
                title: "Error al cargar la orden de pago",
                description: error?.message || "Error desconocido",
                type: "error",
            });
        }
    }, [isError, error]);

    if (isPending) {
        return (
            <Box display="flex" flexDirection="column" gap={4} height="full" alignItems="center" justifyContent="center">
                <LoadingScreen message="Cargando Orden de Pago..." />
            </Box>
        );
    }

    if (isError) {
        return (
            <Box display="flex" flexDirection="column" gap={4} height="full" alignItems="center" justifyContent="center">
                <ErrorScreen title="Error al cargar la orden de pago" errorMessage={error?.message || "Error desconocido"} />
            </Box>
        );
    }

    if (!wrapper?.paymentOrder && !isPending) {
        return (
            <Box display="flex" flexDirection="column" gap={4} height="full" alignItems="center" justifyContent="center">
                <EmptyDataScreen title="No se encontró la orden de pago" message="La orden de pago que buscas no existe o ha sido eliminada" />
            </Box>
        );
    }

    const po = wrapper!.paymentOrder;
    const stateLabel = paymentOrderStateMap[po.stateId || ""] || po.stateId || "Pendiente";
    const stateColor = po.stateId === "Processed" ? "green" : po.stateId === "Cancelled" ? "red" : "orange";

    const billLabels: EditableLabel<PaymentOrderBillDto>[] = [
        { labelName: "N° Factura", propName: "billNumber" },
        { labelName: "Monto", propName: "amount", formatFunction: (value) => parsePrice(Number(value)) },
    ];

    const movementLabels: EditableLabel<PaymentOrderMovementDto>[] = [
        { labelName: "Fecha", propName: "date", formatFunction: (value) => parseDate(String(value)) },
        { labelName: "Monto", propName: "amount", formatFunction: (value) => parsePrice(Number(value)) },
        { labelName: "Método", propName: "paymentMethod" },
        { labelName: "Referencia", propName: "referenceNumber" },
    ];

    const creditNoteLabels: EditableLabel<PaymentOrderCreditNoteDto>[] = [
        { labelName: "Nota de Crédito", propName: "creditNoteNumber" },
        { labelName: "Monto", propName: "amount", formatFunction: (value) => parsePrice(Number(value)) },
    ];

    return (
        <Box height="89vh" display="flex" flexDirection="column" gap={4} p={4}>
            <Flex justify="space-between" alignItems="flex-start" flexShrink={0}>
                <Box>
                    <Text fontSize="2xl" fontWeight="bold">
                        Orden de Pago N° {po.id}
                    </Text>
                    <Text fontSize="sm" color="gray.500" fontWeight="medium">
                        Fecha: {parseDate(po.date)}
                    </Text>
                </Box>
                <HStack gap={2}>
                    <IconButton
                        variant="surface"
                        colorScheme="blue"
                        aria-label="Volver al listado"
                        onClick={() => navigate("/tesoreria/ordenes-pago")}
                        p={4}
                    >
                        <ArrowLeft size={18} /> Volver al listado
                    </IconButton>
                    {po.bills && po.bills.length > 0 && po.bills[0].billId && (
                        <IconButton
                            variant="outline"
                            colorScheme="green"
                            color="brand.primary"
                            aria-label="Ver Factura"
                            p={4}
                            onClick={() => navigate(`/ventas/facturas/${po.bills![0].billId}`)}
                        >
                            <FileInputIcon size={18} /> Ver Factura
                        </IconButton>
                    )}
                    {po.purchaseOrderForSupplierId && (
                        <IconButton
                            variant="outline"
                            color="brand.secondary"
                            aria-label="Ver Orden de Compra"
                            p={4}
                            onClick={() => navigate(`/compras/ordenes-de-compra/${po.purchaseOrderForSupplierId}`)}
                        >
                            <ShoppingCart size={18} /> Ver OC
                        </IconButton>
                    )}
                </HStack>
            </Flex>

            <Separator />

            <Box flex={1} overflowY="auto">
                <VStack gap={6} align="stretch">
                    <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                        <GridItem>
                            <Box p={4} borderWidth={1} borderRadius="md">
                                <Text fontWeight="bold" mb={3} fontSize="lg">
                                    Información del Pago
                                </Text>
                                <VStack align="stretch" gap={3}>
                                    <HStack>
                                        <Hash size={18} />
                                        <Text color="gray.600" minW="130px">N° Orden de Pago:</Text>
                                        <Text fontWeight="medium">{po.id}</Text>
                                    </HStack>
                                    <HStack>
                                        <CalendarDays size={18} />
                                        <Text color="gray.600" minW="130px">Fecha:</Text>
                                        <Text fontWeight="medium">{parseDate(po.date)}</Text>
                                    </HStack>
                                    <HStack>
                                        <DollarSign size={18} />
                                        <Text color="gray.600" minW="130px">Monto:</Text>
                                        <Text fontWeight="bold" color="brand.primary" fontSize="md">
                                            {parsePrice(po.total)}
                                        </Text>
                                    </HStack>
                                    <HStack>
                                        <CreditCard size={18} />
                                        <Text color="gray.600" minW="130px">Método de Pago:</Text>
                                        <Text fontWeight="medium">{po.paymentMethod || "-"}</Text>
                                    </HStack>
                                </VStack>
                            </Box>
                        </GridItem>
                        <GridItem>
                            <Box p={4} borderWidth={1} borderRadius="md">
                                <Text fontWeight="bold" mb={3} fontSize="lg">
                                    Referencias
                                </Text>
                                <VStack align="stretch" gap={3}>
                                    <HStack>
                                        <Building2 size={18} />
                                        <Text color="gray.600" minW="130px">Proveedor ID:</Text>
                                        <Text fontWeight="medium">#{po.supplierId || "-"}</Text>
                                    </HStack>
                                    <HStack>
                                        <ShoppingCart size={18} />
                                        <Text color="gray.600" minW="130px">OC por Proveedor:</Text>
                                        <Text fontWeight="medium">#{po.purchaseOrderForSupplierId}</Text>
                                        <IconButton
                                            size="sm"
                                            variant="outline"
                                            aria-label="Ver OC"
                                            onClick={() => navigate(`/compras/ordenes-de-compra/${po.purchaseOrderForSupplierId}`)}
                                        >
                                            <ExternalLink size={14} />
                                        </IconButton>
                                    </HStack>
                                    <HStack alignItems="center">
                                        <Receipt size={18} />
                                        <Text color="gray.600" minW="130px">Estado:</Text>
                                        <Box
                                            px={2}
                                            py="1px"
                                            borderRadius="sm"
                                            bg={`${stateColor}.50`}
                                            color={`${stateColor}.700`}
                                            fontWeight="medium"
                                            fontSize="sm"
                                        >
                                            {stateLabel}
                                        </Box>
                                    </HStack>
                                </VStack>
                            </Box>
                        </GridItem>
                    </Grid>

                    {po.bills && po.bills.length > 0 && (
                        <Box borderWidth={1} borderRadius="md" p={4} overflow="hidden">
                            <Text fontWeight="bold" mb={3} fontSize="xl">
                                Facturas ({po.bills.length})
                            </Text>
                            <TableEditable
                                labels={billLabels}
                                data={po.bills}
                                readOnly
                                maxHeight="20vh"
                                noItemsComponent={
                                    <EmptyDataScreen title="Sin facturas" message="No hay facturas asociadas." />
                                }
                                onDataChange={() => {}}
                            />
                        </Box>
                    )}

                    {po.creditNotes && po.creditNotes.length > 0 && (
                        <Box borderWidth={1} borderRadius="md" p={4} overflow="hidden">
                            <Text fontWeight="bold" mb={3} fontSize="xl">
                                Notas de Crédito ({po.creditNotes.length})
                            </Text>
                            <TableEditable
                                labels={creditNoteLabels}
                                data={po.creditNotes}
                                readOnly
                                maxHeight="20vh"
                                noItemsComponent={
                                    <EmptyDataScreen title="Sin notas de crédito" message="No hay notas de crédito asociadas." />
                                }
                                onDataChange={() => {}}
                            />
                        </Box>
                    )}

                    {po.movements && po.movements.length > 0 && (
                        <Box borderWidth={1} borderRadius="md" p={4} overflow="hidden">
                            <Text fontWeight="bold" mb={3} fontSize="xl">
                                Movimientos Bancarios ({po.movements.length})
                            </Text>
                            <TableEditable
                                labels={movementLabels}
                                data={po.movements}
                                readOnly
                                maxHeight="20vh"
                                noItemsComponent={
                                    <EmptyDataScreen title="Sin movimientos" message="No hay movimientos bancarios asociados." />
                                }
                                onDataChange={() => {}}
                            />
                        </Box>
                    )}

                    <Box p={4} borderWidth={1} borderRadius="md">
                        <Text fontWeight="bold" mb={3} fontSize="lg">
                            Resumen
                        </Text>
                        <Grid templateColumns="repeat(3, 1fr)" gap={6}>
                            <Box>
                                <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wide" mb={1}>
                                    Facturas
                                </Text>
                                <Text fontWeight="bold" fontSize="lg">
                                    {po.bills?.length || 0}
                                </Text>
                            </Box>
                            <Box>
                                <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wide" mb={1}>
                                    Notas de Crédito
                                </Text>
                                <Text fontWeight="bold" fontSize="lg">
                                    {po.creditNotes?.length || 0}
                                </Text>
                            </Box>
                            <Box>
                                <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wide" mb={1}>
                                    Total
                                </Text>
                                <Text fontWeight="bold" fontSize="lg" color="brand.primary">
                                    {parsePrice(po.total)}
                                </Text>
                            </Box>
                        </Grid>
                    </Box>
                </VStack>
            </Box>
        </Box>
    );
}
