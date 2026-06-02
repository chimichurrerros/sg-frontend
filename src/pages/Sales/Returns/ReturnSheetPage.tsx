import type { SaleReturn, SaleReturnDetail } from "@/api/returns.api";
import type { FullSaleOrder } from "@/api/sales.api";
import { AlertDialog } from "@/components/ui/dialogs/alert-dialog";
import EmptyDataScreen from "@/components/ui/screens/empty-data-screen";
import { ErrorScreen } from "@/components/ui/screens/error-screen";
import { LoadingScreen } from "@/components/ui/screens/loading-screen";
import { SelectWrapper } from "@/components/ui/select-wrapper";
import type { EditableLabel } from "@/components/ui/table-edit";
import TableEditable from "@/components/ui/table-edit";
import { parseDate } from "@/constants/date";
import { parsePrice } from "@/constants/price";
import { useAllBranches } from "@/queries/branches.queries";
import { useCreateSalesReturn, useGetSalesReturnById } from "@/queries/sales-return.queries";
import { useGetAllSales } from "@/queries/sales.queries";
import { Box, Flex, HStack, IconButton, Spinner, Text, Textarea, VStack } from "@chakra-ui/react";
import { ArrowLeft, CornerDownLeft, CornerDownRight, FileInputIcon, FileText, HandCoins, PackagePlus, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
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
    const { data: branches } = useAllBranches();
    const [form, setForm] = useState<Partial<SaleReturn>>({})
    const [selectedSale, setSelectedSale] = useState<FullSaleOrder | null>(null);
    const [returnProducts, setReturnProducts] = useState<SaleReturnDetail[]>([])

    const saleReturnLabels: EditableLabel<SaleReturnDetail>[] = [
        { labelName: "Producto", propName: "productName" },
        { labelName: "Cantidad a Devolver", propName: "quantity", isEditable: true, inputType: "number", validate: (value, item) => value > 0 && value <= (item?.maxQuantity || 0) },
        { labelName: "Precio Unitario", propName: "price", formatFunction: (value) => parsePrice(value) },
        {
            labelName: "Cancelar", propName: "id", isComponent: true, render: (item: SaleReturnDetail) => <IconButton variant="subtle" size={"xs"}
                onClick={() => {
                    setForm({ ...form, details: [...(form.details || []), { ...item, quantity: item.maxQuantity } as SaleReturnDetail] })
                    setReturnProducts(returnProducts.filter(p => p.id !== item.id))
                }}
            ><CornerDownLeft /></IconButton>
        }
    ];

    const labels: EditableLabel<SaleReturnDetail>[] = [
        { labelName: "Producto", propName: "productName" },
        { labelName: "Cantidad " + (mode === "view" ? "Devuelta" : "Vendida"), propName: "quantity" },
        { labelName: "Precio Unitario", propName: "price", formatFunction: (value) => parsePrice(value) },
    ];

    if (mode === "create") {
        labels.push({
            labelName: "Devolver", propName: "id", isComponent: true, render: (item: SaleReturnDetail) => <IconButton variant="subtle" size={"xs"}
                onClick={() => {
                    setReturnProducts([...returnProducts, { id: item.id, productId: item.productId, productName: item.productName, quantity: 1, price: item.price, maxQuantity: item.quantity }])
                    setForm({ ...form, details: (form.details || []).filter(d => d.id !== item.id) })
                }}
            ><CornerDownRight /></IconButton>
        })
    }

    useEffect(() => {
        if (salesReturn && mode === "view") {
            setForm(salesReturn);
            if (salesReturn.details) {
                setReturnProducts(salesReturn.details);
            }
        }
    }, [salesReturn, mode]);

    useEffect(() => {
        if (mode === "create" && selectedSale) {
            setForm({
                ...form,
                billId: Number(selectedSale.bills[0]?.id),
                total: 0,
                details: selectedSale?.details.map(d => ({
                    id: d.id,
                    productId: d.productId,
                    productName: d.productName,
                    price: d.price,
                    quantity: d.quantityInvoiced,
                    maxQuantity: d.quantityInvoiced
                })) || [],
                customerName: selectedSale.customerName,
                customerRuc: selectedSale.customerRuc,
                branchId: selectedSale.branchId,
                salesOrderNumber: selectedSale.number,
                salesOrderId: selectedSale.id
            })
        }
    }, [selectedSale])

    useEffect(() => {
        if (mode === "create" && form.salesOrderId) {
            const sale = sales?.salesOrders.find(s => s.id === form.salesOrderId) || null;
            setSelectedSale(sale);
        }
    }, [form.salesOrderId, sales, mode])

    useEffect(() => {
        if (mode === "create") {
            setForm({ ...form, total: returnProducts.reduce((sum, p) => sum + (p.price || 0) * (p.quantity || 0), 0) })
        }
    }, [returnProducts])

    if (mode === "view" && isPending) {
        return (
            <Box display="flex" flexDirection="column" gap={4} height="full" alignItems="center" justifyContent="center">
                <LoadingScreen message="Cargando Devolución..." />
            </Box>
        );
    }

    if (mode === "view" && isError) {
        return (
            <Box display="flex" flexDirection="column" gap={4} height="full" alignItems="center" justifyContent="center">
                <ErrorScreen title="Error al cargar la devolución" errorMessage={error?.message || "Error desconocido"} />
            </Box>
        );
    }

    if (mode === "view" && !salesReturn && !isPending) {
        return (
            <Box display="flex" flexDirection="column" gap={4} height="full" alignItems="center" justifyContent="center">
                <EmptyDataScreen title="No se encontró la devolución" message="La devolución que buscas no existe o ha sido eliminada" />
            </Box>
        );
    }

    const displayData = mode === "view" ? salesReturn : form;

    return (
        <Box height="89vh" display="flex" flexDirection="column" gap={4}>
            <Flex justify="space-between" alignItems="center" flexShrink={0} direction="row">
                <Box>
                    <Text fontSize="2xl" fontWeight="bold">
                        {mode === "create" && "Nueva"} Devolución
                        {mode === "view" && displayData && ` N° ${displayData.id} de la venta ${displayData.salesOrderNumber || "-"}`}
                    </Text>
                    {mode === "view" && displayData && (
                        <Text fontSize="md" fontWeight="bold" color="gray.500" mt={1}>
                            Fecha de Devolución: {parseDate(displayData.date)}
                        </Text>
                    )}
                </Box>
                <HStack gap={2}>
                    <IconButton
                        variant="surface"
                        colorScheme="blue"
                        aria-label="Volver al listado"
                        p={4}
                        onClick={() => navigate("/ventas/devoluciones")}
                    >
                        <ArrowLeft size={18} /> Volver al listado
                    </IconButton>
                    {mode === "create" && (
                        <AlertDialog
                            title="Realizar Devolución"
                            description={"Al confirmar la devolución, esta generará una nota de credito que afectará a la factura " + selectedSale?.bills[0]?.number + " Se devolverán los siguientes productos: "}
                            children={
                                <VStack mt={2} alignItems={"start"}>
                                    {returnProducts.map(p => <Text key={p.id} fontWeight={"semibold"} fontStyle={"italic"}>* {p.productName} - {p.quantity} unidades</Text>)}
                                    <Text fontWeight={"bold"}>SE DEVOLVERÁN: {parsePrice(form.total || 0)}</Text>
                                </VStack>
                            }
                            trigger={
                                <IconButton
                                    variant="surface"
                                    bgColor="brand.primary"
                                    color="white"
                                    aria-label="Realizar Devolución"
                                    p={4}
                                    disabled={returnProducts.length === 0 || createReturn.isPending}
                                >
                                    {createReturn.isPending ? <Spinner /> : <HandCoins size={18} />} Realizar Devolución
                                </IconButton>
                            }
                            onAccept={() => {
                                createReturn.mutate({
                                    billId: selectedSale?.bills[0]?.id || 0,
                                    date: new Date().toISOString(),
                                    total: form.total || 0,
                                    reason: form.reason || "",
                                    details: returnProducts
                                }, {
                                    onSuccess: (data) => {
                                        navigate("/ventas/devoluciones/" + data.id)
                                    }
                                })
                            }}
                        />
                    )}
                    {mode === "view" && displayData && (
                        <>
                            <IconButton
                                variant="outline"
                                colorScheme="blue"
                                aria-label="Ver Nota de Crédito"
                                p={4}
                                onClick={() => navigate(`/contabilidad/notas-credito/${displayData.creditNoteId}`)}
                            >
                                <FileText size={18} /> Ver Nota de Crédito
                            </IconButton>

                            <IconButton
                                variant="outline"
                                colorScheme="green"
                                aria-label="Ver Factura Afectada"
                                p={4}
                                color="brand.primary"
                                onClick={() => navigate(`/ventas/facturas/${displayData.billId}`)}
                            >
                                <FileInputIcon size={18} /> Ver Factura
                            </IconButton>

                            <IconButton
                                variant="outline"
                                color="brand.secondary"
                                p={4}
                                onClick={() => navigate(`/ventas/${displayData.salesOrderId}`)}
                                aria-label="Ver Venta Asociada"
                            >
                                <ShoppingCart size={18} /> Ver Venta
                            </IconButton>
                        </>
                    )}
                </HStack>
            </Flex>

            <Box display="flex" flexDirection="column" gap={4}>
                <Flex direction="column" gap={4} width="100%">
                    {/* Fila 1: Venta (solo create) */}
                    {mode === "create" && (
                        <HStack gap={4} alignItems="center">
                            <Text fontWeight="bold" minW="60px">Venta:</Text>
                            <SelectWrapper
                                key={form.salesOrderId}
                                options={sales ? sales.salesOrders.map(sale => ({ label: `Venta N° ${sale.number}`, value: String(sale.id) })) : []}
                                value={String(form.salesOrderId)}
                                placeholder="Seleccionar Venta"
                                width="300px"
                                readOnly={!sales}
                                onValueChange={(value) => {
                                    const saleId = Number(value);
                                    setForm({ ...form, salesOrderId: saleId });
                                }}
                            />
                        </HStack>
                    )}

                    <HStack gap={8} alignItems="center" wrap="wrap">
                        <HStack gap={2} alignItems="center">
                            <Text fontWeight="bold" minW="70px">Sucursal:</Text>
                            <Text>{displayData?.branchName || branches?.branches.find(b => b.id === displayData?.branchId)?.name || "-"}</Text>
                        </HStack>
                        <HStack gap={2} alignItems="center">
                            <Text fontWeight="bold" minW="50px">Cliente:</Text>
                            <Text>{displayData?.customerName || "-"}</Text>
                        </HStack>
                        <HStack gap={2} alignItems="center">
                            <Text fontWeight="bold" minW="40px">RUC:</Text>
                            <Text>{displayData?.customerRuc || "-"}</Text>
                        </HStack>
                    </HStack>

                    {/* Fila 3: Motivo */}
                    <VStack align="stretch" gap={2}>
                        <Text fontWeight="bold">Motivo de Devolución:</Text>
                        <Textarea
                            resize="vertical"
                            placeholder="Ingrese el motivo..."
                            value={displayData?.reason || ""}
                            onChange={(e) => setForm({ ...form, reason: e.target.value })}
                            readOnly={mode === "view"}
                            rows={3}
                        />
                    </VStack>
                </Flex>

                <HStack w="100%" alignItems="flex-start" gap={6}>
                    <VStack flex={1} align="stretch">
                        <HStack justifyContent="space-between" alignItems="flex-end">

                            <Text fontWeight="bold" fontSize="2xl">{mode === "create" ? "Productos de la venta" : "Productos devueltos"}</Text>
                            {mode === "view" && <HStack><Text fontWeight="bold" fontSize="xl">Cantidad de dinero devuelto:</Text>
                                <Text fontWeight="bold" color="brand.secondary" fontSize="xl">{parsePrice(form.total || 0)}</Text>
                                </HStack>}
                        </HStack>
                        <TableEditable
                            labels={labels}
                            data={displayData?.details || []}
                            readOnly={true}
                            onDataChange={(newData: any[]) => { setForm({ ...form, details: newData }) }}
                            height="50vh"
                        />
                    </VStack>

                    {mode === "create" && (
                        <VStack flex={1} align="stretch">
                            <HStack justifyContent="space-between" alignItems="flex-end">
                                <Text fontWeight="bold" fontSize="2xl">Productos a devolver</Text>
                                <Box textAlign="right" display="flex" flexDirection="row" alignItems="center" gap={1}>
                                    <Text fontWeight="bold" fontSize="xl">Cantidad de dinero a devolver:</Text>
                                    <Text fontWeight="bold" color="brand.secondary" fontSize="xl">{parsePrice(form.total || 0)}</Text>
                                </Box>
                            </HStack>
                            <TableEditable
                                labels={saleReturnLabels}
                                data={returnProducts || []}
                                onDataChange={(newData: SaleReturnDetail[]) => { setReturnProducts(newData) }}
                                height="50vh"
                                noItemsComponent={
                                    <EmptyDataScreen
                                        title={"Sin productos para devolver"}
                                        message={"Selecciona productos para devolver desde la tabla de al lado, especifica la cantidad a devolver para realizar la devolución"}
                                        icon={<PackagePlus />}
                                    />
                                }
                            />
                        </VStack>
                    )}
                </HStack>
            </Box>
        </Box>
    );
}