import { useParams, useNavigate } from "react-router-dom";
import { Box, Flex, Grid, GridItem, HStack, IconButton, Separator, Text, Textarea, VStack } from "@chakra-ui/react";
import { useGetPurchaseReturnById } from "@/queries/purchase-returns.queries";
import { useEffect } from "react";
import { toaster } from "@/components/ui/toaster";
import { purchaseReturnStateMap } from "@/api/purchaseReturns.api";
import { parseDate } from "@/constants/date";
import { parsePrice } from "@/constants/price";
import TableEditable, { type EditableLabel } from "@/components/ui/table-edit";
import EmptyDataScreen from "@/components/ui/screens/empty-data-screen";
import { LoadingScreen } from "@/components/ui/screens/loading-screen";
import { ErrorScreen } from "@/components/ui/screens/error-screen";
import {
    ArrowLeft,
    Building2,
    CalendarDays,
    DollarSign,
    FileInputIcon,
    FileText,
    Hash,
    NotepadText,
    Package,
    ShoppingCart,
    Tag,
    User,
    BadgeCheck,
    BadgeX,
    BadgeAlert,
    ExternalLink,
} from "lucide-react";

interface ViewDetailItem {
    id: number;
    productId: number;
    productName: string;
    quantity: number;
    price: number;
    lineTotal: number;
}

const stateConfig: Record<number, { color: string; icon: typeof BadgeCheck }> = {
    1: { color: "orange", icon: BadgeAlert },
    2: { color: "green", icon: BadgeCheck },
    3: { color: "red", icon: BadgeX },
};

