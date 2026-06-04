import { useParams, useNavigate } from "react-router-dom";
import { Box, Flex, Grid, GridItem, HStack, IconButton, Separator, Text, Textarea, VStack } from "@chakra-ui/react";
import { useGetPurchaseReceiptById } from "@/queries/purchase-receipts.queries";
import { useEffect } from "react";
import { toaster } from "@/components/ui/toaster";
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
    Hash,
    NotepadText,
    Package,
    ReceiptText,
    ShoppingCart,
    Stamp,
    User,
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

export default function PurchaseReceiptView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const receiptId = Number(id);

    const { data: wrapper, isPending, isError, error } = useGetPurchaseReceiptById(receiptId);

    useEffect(() => {
        if (isError) {
            toaster.create({
                title: "Error al cargar la recepción",
                description: error?.message || "Error desconocido",
                type: "error",
            });
        }
    }, [isError, error]);

    if (isPending) {
        return (
            <Box display="flex" flexDirection="column" gap={4} height="full" alignItems="center" justifyContent="center">
                <LoadingScreen message="Cargando Recepción..." />
            </Box>
        );
    }

    if (isError) {
        return (
            <Box display="flex" flexDirection="column" gap={4} height="full" alignItems="center" justifyContent="center">
                <ErrorScreen title="Error al cargar la recepción" errorMessage={error?.message || "Error desconocido"} />
            </Box>
        );
    }

    if (!wrapper?.purchaseReceipt && !isPending) {
        return (
            <Box display="flex" flexDirection="column" gap={4} height="full" alignItems="center" justifyContent="center">
                <EmptyDataScreen title="No se encontró la recepción" message="La recepción que buscas no existe o ha sido eliminada" />
            </Box>
        );
    }

    const receipt = wrapper!.purchaseReceipt;

    const details: ViewDetailItem[] = (receipt.details || []).map((d) => ({
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
            labelName: "Cant. Recibida",
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

    return (
        <Box height="89vh" display="flex" flexDirection="column" gap={4} p={4}>
            <Flex justify="space-between" alignItems="flex-start" flexShrink={0}>
                <Box>
                    <Text fontSize="2xl" fontWeight="bold">
                        Recepción de OC N° {receipt.number || receipt.id}
                    </Text>
                    <Text fontSize="sm" color="gray.500" fontWeight="medium">
                        Fecha de Recepción: {parseDate(receipt.date)}
                    </Text>
                </Box>
                <HStack gap={2}>
                    <IconButton
                        variant="surface"
                        colorScheme="blue"
                        aria-label="Volver al listado"
                        onClick={() => navigate("/compras/recepcion-ordenes-compra")}
                        p={4}
                    >
                        <ArrowLeft size={18} /> Volver al listado
                    </IconButton>
                    {receipt.billId && (
                        <IconButton
                            variant="outline"
                            colorScheme="green"
                            color="brand.primary"
                            aria-label="Ver Factura"
                            p={4}
                            onClick={() => navigate(`/ventas/facturas/${receipt.billId}`)}
                        >
                            <FileInputIcon size={18} /> Ver Factura
                        </IconButton>
                    )}
                    {receipt.purchaseOrderForSupplierId && (
                        <IconButton
                            variant="outline"
                            color="brand.secondary"
                            aria-label="Ver Orden de Compra"
                            p={4}
                            onClick={() => navigate(`/compras/ordenes-de-compra/${receipt.purchaseOrderForSupplierId}`)}
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
                                    Información de la Recepción
                                </Text>
                                <VStack align="stretch" gap={3}>
                                    <HStack>
                                        <ReceiptText size={18} />
                                        <Text color="gray.600" minW="130px">N° Factura:</Text>
                                        <Text fontWeight="medium">{receipt.number || "-"}</Text>
                                    </HStack>
                                    <HStack>
                                        <CalendarDays size={18} />
                                        <Text color="gray.600" minW="130px">Fecha:</Text>
                                        <Text fontWeight="medium">{parseDate(receipt.date)}</Text>
                                    </HStack>
                                    <HStack>
                                        <Stamp size={18} />
                                        <Text color="gray.600" minW="130px">Timbrado:</Text>
                                        <Text fontWeight="medium">{receipt.stamp || "-"}</Text>
                                    </HStack>
                                    <HStack>
                                        <User size={18} />
                                        <Text color="gray.600" minW="130px">Proveedor:</Text>
                                        <Text fontWeight="medium">{receipt.supplierName || "-"}</Text>
                                    </HStack>
                                </VStack>
                            </Box>
                        </GridItem>
                        <GridItem>
                            <Box p={4} borderWidth={1} borderRadius="md">
                                <Text fontWeight="bold" mb={3} fontSize="lg">
                                    Detalles
                                </Text>
                                <VStack align="stretch" gap={3}>
                                    <HStack>
                                        <Building2 size={18} />
                                        <Text color="gray.600" minW="130px">Sucursal:</Text>
                                        <Text fontWeight="medium">{receipt.branchName || "-"}</Text>
                                    </HStack>
                                    <HStack>
                                        <Hash size={18} />
                                        <Text color="gray.600" minW="130px">N° Recepción:</Text>
                                        <Text fontWeight="medium">{receipt.id}</Text>
                                    </HStack>
                                    <HStack>
                                        <DollarSign size={18} />
                                        <Text color="gray.600" minW="130px">Total Recepción:</Text>
                                        <Text fontWeight="bold" color="brand.primary" fontSize="md">
                                            {parsePrice(receipt.total)}
                                        </Text>
                                    </HStack>
                                </VStack>
                            </Box>
                        </GridItem>
                    </Grid>

                    {(receipt.billId || receipt.purchaseOrderForSupplierId) && (
                        <Box p={4} borderWidth={1} borderRadius="md">
                            <Text fontWeight="bold" mb={3} fontSize="lg">
                                Documentos Relacionados
                            </Text>
                            <VStack align="stretch" gap={3}>
                                {receipt.purchaseOrderForSupplierId && (
                                    <HStack>
                                        <ShoppingCart size={18} />
                                        <Text color="gray.600" minW="130px">OC por Proveedor:</Text>
                                        <Text fontWeight="medium">#{receipt.purchaseOrderForSupplierId}</Text>
                                        <IconButton
                                            size="sm"
                                            variant="outline"
                                            aria-label="Ver OC"
                                            onClick={() => navigate(`/compras/ordenes-de-compra/${receipt.purchaseOrderForSupplierId}`)}
                                        >
                                            <ExternalLink size={14} />
                                        </IconButton>
                                    </HStack>
                                )}
                                {receipt.billId && (
                                    <HStack>
                                        <FileInputIcon size={18} />
                                        <Text color="gray.600" minW="130px">Factura:</Text>
                                        <Text fontWeight="medium">#{receipt.billId}</Text>
                                        <IconButton
                                            size="sm"
                                            variant="outline"
                                            aria-label="Ver Factura"
                                            onClick={() => navigate(`/ventas/facturas/${receipt.billId}`)}
                                        >
                                            <ExternalLink size={14} />
                                        </IconButton>
                                    </HStack>
                                )}
                            </VStack>
                        </Box>
                    )}

                    {receipt.observation && (
                        <Box p={4} borderWidth={1} borderRadius="md">
                            <Text fontWeight="bold" mb={3} fontSize="lg" display="flex" alignItems="center" gap={2}>
                                <NotepadText size={18} />
                                Observación
                            </Text>
                            <Textarea
                                value={receipt.observation}
                                readOnly
                                size="sm"
                                rows={3}
                                resize="vertical"
                            />
                        </Box>
                    )}

                    <Box borderWidth={1} borderRadius="md" p={4} overflow="hidden">
                        <Text fontWeight="bold" mb={3} fontSize="xl">
                            Productos Recibidos ({details.length} ítems)
                        </Text>
                        <TableEditable
                            labels={productLabels}
                            data={details}
                            readOnly
                            maxHeight="35vh"
                            noItemsComponent={
                                <EmptyDataScreen
                                    title="Sin productos"
                                    message="Esta recepción no tiene productos."
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
                                    {parsePrice(receipt.taxTotal)}
                                </Text>
                            </Box>
                            <Box>
                                <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wide" mb={1}>
                                    Total
                                </Text>
                                <Text fontWeight="bold" fontSize="lg" color="brand.primary">
                                    {parsePrice(receipt.total)}
                                </Text>
                            </Box>
                        </Grid>
                    </Box>
                </VStack>
            </Box>
        </Box>
    );
}
