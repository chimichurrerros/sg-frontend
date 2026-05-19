import { Box, Button, Grid, IconButton, Input, Spinner, Table } from "@chakra-ui/react";
import { Text } from "@chakra-ui/react";
import { SelectWrapper } from "@/components/ui/select-wrapper";
import TableEditable, { type EditableLabel } from "@/components/ui/table-edit";
import { useEffect, useState } from "react";
import { FileInput, Save } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { ConfirmActionDialog } from "@/components/ui/dialogs/confirm-dialog";
import { useGetAllPurchaseRequests } from "@/queries/purchase-request.queries";
import type { PurchaseRequest, PurchaseRequestDetails } from "@/api/purchaseRequest.api";
import EmptyDataScreen from "@/components/ui/screens/empty-data-screen";
import { useGetSupplierQuoteById } from "@/queries/supplier-quotes.queries";
import { LoadingScreen } from "@/components/ui/screens/loading-screen";
import { ErrorScreen } from "@/components/ui/screens/error-screen";
import type { BackendError } from "@/types/types";
import { toaster } from "@/components/ui/toaster";
interface SupplierQuoteSheetProps {
    mode: "create" | "edit";
}
interface ProductSupplierQuote {
    id: number;
    quoteId: number;
    code: number;
    name: string;
    supplierName: string;
    quantity: number;
    unitPrice: number;
    totalPrice?: number;
}

