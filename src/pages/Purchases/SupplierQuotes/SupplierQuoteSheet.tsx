import { Box, Button, Grid, IconButton, Input, Table } from "@chakra-ui/react";
import { Text } from "@chakra-ui/react";
import { SelectWrapper } from "@/components/ui/select-wrapper";
import TableEditable, { type EditableLabel } from "@/components/ui/table-edit";
import type { ProductSupplierQuote } from "@/types/purchases";
import { useState } from "react";
import { FileInput, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ConfirmActionDialog } from "@/components/ui/dialogs/confirm-dialog";
interface SupplierQuoteSheetProps {
    mode: "create" | "edit";
    quoteId?: number;
}


export default function SupplierQuoteSheet({ mode, quoteId }: SupplierQuoteSheetProps) {
    const [products, setProducts] = useState<ProductSupplierQuote[]>([
        { id: 1, quoteId: 101, code: 1001, name: "Hankook 20°", supplierName: "Pirelli S.A", quantity: 4, unitPrice: 150000 },
        { id: 2, quoteId: 101, code: 1002, name: "Bridgestone R16", supplierName: "Pirelli S.A", quantity: 2, unitPrice: 200000 },
        { id: 3, quoteId: 102, code: 1003, name: "Michelin X", supplierName: "Pirelli S.A", quantity: 6, unitPrice: 180000 },
        { id: 4, quoteId: 102, code: 1004, name: "Filtro de aceite", supplierName: "Repuestos García", quantity: 10, unitPrice: 45000 },
        { id: 5, quoteId: 103, code: 1005, name: "Bujía NGK", supplierName: "Repuestos García", quantity: 8, unitPrice: 32000 },
        { id: 6, quoteId: 103, code: 1006, name: "Correa de distribución", supplierName: "Repuestos García", quantity: 3, unitPrice: 95000 },
        { id: 7, quoteId: 104, code: 1007, name: "Pastillas de freno", supplierName: "AutoParts SA", quantity: 5, unitPrice: 120000 },
        { id: 8, quoteId: 104, code: 1008, name: "Disco de freno", supplierName: "AutoParts SA", quantity: 4, unitPrice: 210000 },
    ]);
    const navigate = useNavigate();
    const labels: EditableLabel<ProductSupplierQuote>[] = [
        { labelName: "Código", propName: "code" },
        { labelName: "Nombre", propName: "name", isSortable: true, sortFunction: (a: ProductSupplierQuote, b: ProductSupplierQuote) => a.name.localeCompare(b.name) },
        { labelName: "Proveedor", propName: "supplierName" },
        { labelName: "Cantidad", propName: "quantity", isEditable: true, isSortable: true, sortFunction: (a: ProductSupplierQuote, b: ProductSupplierQuote) => a.quantity - b.quantity },
        { labelName: "Precio Unitario", propName: "unitPrice", isEditable: true, isSortable: true, sortFunction: (a: ProductSupplierQuote, b: ProductSupplierQuote) => a.unitPrice - b.unitPrice },
        { labelName: "Precio Total", propName: "totalPrice", isSortable: true, sortFunction: (a: ProductSupplierQuote, b: ProductSupplierQuote) => (a.totalPrice || 0) - (b.totalPrice || 0) }
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

    return (
        <Box display="flex" flexDirection="column" gap={4} height="100%" minHeight="0">
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Text fontSize="2xl" fontWeight="bold">{mode === "create" ? "Nueva Cotización de Proveedor" : `Editar Cotización #${quoteId}`}</Text>
                <ConfirmActionDialog trigger={<IconButton p={2} bgColor="brand.secondary" disabled ={!products || products.length === 0} size="lg">
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
                                        <Table.ColumnHeader textAlign="end">Cantidad</Table.ColumnHeader>
                                    </Table.Row>
                                </Table.Header>

                                <Table.Body>
                                    {transformData(products)?.flatMap((item) =>
                                        item.products.map((product, index) => (
                                            <Table.Row key={`${item.supplierName}-${index}`}>
                                                {index === 0 && (
                                                    <Table.Cell rowSpan={item.products.length} verticalAlign="middle">
                                                        {item.supplierName}
                                                    </Table.Cell>
                                                )}
                                                <Table.Cell>{product.name}</Table.Cell>
                                                <Table.Cell textAlign="end">{product.quantity}</Table.Cell>
                                            </Table.Row>
                                        ))
                                    )}
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
                    <Box>
                        <Text fontSize="sm" fontWeight="medium" mb={1}>Situación *</Text>
                        <Input size="sm" value="ACTIVO" readOnly />
                    </Box>
                </Grid>

                {/* Fila 2 */}
                <Grid templateColumns="repeat(3, 1fr)" gap={6} mb={8}>
                    <Box>
                        <Text fontSize="sm" fontWeight="medium" mb={1}>Pedido de Cotización *</Text>
                        <SelectWrapper
                            options={[
                                { value: "89", label: "89 - Pedido de Cotización 20/03/26" },
                                { value: "88", label: "88 - Pedido de Cotización 15/03/26" },
                            ]}
                            width="100%"
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
                    <Box>
                        <Text fontSize="sm" fontWeight="medium" mb={1}>Depósito *</Text>
                        <SelectWrapper
                            options={[
                                { value: "02", label: "02 - MATRIZ" },
                            ]}
                            width="100%"
                        />
                    </Box>
                </Grid>

                <Box border="1px solid" borderColor="gray.200" borderRadius="md" overflow="hidden" height="47vh">
                    <TableEditable
                        labels={labels} data={products}
                        height="100%"
                        onDataChange={(newData: ProductSupplierQuote[]) => {
                            setProducts(newData);
                        }} />
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