export default function PurchaseReturnView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const purchaseReturnId = Number(id);

    const { data: wrapper, isPending, isError, error } = useGetPurchaseReturnById(purchaseReturnId);

    useEffect(() => {
        if (isError) {
            toaster.create({
                title: "Error al cargar la devolución",
                description: error?.message || "Error desconocido",
                type: "error",
            });
        }
    }, [isError, error]);

    if (isPending) {
        return (
            <Box display="flex" flexDirection="column" gap={4} height="full" alignItems="center" justifyContent="center">
                <LoadingScreen message="Cargando Devolución..." />
            </Box>
        );
    }

    if (isError) {
        return (
            <Box display="flex" flexDirection="column" gap={4} height="full" alignItems="center" justifyContent="center">
                <ErrorScreen title="Error al cargar la devolución" errorMessage={error?.message || "Error desconocido"} />
            </Box>
        );
    }

    if (!wrapper?.purchaseReturn && !isPending) {
        return (
            <Box display="flex" flexDirection="column" gap={4} height="full" alignItems="center" justifyContent="center">
                <EmptyDataScreen title="No se encontró la devolución" message="La devolución que buscas no existe o ha sido eliminada" />
            </Box>
        );
    }

    const pr = wrapper!.purchaseReturn;

    const details: ViewDetailItem[] = (pr.details || []).map((d) => ({
        id: d.id,
        productId: d.productId,
        productName: d.productName,
        quantity: d.quantity,
        price: d.price,
        lineTotal: d.lineTotal,
    }));

    const productLabels: EditableLabel<ViewDetailItem>[] = [
        { labelName: "Producto", propName: "productName" },
        {
            labelName: "Cant. Devuelta",
            propName: "quantity",
            isSortable: true,
            sortFunction: (a, b) => a.quantity - b.quantity,
        },
        {
            labelName: "Precio Unit.",
            propName: "price",
            isSortable: true,
            formatFunction: (value) => parsePrice(Number(value)),
            sortFunction: (a, b) => a.price - b.price,
        },
        {
            labelName: "Subtotal",
            propName: "lineTotal",
            isSortable: true,
            formatFunction: (value) => parsePrice(Number(value)),
            sortFunction: (a, b) => a.lineTotal - b.lineTotal,
        },
    ];

    const totalQuantity = details.reduce((sum, d) => sum + d.quantity, 0);
    const state = stateConfig[pr.state] || { color: "gray", icon: BadgeAlert };

    return (
        <Box height="89vh" display="flex" flexDirection="column" gap={4} p={4}>
            <Flex justify="space-between" alignItems="flex-start" flexShrink={0}>
                <Box>
                    <Text fontSize="2xl" fontWeight="bold">
                        Devolución de Compra N° {pr.number || pr.id}
                    </Text>
                    <Text fontSize="sm" color="gray.500" fontWeight="medium">
                        Fecha de Devolución: {parseDate(pr.date)}
                    </Text>
                </Box>
                <HStack gap={2}>
                    <IconButton
                        variant="surface"
                        colorScheme="blue"
                        aria-label="Volver al listado"
                        onClick={() => navigate("/compras/devoluciones")}
                        p={4}
                    >
                        <ArrowLeft size={18} /> Volver al listado
                    </IconButton>
                    {pr.creditNoteId && (
                        <IconButton
                            variant="outline"
                            colorScheme="blue"
                            aria-label="Ver Nota de Crédito"
                            p={4}
                            onClick={() => navigate(`/ventas/notas-de-credito/${pr.creditNoteId}`)}
                        >
                            <FileText size={18} /> Ver Nota de Crédito
                        </IconButton>
                    )}
                    {pr.billId && (
                        <IconButton
                            variant="outline"
                            colorScheme="green"
                            color="brand.primary"
                            aria-label="Ver Factura"
                            p={4}
                            onClick={() => navigate(`/ventas/facturas/${pr.billId}`)}
                        >
                            <FileInputIcon size={18} /> Ver Factura
                        </IconButton>
                    )}
                    {pr.purchaseOrderForSupplierId && (
                        <IconButton
                            variant="outline"
                            color="brand.secondary"
                            aria-label="Ver Orden de Compra"
                            p={4}
                            onClick={() => navigate(`/compras/ordenes-de-compra/${pr.purchaseOrderForSupplierId}`)}
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
                                    Información de la Devolución
                                </Text>
                                <VStack align="stretch" gap={3}>
                                    <HStack>
                                        <Hash size={18} />
                                        <Text color="gray.600" minW="130px">N° Devolución:</Text>
                                        <Text fontWeight="medium">{pr.number || pr.id}</Text>
                                    </HStack>
                                    <HStack>
                                        <CalendarDays size={18} />
                                        <Text color="gray.600" minW="130px">Fecha:</Text>
                                        <Text fontWeight="medium">{parseDate(pr.date)}</Text>
                                    </HStack>
                                    <HStack>
                                        <Tag size={18} />
                                        <Text color="gray.600" minW="130px">Motivo:</Text>
                                        <Text fontWeight="medium">{pr.reasonName || "-"}</Text>
                                    </HStack>
                                    <HStack alignItems="center">
                                        <state.icon size={18} color={`var(--chakra-colors-${state.color}-500)`} />
                                        <Text color="gray.600" minW="130px">Estado:</Text>
                                        <Box
                                            px={2}
                                            py="1px"
                                            borderRadius="sm"
                                            bg={`${state.color}.50`}
                                            color={`${state.color}.700`}
                                            fontWeight="medium"
                                            fontSize="sm"
                                        >
                                            {purchaseReturnStateMap[pr.state] || "Desconocido"}
                                        </Box>
                                    </HStack>
                                </VStack>
                            </Box>
                        </GridItem>
                        <GridItem>
                            <Box p={4} borderWidth={1} borderRadius="md">
                                <Text fontWeight="bold" mb={3} fontSize="lg">
                                    Proveedor y Sucursal
                                </Text>
                                <VStack align="stretch" gap={3}>
                                    <HStack>
                                        <User size={18} />
                                        <Text color="gray.600" minW="130px">Proveedor:</Text>
                                        <Text fontWeight="medium">{pr.supplierName || "-"}</Text>
                                    </HStack>
                                    <HStack>
                                        <Building2 size={18} />
                                        <Text color="gray.600" minW="130px">Sucursal:</Text>
                                        <Text fontWeight="medium">{pr.branchName || "-"}</Text>
                                    </HStack>
                                    {pr.customerName && (
                                        <HStack>
                                            <User size={18} />
                                            <Text color="gray.600" minW="130px">Cliente:</Text>
                                            <Text fontWeight="medium">{pr.customerName}</Text>
                                        </HStack>
                                    )}
                                    <HStack>
                                        <DollarSign size={18} />
                                        <Text color="gray.600" minW="130px">Total Devolución:</Text>
                                        <Text fontWeight="bold" color="brand.primary" fontSize="md">
                                            {parsePrice(pr.total)}
                                        </Text>
                                    </HStack>
                                </VStack>
                            </Box>
                        </GridItem>
                    </Grid>

                    {(pr.billId || pr.creditNoteId || pr.purchaseOrderForSupplierId) && (
                        <Box p={4} borderWidth={1} borderRadius="md">
                            <Text fontWeight="bold" mb={3} fontSize="lg">
                                Documentos Relacionados
                            </Text>
                            <VStack align="stretch" gap={3}>
                                {pr.purchaseOrderForSupplierId && (
                                    <HStack>
                                        <ShoppingCart size={18} />
                                        <Text color="gray.600" minW="130px">OC por Proveedor:</Text>
                                        <Text fontWeight="medium">#{pr.purchaseOrderForSupplierId}</Text>
                                        <IconButton
                                            size="sm"
                                            variant="outline"
                                            aria-label="Ver OC"
                                            onClick={() => navigate(`/compras/ordenes-de-compra/${pr.purchaseOrderForSupplierId}`)}
                                        >
                                            <ExternalLink size={14} />
                                        </IconButton>
                                    </HStack>
                                )}
                                {pr.billId && (
                                    <HStack>
                                        <FileInputIcon size={18} />
                                        <Text color="gray.600" minW="130px">Factura:</Text>
                                        <Text fontWeight="medium">#{pr.billId}</Text>
                                        <IconButton
                                            size="sm"
                                            variant="outline"
                                            aria-label="Ver Factura"
                                            onClick={() => navigate(`/ventas/facturas/${pr.billId}`)}
                                        >
                                            <ExternalLink size={14} />
                                        </IconButton>
                                    </HStack>
                                )}
                                {pr.creditNoteId && (
                                    <HStack>
                                        <FileText size={18} />
                                        <Text color="gray.600" minW="130px">Nota de Crédito:</Text>
                                        <Text fontWeight="medium">#{pr.creditNoteId}</Text>
                                        <IconButton
                                            size="sm"
                                            variant="outline"
                                            aria-label="Ver Nota de Crédito"
                                            onClick={() => navigate(`/ventas/notas-de-credito/${pr.creditNoteId}`)}
                                        >
                                            <ExternalLink size={14} />
                                        </IconButton>
                                    </HStack>
                                )}
                            </VStack>
                        </Box>
                    )}

                    {pr.observation && (
                        <Box p={4} borderWidth={1} borderRadius="md">
                            <Text fontWeight="bold" mb={3} fontSize="lg" display="flex" alignItems="center" gap={2}>
                                <NotepadText size={18} />
                                Observación
                            </Text>
                            <Textarea
                                value={pr.observation}
                                readOnly
                                size="sm"
                                rows={3}
                                resize="vertical"
                            />
                        </Box>
                    )}

                    <Box borderWidth={1} borderRadius="md" p={4} overflow="hidden">
                        <Text fontWeight="bold" mb={3} fontSize="xl">
                            Productos Devueltos ({details.length} ítems)
                        </Text>
                        <TableEditable
                            labels={productLabels}
                            data={details}
                            readOnly
                            maxHeight="35vh"
                            noItemsComponent={
                                <EmptyDataScreen
                                    title="Sin productos"
                                    message="Esta devolución no tiene productos."
                                    icon={<Package size={48} color="gray" />}
                                />
                            }
                            onDataChange={() => {}}
                        />
                    </Box>

                    <Box p={4} borderWidth={1} borderRadius="md">
                        <Text fontWeight="bold" mb={3} fontSize="lg">
                            Resumen
                        </Text>
                        <Grid templateColumns="repeat(3, 1fr)" gap={6}>
                            <Box>
                                <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wide" mb={1}>
                                    Total Unidades
                                </Text>
                                <Text fontWeight="bold" fontSize="lg">
                                    {totalQuantity}
                                </Text>
                            </Box>
                            <Box>
                                <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wide" mb={1}>
                                    IVA
                                </Text>
                                <Text fontWeight="bold" fontSize="lg">
                                    {parsePrice(pr.taxTotal)}
                                </Text>
                            </Box>
                            <Box>
                                <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wide" mb={1}>
                                    Total
                                </Text>
                                <Text fontWeight="bold" fontSize="lg" color="brand.primary">
                                    {parsePrice(pr.total)}
                                </Text>
                            </Box>
                        </Grid>
                    </Box>
                </VStack>
            </Box>
        </Box>
    );
}
