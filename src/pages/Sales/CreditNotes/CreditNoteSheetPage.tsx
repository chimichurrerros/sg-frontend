import { ArrowLeft, FileText, Building2, User, CalendarDays, DollarSign, FileWarning, ExternalLink } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useGetCreditNoteById } from "@/queries/credit-notes.queries";
import { LoadingScreen } from "@/components/ui/screens/loading-screen";
import { ErrorScreen } from "@/components/ui/screens/error-screen";
import EmptyDataScreen from "@/components/ui/screens/empty-data-screen";
import { parseDate } from "@/constants/date";
import { parsePrice } from "@/constants/price";
import { Box, Flex, Grid, GridItem, HStack, IconButton, Separator, Table, Text, VStack } from "@chakra-ui/react";
import TableEditable, { type EditableLabel } from "@/components/ui/table-edit";
import type { CreditNoteDetail } from "@/api/credit-notes-api";

export default function CreditNoteSheetPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: creditNote, isPending, isError, error } = useGetCreditNoteById(Number(id), true);
    const labels: EditableLabel<CreditNoteDetail>[] = [
        { labelName: "Nombre", propName: "productName", isSortable: true, sortFunction: (a, b) => a.productName.localeCompare(b.productName) },
        { labelName: "Cantidad Devuelta", propName: "quantity", isSortable: true, sortFunction: (a, b) => a.quantity - b.quantity },
        { labelName: "Precio Unitario", propName: "price", isSortable: true, formatFunction: (value) => parsePrice(value), sortFunction: (a, b) => a.price - b.price }
    ]
    if (isPending) {
        return (
            <Box display="flex" flexDirection="column" gap={4} height="full" alignItems="center" justifyContent="center">
                <LoadingScreen message="Cargando Nota de Crédito..." />
            </Box>
        );
    }

    if (isError) {
        return (
            <Box display="flex" flexDirection="column" gap={4} height="full" alignItems="center" justifyContent="center">
                <ErrorScreen title="Error al cargar la nota de crédito" errorMessage={error?.message || "Error desconocido"} />
            </Box>
        );
    }

    if (!creditNote) {
        return (
            <Box display="flex" flexDirection="column" gap={4} height="full" alignItems="center" justifyContent="center">
                <EmptyDataScreen title="No se encontró la nota de crédito" message="La nota de crédito que buscas no existe o ha sido eliminada" />
            </Box>
        );
    }

    return (
        <Box height="89vh" display="flex" flexDirection="column" gap={4} p={4}>
            <Flex justify="space-between" alignItems="center" flexShrink={0}>
                <Box>
                    <Text fontSize="2xl" fontWeight="bold">
                        Nota de Crédito N° {creditNote.id}
                    </Text>
                </Box>
                <HStack gap={2}>
                    <IconButton
                        variant="surface"
                        colorScheme="blue"
                        aria-label="Volver al listado"
                        onClick={() => navigate("/contabilidad/notas-credito")}
                        p={4}
                    >
                        <ArrowLeft size={18} /> Volver al listado
                    </IconButton>
                    <IconButton

                        p={4}

                        variant="outline"
                        colorScheme="green"
                        aria-label="Ver Factura Asociada"
                        onClick={() => navigate(`/ventas/facturas/${creditNote.billId}`)}
                    >
                        <FileText size={18} /> Ver Factura
                    </IconButton>
                </HStack>
            </Flex>

            <Separator />

            <Box flex={1} overflowY="auto">
                <VStack gap={6} align="stretch">
                    <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                        <GridItem>
                            <Box p={4} borderWidth={1} borderRadius="md">
                                <Text fontWeight="bold" mb={3} fontSize="lg">Información General</Text>
                                <VStack align="stretch" gap={3}>
                                    <HStack>
                                        <FileText size={18} />
                                        <Text color="gray.600" minW="130px">N° Nota de Crédito:</Text>
                                        <Text fontWeight="medium">{creditNote.id}</Text>
                                    </HStack>
                                    <HStack>
                                        <CalendarDays size={18} />
                                        <Text color="gray.600" minW="130px">Fecha de Emisión:</Text>
                                        <Text fontWeight="medium">{parseDate(creditNote.date)}</Text>
                                    </HStack>
                                    <HStack>
                                        <DollarSign size={18} />
                                        <Text color="gray.600" minW="130px">Total:</Text>
                                        <Text fontWeight="bold" color="brand.primary" fontSize="lg">{parsePrice(creditNote.total)}</Text>
                                    </HStack>
                                </VStack>
                            </Box>
                        </GridItem>
                        <GridItem>
                            <Box p={4} borderWidth={1} borderRadius="md">
                                <Text fontWeight="bold" mb={3} fontSize="lg">Cliente</Text>
                                <VStack align="stretch" gap={3}>
                                    <HStack>
                                        <User size={18} />
                                        <Text color="gray.600" minW="130px">Nombre:</Text>
                                        <Text fontWeight="medium">{creditNote.customerName}</Text>
                                    </HStack>
                                    <HStack>
                                        <Building2 size={18} />
                                        <Text color="gray.600" minW="130px">RUC:</Text>
                                        <Text fontWeight="medium">{creditNote.customerRuc}</Text>
                                    </HStack>
                                    <HStack>
                                        <FileText size={18} />
                                        <Text color="gray.600" minW="130px">Factura N°:</Text>
                                        <Text fontWeight="medium">{creditNote.billNumber}</Text>
                                        <IconButton size="xs" variant="outline" ml={3}
                                            onClick={() => navigate(`/ventas/facturas/${creditNote.billId}`)}
                                        ><ExternalLink /></IconButton>
                                    </HStack>
                                </VStack>
                            </Box>
                        </GridItem>
                    </Grid>

                    <Box p={4} borderWidth={1} borderRadius="md">
                        <Text fontWeight="bold" mb={3} fontSize="lg" display="flex" alignItems="center" gap={2}>
                            Motivo de la Nota de Crédito
                        </Text>
                        <Text>{creditNote.reason || "Sin motivo especificado"}</Text>
                    </Box>

                    <Box borderWidth={1} borderRadius="md" p={4} overflow="hidden">
                        <Text fontWeight="bold" pb={0} fontSize="xl">Productos</Text>
                        <TableEditable
                            labels={labels}
                            data={creditNote.details}
                            readOnly={true}
                            maxHeight="35vh"
                            onDataChange={null}
                        />
                    </Box>
                </VStack>
            </Box>
        </Box>
    );
}