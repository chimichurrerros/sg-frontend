import { Box, Button, IconButton, Input, Spinner } from "@chakra-ui/react";
import { Text } from "@chakra-ui/react";
import { SelectWrapper } from "@/components/ui/select-wrapper";
import TableEditable, { type EditableLabel } from "@/components/ui/table-edit";
import { useEffect, useState } from "react";
import { ArrowLeft, ExternalLink, FileInput, FileQuestion, Save } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { ConfirmActionDialog } from "@/components/ui/dialogs/confirm-dialog";
import { useGetAllPurchaseRequests } from "@/queries/purchase-request.queries";
import type { PurchaseRequest, PurchaseRequestDetails } from "@/api/purchaseRequest.api";
import EmptyDataScreen from "@/components/ui/screens/empty-data-screen";
import { useCreateSupplierQuote, useEditSupplierQuote, useGetSupplierQuoteById } from "@/queries/supplier-quotes.queries";
import { LoadingScreen } from "@/components/ui/screens/loading-screen";
import { ErrorScreen } from "@/components/ui/screens/error-screen";
import type { BackendError } from "@/types/types";
import { toaster } from "@/components/ui/toaster";
import { supplierQuoteStatusMap } from "@/types/purchases";
import { parseDate } from "@/constants/date";
import { useAllSuppliers } from "@/queries/suppliers.queries";
import type { Supplier } from "@/types/suppliers";
import type { CreateSupplierQuoteProduct, EditSupplierQuoteRequest } from "@/api/supplierQuote.api";
interface SupplierQuoteSheetProps {
    mode: "create" | "edit";
}

