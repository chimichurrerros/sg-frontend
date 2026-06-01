import { ErrorScreen } from "@/components/ui/screens/error-screen";
import { LoadingScreen } from "@/components/ui/screens/loading-screen";
import { SelectWrapper } from "@/components/ui/select-wrapper";
import type { EditableLabel } from "@/components/ui/table-edit";
import TableEditable from "@/components/ui/table-edit";
import { parseDate } from "@/constants/date";
import { parsePrice } from "@/constants/price";
import { useCreateSalesReturn, useGetSalesReturnById } from "@/queries/sales-return.queries";
import { useGetAllSales } from "@/queries/sales.queries";
import { Box, Flex, HStack, IconButton, Text, Textarea, VStack } from "@chakra-ui/react";
import { ArrowLeft, FileInputIcon, FileText, ShoppingCart } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

interface ReturnSheetPageProps {
    mode: "view" | "create";
}

export default function ReturnSheetPage({ mode }: ReturnSheetPageProps) {
    const returnId = useParams().id;
    const billId = useParams().billId;

    const navigate = useNavigate();
    const createReturn = useCreateSalesReturn();
    const { data: sales, isPending: salesPending, isError: isSalesError, error: salesError } = useGetAllSales();
    const { data: salesReturn, isPending, isError, error } = useGetSalesReturnById(Number(returnId), mode === "view");

    const labels: EditableLabel<{ id: number, productName: string, quantity: number, price: number }>[] = [
        { labelName: "Producto", propName: "productName" },
        { labelName: "Cantidad", propName: "quantity" },
        { labelName: "Precio Unitario", propName: "price", formatFunction: (value) => parsePrice(value) },
    ];

    if (isPending && mode !== "create") {
        return (
            <Box display="flex" flexDirection="column" gap={4} height="full" alignItems="center" justifyContent="center">
                <LoadingScreen message="Cargando Devolución..." />
            </Box>
        );
    }

    if (isError) {
        return (
            <Box display="flex" flexDirection="column" gap={4} height="full" alignItems="center" justifyContent="center">
                <ErrorScreen title="Error al cargar la devolución" errorMessage={error.message || "Error desconocido"} />
            </Box>
        );
    }

    return (
        <Box height="89vh" display="flex" flexDirection="column" gap={4}>
            <Flex justify="space-between" alignItems="center" flexShrink={0} direction="row">
                <Box>
                    <Text fontSize="2xl" fontWeight="bold">
                        {mode === "create" && "Nueva"} Devolución {mode === "view" && `N° ${salesReturn.id} de la venta ${salesReturn.salesOrderNumber}`}
                    </Text>
                    {mode === "view" && (
                        <Text fontSize="md" fontWeight="bold" color="gray.500" mt={1}>
                            Fecha de Devolución: {parseDate(salesReturn.date)}
                        </Text>
                    )}
                </Box>

                {mode === "view" && (
                    
                    <HStack gap={2}>
                           <IconButton
                            variant="surface"
                            colorScheme="blue"
                            aria-label="Ver Nota de Crédito"
                            p={4}
                            onClick={() => navigate(`/ventas/devoluciones`)}
                        >
                            <ArrowLeft size={18} /> Volver al listado
                        </IconButton>
                        <IconButton
                            variant="outline"
                            colorScheme="blue"
                            aria-label="Ver Nota de Crédito"
                            p={4}
                            onClick={() => navigate(`/contabilidad/notas-credito/${salesReturn.creditNoteId}`)}
                        >
                            <FileText size={18} /> Ver Nota de Crédito
                        </IconButton>

                        <IconButton
                            variant="outline"
                            colorScheme="green"
                            aria-label="Ver Factura Afectada"
                            p={4}
                            color="brand.primary"
                            onClick={() => navigate(`/ventas/facturas/${salesReturn.billId}`)}
                        >
                            <FileInputIcon size={18} /> Ver Factura
                        </IconButton>

                        <IconButton
                            variant="outline"
                            color="brand.secondary"
                            p={4}
                            onClick={() => navigate(`/ventas/${salesReturn.salesOrderId}`)}
                            aria-label="Ver Venta Asociada"
                        >
                            <ShoppingCart size={18} /> Ver Venta
                        </IconButton>
                    </HStack>
                )}
            </Flex>



            <Box display="flex" flexDirection="column" gap={4}>
                <HStack gap={4} alignItems="center">
                    {mode === "create" && (
                        <>
                            <Text fontWeight="bold" minW="60px">Venta:</Text>
                            <SelectWrapper
                                options={sales ? sales.salesOrders.map(sale => ({ label: `Venta N° ${sale.number}`, value: String(sale.id) })) : []}
                                value={String(salesReturn?.salesOrderId) || ""}
                                placeholder="Seleccionar Venta"
                                width="300px"
                            />
                        </>
                    )}
                    <Text fontWeight="bold" minW="80px">Sucursal:</Text>
                    <Text>{salesReturn?.branchName || "-"}</Text>
                </HStack>

                <HStack gap={4} alignItems="center">
                    <Text fontWeight="bold" minW="80px">Cliente:</Text>
                    <Text>{salesReturn?.customerName || "Sin nombre"}</Text>
                    <Text fontWeight="bold">RUC:</Text>
                    <Text>{salesReturn?.customerRuc || "Sin RUC"}</Text>
                </HStack>

                <VStack align="stretch" gap={2}>
                    <Text fontWeight="bold">Motivo de Devolución:</Text>
                    <Textarea
                        resize="vertical"
                        placeholder="Ingrese el motivo..."
                        value={salesReturn?.reason || ""}
                        readOnly={mode === "view"}
                        w="100%"
                        rows={3}
                    />
                </VStack>

                <VStack align="stretch" gap={2}>
                    <HStack gap={4} alignItems="center" justifyContent="space-between">
                        <Text fontWeight="bold" fontSize="2xl">{mode === "create" ? "Productos a devolver" : "Productos devueltos"}</Text>
                        <Box><Text fontWeight="bold" fontSize="lg">Cantidad de dinero devuelto:</Text>
                        <Text fontWeight="bold" color="brand.secondary" fontSize="lg">{parsePrice(salesReturn?.total || 0)}</Text></Box>
                    </HStack>
                    <Box borderWidth="1px" borderColor="gray.200" borderRadius="md" overflow="hidden">
                        <TableEditable
                            labels={labels}
                            data={salesReturn?.details || []}
                            readOnly={mode === "view"}
                            onDataChange={() => { }}
                        />
                    </Box>
                </VStack>
            </Box>
        </Box>
    );
}