export default function SupplierQuoteSheet({ mode }: SupplierQuoteSheetProps) {
    const { data: purchaseRequests, isPending: loadingPurchaseRequests, isError: isPurchaseRequestsError,error: purchaseReqError} = useGetAllPurchaseRequests();
    
    const { id } = useParams(); //If quoteId is present, we're in edit mode, otherwise create mode
    const { data: quoteData, isPending: loadingQuoteData, error: quoteDataError, isError: isQuoteDataError} = useGetSupplierQuoteById(mode === "edit" ? parseInt(id!) : undefined);
    const [selectedPurchaseRequest, setSelectedPurchaseRequest] = useState<PurchaseRequest | null>(quoteData ? purchaseRequests?.purchaseRequests.find((pr: PurchaseRequest) => pr.id === quoteData.purchaseRequestId) || null : null);
    const [products, setProducts] = useState<PurchaseRequestDetails[]>([]);
    const [errorBody,setErrorBody] = useState<BackendError | null> (null);
    const navigate = useNavigate();
    const labels: EditableLabel<PurchaseRequestDetails>[] = [
        { labelName: "ID", propName: "id" },
        { labelName: "Nombre", propName: "productName", isSortable: true, sortFunction: (a: PurchaseRequestDetails, b: PurchaseRequestDetails) => a.productName.localeCompare(b.productName) },
        // { labelName: "Proveedor", propName: "supplierName" },
        { labelName: "Cantidad Pedida", propName: "quantityRequested", isEditable: true, isSortable: true, sortFunction: (a: PurchaseRequestDetails, b: PurchaseRequestDetails) => a.quantityRequested - b.quantityRequested },
        // { labelName: "Precio Unitario", propName: "unitPrice", isEditable: true, isSortable: true, sortFunction: (a: PurchaseRequestDetails, b: PurchaseRequestDetails) => a.unitPrice - b.unitPrice },
        // { labelName: "Precio Total", propName: "totalPrice", isSortable: true, sortFunction: (a: PurchaseRequestDetails, b: PurchaseRequestDetails) => (a.totalPrice || 0) - (b.totalPrice || 0) }
    ];

    function transformData(data: ProductSupplierQuote[]) {
        const result: { [name: string]: { name: string, quantity: number }[] } = {};
        data.forEach((item: ProductSupplierQuote) => {
            result[item.supplierName] = [...(result[item.supplierName] || []), { name: item.name, quantity: item.quantity }]
        }
        )
        return Object.keys(result).length > 0 ? Object.entries(result).map(([supplierName, products]) => ({ supplierName, products })
        ) : null;
    }
    
    useEffect(() => {
    if (quoteData && purchaseRequests) {
        const pr = purchaseRequests.purchaseRequests.find(
            (pr) => pr.id === quoteData.purchaseRequestId
        ) || null;
        setSelectedPurchaseRequest(pr);
    }
}, [quoteData, purchaseRequests]);

    useEffect(() => {
        if (isQuoteDataError) {
            const body = (quoteDataError as any).response?.data;
            setErrorBody(body as BackendError)
        }
    }, [isQuoteDataError])

    useEffect(() => {
        if (selectedPurchaseRequest) {
            setProducts(selectedPurchaseRequest.details);
        }
    }, [selectedPurchaseRequest])

    useEffect(()=>{
        if(isPurchaseRequestsError){
            toaster.create({title:"Error al traer los pedidos de compra", description: purchaseReqError.message, type:"error"})
        }
    },[isPurchaseRequestsError])
    if (loadingQuoteData && mode !=="create") { return <Box display="flex" flexDirection="column" gap={4} height="full" alignItems="center" justifyContent="center"><LoadingScreen message="Cargando cotización..." /> </Box> }

    if (isQuoteDataError) {
        return <Box display="flex" flexDirection="column" gap={4} height="full" alignItems="center" justifyContent="center">
            <ErrorScreen title="Error al cargar la cotización" errorMessage={errorBody?.title  || quoteDataError.message|| "Error desconocido"} /></Box>
    }

    return (
        <Box display="flex" flexDirection="column" gap={4} height="full" minHeight="0">
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Text fontSize="2xl" fontWeight="bold">{mode === "create" ? "Nueva Cotización de Proveedor" : `Editar Cotización #${id}`}</Text>
                <ConfirmActionDialog trigger={<IconButton p={2} bgColor="brand.secondary" disabled={!products || products.length === 0} size="lg">
                    <FileInput />
                    Generar Orden de Compra
                </IconButton>}
                    title="Generar Órdenes de Compra"
                    description="Esta acción generará las órdenes de compra para cada uno de los proveedores informados en esta cotización."
                    children={
                        <Table.ScrollArea borderWidth="1px" rounded="md" height="300px" >
                            <Table.Root size="sm" stickyHeader>
                                <Table.Header>
                                    <Table.Row bg="bg.subtle">
                                        <Table.ColumnHeader>Proveedor</Table.ColumnHeader>
                                        <Table.ColumnHeader>Nombre</Table.ColumnHeader>
                                        <Table.ColumnHeader >Cantidad</Table.ColumnHeader>
                                    </Table.Row>
                                </Table.Header>

                                <Table.Body>
                                    {/* {transformData(products)?.flatMap((item) =>
                                        item.products.map((product, index) => (
                                            <Table.Row key={`${item.supplierName}-${index}`}>
                                                {index === 0 && (
                                                    <Table.Cell rowSpan={item.products.length} verticalAlign="middle">
                                                        {item.supplierName}
                                                    </Table.Cell>
                                                )}
                                                <Table.Cell>{product.name}</Table.Cell>
                                                <Table.Cell textAlign="center">{product.quantity}</Table.Cell>
                                            </Table.Row>
                                        ))
                                    )} */}
                                </Table.Body>
                            </Table.Root>
                        </Table.ScrollArea>
                    }
                />
            </Box>
            <Box>

                <Grid templateColumns="repeat(3, 1fr)" gap={6} mb={6}>
                    <Box>
                        <Text fontSize="sm" fontWeight="medium" mb={1}>Código *</Text>
                        <Input size="sm" />
                    </Box>
                    <Box>
                        <Text fontSize="sm" fontWeight="medium" mb={1}>Fecha de Cotización *</Text>
                        <Input size="sm" value="09/04/2026" readOnly />
                    </Box>
         
                </Grid>

                {/* Fila 2 */}
                <Grid templateColumns="repeat(3, 1fr)" gap={6} mb={8}>
                    <Box>
                        <Box display="flex" flexDirection="row" gap={2}>
                            <Text fontSize="sm" fontWeight="medium" mb={1}>Pedido de Compra *</Text>
                            <Spinner size="sm" ml={2} display={loadingPurchaseRequests ? "block" : "none"} />
                        </Box>
                        <SelectWrapper
                            disabled={loadingPurchaseRequests || isPurchaseRequestsError}
                            options={purchaseRequests?.purchaseRequests.map((pr) => ({ value: pr.id.toString(), label: `${pr.id} - ${pr.userName} - ${pr.date}` })) || []}
                            width="100%"
                            placeholder="Selecciona un pedido de compra"
                           value={mode === "edit" ? selectedPurchaseRequest?.id.toString() ?? "" : ""}
                            onValueChange={(value) => {
                                const purchaseRequest = purchaseRequests?.purchaseRequests.find((pr) => pr.id.toString() === value);
                                setSelectedPurchaseRequest(purchaseRequest || null);
                            }}

                        />

                    </Box>
                    <Box>
                        <Text fontSize="sm" fontWeight="medium" mb={1}>Establecimiento *</Text>
                        <SelectWrapper
                            options={[
                                { value: "01", label: "01 - ENCARNACION" },
                            ]}
                            width="100%"
                        />
                    </Box>

                </Grid>

                <Box border="1px solid" borderColor="gray.200" borderRadius="md" overflow="hidden" height="47vh">
                    <TableEditable
                        labels={labels} data={products}
                        height="100%"
                        noItemsComponent={<EmptyDataScreen title="No se encontraron productos" message=
                            {selectedPurchaseRequest ? "Al parecer este pedido de compra no tiene ningun producto registrado.": "No hay productos para mostrar en este momento. Puedes seleccionar un pedido de compra para cargar sus productos."}
                             icon={<FileInput size={48} color="gray" />} />}
                        onDataChange={(newData: PurchaseRequestDetails[]) => {
                            setProducts(newData);
                        }}
                    />
                </Box>
                <Box display="flex" justifyContent="space-between" mt={2}>
                    <Button variant="outline" colorScheme="gray" size="lg" onClick={() => navigate("/compras/cotizaciones-proveedores")}>
                        Cancelar
                    </Button>
                    <IconButton p={2} bgColor="brand.primary" size="lg">
                        <Save />
                        Guardar
                    </IconButton>
                </Box>
            </Box>
        </Box>
    )
}