export default function SupplierQuoteSheet({ mode }: SupplierQuoteSheetProps) {
    const { data: purchaseRequests, isPending: loadingPurchaseRequests, isError: isPurchaseRequestsError, error: purchaseReqError } = useGetAllPurchaseRequests();
    const { data: suppliers, isPending: loadingSuppliers, isError: isErrorSuppliers, error: errorSuppliers } = useAllSuppliers()
    const [selectedSupplierId, setSelectedSupplierId] = useState<number | null>(null)
    const { id } = useParams(); //If quoteId is present, we're in edit mode, otherwise create mode
    const { data: quoteData, isPending: loadingQuoteData, error: quoteDataError, isError: isQuoteDataError } = useGetSupplierQuoteById(mode === "edit" ? parseInt(id!) : -1);
    const [selectedPurchaseRequestId, setSelectedPurchaseRequestId] = useState<number | null>(null);
    const [selectedPurchaseRequest, setSelectedPurchaseRequest] = useState<PurchaseRequest | null>(null);
    const [errorBody, setErrorBody] = useState<BackendError | null>(null);
    const [saleOrderId, setSaleOrderId] = useState<number | null>(null)
    const [products, setProducts] = useState<PurchaseRequestDetails[]>([]);

    const createSupplierQuote = useCreateSupplierQuote()
    const editSupplierQuote = useEditSupplierQuote();
    const navigate = useNavigate();
    const labels: EditableLabel<PurchaseRequestDetails>[] = [
        { labelName: "ID", propName: "id" },
        { labelName: "Nombre", propName: "productName", isSortable: true, sortFunction: (a: PurchaseRequestDetails, b: PurchaseRequestDetails) => a.productName.localeCompare(b.productName) },
        {
            labelName: "Cantidad Pedida", propName: "quantityRequested",
            isEditable: true,
            isSortable: true,
            validate: (value: number | string) => Number(value) > 0,
            sortFunction: (a: PurchaseRequestDetails, b: PurchaseRequestDetails) => a.quantityRequested - b.quantityRequested
        },
        {
            labelName: "Precio Unitario",
            propName: "price", isEditable: true,
            isSortable: true,
            textIfNull: "Definir",
            inputType: "number",
            sortFunction: (a: PurchaseRequestDetails, b: PurchaseRequestDetails) => (a.price || 0) - (b.price || 0)
        },
        {
            labelName: "IVA", propName: "taxRate", textIfNull: "Definir",
            isEditable: true,
            validate: (value: number | string) => Number(value) === 5 || Number(value) === 10,
            transform: (value: string) => Number.isNaN(Number(value)) ? "Definir" : Number(value)
        }
        // { labelName: "Precio Total", propName: "totalPrice", isSortable: true, sortFunction: (a: PurchaseRequestDetails, b: PurchaseRequestDetails) => (a.totalPrice || 0) - (b.totalPrice || 0) }
    ];
    // const [initialLoadDone, setInitialLoadDone] = useState(false);

    //Load products and set ids
    // useEffect 1
    useEffect(() => {
        if (quoteData) {
            setSelectedPurchaseRequestId(quoteData.purchaseRequestId)
            setSelectedSupplierId(quoteData.supplierId)
            setSaleOrderId(quoteData?.associatedPurchaseOrderId || null)
            setSelectedPurchaseRequest(
                purchaseRequests?.purchaseRequests.find(pr => pr.id === quoteData.purchaseRequestId) || null
            )
            setProducts((quoteData.details ?? []).map(d => ({  
                id: d.id,
                productId: d.productId,
                productName: d.productName,
                quantityRequested: d.quantityAvailable,
                price: d.price,
                taxRate: d.taxRate,
            })));
        }
    }, [quoteData])

    // useEffect 2
    useEffect(() => {
        if (selectedPurchaseRequestId && purchaseRequests) {
            const prods = quoteData && selectedPurchaseRequestId === quoteData.purchaseRequestId
                ? (quoteData.details ?? []).map(d => ({  
                    id: d.id,
                    productId: d.productId,
                    productName: d.productName,
                    quantityRequested: d.quantityAvailable,
                    price: d.price,
                    taxRate: d.taxRate,
                }))
                : purchaseRequests?.purchaseRequests.find(
                    (pr) => pr.id === selectedPurchaseRequestId
                )?.details || []

            setSelectedPurchaseRequest(
                purchaseRequests.purchaseRequests.find(pr => pr.id === selectedPurchaseRequestId) || null
            )
            setProducts(prods)
        }
    }, [selectedPurchaseRequestId])


    // useEffect(() => {
    //     if (!purchaseRequests || !quoteData || initialLoadDone) return;

    //     // Carga inicial: usar quoteData.details
    //     setSelectedSupplierId(quoteData.supplierId);
    //     setProducts(quoteData.details.map(d => ({
    //         id: d.id,
    //         productId: d.productId,
    //         productName: d.productName,
    //         quantityRequested: d.quantityAvailable,
    //         price: d.price,
    //         taxRate: d.taxRate,
    //     })));

    //     const pr = purchaseRequests.purchaseRequests.find(pr => pr.id === quoteData.purchaseRequestId) || null;
    //     setSelectedPurchaseRequest(pr);
    //     setSelectedPurchaseRequestId(quoteData.purchaseRequestId);
    //     setInitialLoadDone(true);

    // }, [purchaseRequests, quoteData]) // sin selectedPurchaseRequestId en dependencias

    // Cambios posteriores del usuario
    // useEffect(() => {
    //     if (!initialLoadDone || !purchaseRequests) return;

    //     const pr = purchaseRequests.purchaseRequests.find(pr => pr.id === selectedPurchaseRequestId) || null;
    //     setSelectedPurchaseRequest(pr);
    //     setProducts(pr?.details || []);

    // }, [selectedPurchaseRequestId])

    //Get error msg from back if there is
    useEffect(() => {
        if (isQuoteDataError) {
            const body = (quoteDataError as any).response?.data;
            setErrorBody(body as BackendError)
        }
    }, [isQuoteDataError])
    //Listen for errors in get purchasereq get query
    useEffect(() => {
        if (isPurchaseRequestsError) {
            toaster.create({ title: "Error al traer los pedidos de compra", description: purchaseReqError.message, type: "error" })
        }
    }, [isPurchaseRequestsError])
    //Suppliers error listener
    useEffect(() => {
        if (isErrorSuppliers) { toaster.create({ title: "Error al traer la lista de proveedores", description: errorSuppliers.name || "Error desconocido", type: "error" }) }
    }, [isErrorSuppliers, errorSuppliers])

    function saveSupplierQuoteChanges() {
        if (!selectedPurchaseRequestId || !selectedSupplierId || !quoteData) return;
        const data: EditSupplierQuoteRequest = {
            supplierId: selectedSupplierId,
            purchaseRequestId: selectedPurchaseRequestId,
            details: products.map(({ quantityRequested, id, price, ...rest }) => ({
                ...rest,
                quantityAvailable: quantityRequested,
                price: Number(price)
            } as CreateSupplierQuoteProduct))
        }
        editSupplierQuote.mutate({ id: quoteData.id, data: data })
    }

    // export interface SupplierQuoteCreateRequest {
    //     supplierId:        number;
    //     purchaseRequestId: number;
    //     details:           CreateSupplierQuoteProduct[];
    // }

    //     export interface CreateSupplierQuoteProduct {
    //     productId:         number;
    //     quantityAvailable: number;
    //     price:             number;
    //     taxRate:           number;
    // }
    // export interface PurchaseRequestDetails {
    //     id:                number;
    //     productId:         number;
    //     productName:       string;
    //     price?:            number;
    //     taxRate? :         number;
    //     quantityRequested: number;
    // }

    function createQuote() {
        if (!selectedSupplierId || !selectedPurchaseRequestId) return;
        createSupplierQuote.mutate({
            supplierId: selectedSupplierId, purchaseRequestId: selectedPurchaseRequestId,
            details: products.map(({ quantityRequested, ...p }) => {
                return { quantityAvailable: quantityRequested, ...p } as CreateSupplierQuoteProduct
            })
        })
    }

    if (loadingQuoteData && mode !== "create") { return <Box display="flex" flexDirection="column" gap={4} height="full" alignItems="center" justifyContent="center"><LoadingScreen message="Cargando cotización..." /> </Box> }

    if (isQuoteDataError) {
        return <Box display="flex" flexDirection="column" gap={4} height="full" alignItems="center" justifyContent="center">
            <ErrorScreen title="Error al cargar la cotización" errorMessage={errorBody?.title || quoteDataError.message || "Error desconocido"} /></Box>
    }

    return (
        <Box display="flex" flexDirection="column" gap={4} height="full" minHeight="0">
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box display={"flex"} flexDirection={"column"} gap={1}>
                    <Text fontSize="2xl" fontWeight="bold">{mode === "create" ? "Nueva Cotización de Proveedor" : `Editar Cotización #${id}`}</Text>
                    {mode === "edit" && saleOrderId && <Text fontSize="sm" color="gray" fontStyle="italic"> Esta cotización no es editable puesto que ya tiene una orden de compra asociada.</Text>}
                </Box>
                <Box display="flex" gap={4}>
                    <IconButton p={2} variant="outline" size="lg" onClick={() => navigate("/compras/cotizaciones-proveedores")}>
                        <ArrowLeft />
                        Volver al listado
                    </IconButton>
                    {mode === "create" && <ConfirmActionDialog
                        trigger={<IconButton p={2} bgColor="brand.secondary" disabled={!products || products.length === 0 || products.some(p => !p.price || !p.taxRate || !p.quantityRequested) || !selectedPurchaseRequestId || !selectedSupplierId} size="lg">
                            {editSupplierQuote.isPending || createSupplierQuote.isPending ? <Spinner /> : <FileInput />}
                            Crear cotización
                        </IconButton>}
                        title="Generar Órdenes de Compra"
                        description={"Esta acción generará la orden de compra a " + suppliers?.suppliers.find(s => s.id === selectedSupplierId)?.businessName.toUpperCase()}
                        onAccept={() => createQuote()}
                    />}
                    {mode === "edit" && <IconButton p={2} bgColor="brand.primary" disabled={!saleOrderId} size="lg" onClick={() => quoteData?.associatedPurchaseOrderId && navigate("/compras/ordenes-de-compra/" + quoteData?.associatedPurchaseOrderId)}>
                        <ExternalLink />
                        Ver Orden de Compra asociada
                    </IconButton>}
                </Box>
            </Box>
            <Box>

                <Box display="flex" flexWrap="wrap" gap={6} my={6}>
                    <Box minWidth="250px" flex="1">
                        <Box display="flex" flexDirection="row" gap={2}>
                            <Text fontSize="sm" fontWeight="medium" mb={1}>Pedido de Compra *</Text>
                            <Spinner size="sm" ml={2} display={loadingPurchaseRequests ? "block" : "none"} />
                        </Box>
                        <SelectWrapper
                            disabled={loadingPurchaseRequests || isPurchaseRequestsError || saleOrderId !== null}
                            options={purchaseRequests?.purchaseRequests.map((pr) => ({ value: pr.id.toString(), label: `${pr.id} - ${pr.userName} - ${parseDate(pr.date)}` })) || []}
                            placeholder="Selecciona un pedido de compra"
                            width="full"
                            value={selectedPurchaseRequestId?.toString() || ""}
                            onValueChange={(value) => {
                                setSelectedPurchaseRequestId(parseInt(value))
                                // if(!purchaseRequests) return;
                                // const pr = purchaseRequests.purchaseRequests.find(pr => pr.id === selectedPurchaseRequestId) || null;
                                // setSelectedPurchaseRequest(pr);
                                // setProducts(pr?.details || []);
                            }}
                        />
                    </Box>
                    <Box minWidth="250px" flex="1">
                        <Box display="flex" flexDirection="row" gap={3}>
                            <Text fontSize="sm" fontWeight="medium" mb={1}>Proveedores *</Text>
                            {loadingSuppliers && <Spinner size="sm" />}
                        </Box>
                        <SelectWrapper
                            options={suppliers ? suppliers.suppliers.map((sp: Supplier) => ({ value: sp.id.toString(), label: sp.businessName })) : []}
                            width="100%"
                            placeholder="Selecciona un proveedor"
                            disabled={quoteData?.state == 2 || saleOrderId !== null}
                            value={selectedSupplierId?.toString() || ""}
                            onValueChange={(value) => setSelectedSupplierId(Number(value))}
                        />
                    </Box>
                    <Box minWidth="250px" flex="1">
                        <Text fontSize="sm" fontWeight="medium" mb={1}>Fecha de Cotización</Text>
                        <Input value={quoteData ? parseDate(quoteData.date) : parseDate(new Date())} readOnly />
                    </Box>

                    {mode === "edit" && (
                        <Box minWidth="250px" flex="1">
                            <Text fontSize="sm" fontWeight="medium" mb={1}>Situación</Text>
                            <Input color={quoteData?.state == 2 ? "red.600" : ""} value={quoteData ? supplierQuoteStatusMap[quoteData?.state] : "Desconocido"} readOnly />
                        </Box>
                    )}
                </Box>

                <Box border="1px solid" borderColor="gray.200" borderRadius="md" overflow="hidden" height="47vh">
                    <TableEditable
                        key={JSON.stringify(products)}
                        labels={labels} data={products}
                        height="100%"
                        readOnly={saleOrderId !== null || (mode === "edit" && quoteData ? quoteData.state === 2 : false)}
                        noItemsComponent={<EmptyDataScreen title="No se encontraron productos" message=
                            {selectedPurchaseRequest ? "Al parecer este pedido de compra no tiene ningun producto registrado." : "No hay productos para mostrar en este momento. Puedes seleccionar un pedido de compra para cargar sus productos."}
                            icon={selectedPurchaseRequest ? <FileQuestion size={48} color="gray" /> : <FileInput size={48} color="gray" />} />}
                        onDataChange={(newData: PurchaseRequestDetails[]) => {
                            setProducts(newData);
                        }}

                    />
                </Box>
                {mode === "edit" && <Box display="flex" justifyContent="space-between" mt={6}>
                    <Button variant="outline" colorScheme="gray" size="lg" onClick={() => navigate("/compras/cotizaciones-proveedores")}>
                        Cancelar
                    </Button>
                    <ConfirmActionDialog trigger={<IconButton p={2}
                        bgColor="brand.primary" size="lg"
                        disabled={products.some(p => !p.price || !p.taxRate || !p.quantityRequested) || !selectedPurchaseRequestId || !selectedSupplierId || editSupplierQuote.isPending || products.length === 0}>
                        {editSupplierQuote.isPending ? <Spinner /> : <Save />}
                        Guardar
                    </IconButton>}
                        title={"Editar Cotización #" + quoteData?.id + "?"}
                        description="Se guardarán los cambios hechos a la cotización"
                        onAccept={saveSupplierQuoteChanges}
                    />
                </Box>}
            </Box>
        </Box>
    )
}