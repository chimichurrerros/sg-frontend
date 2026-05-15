import { Box, Grid, Input } from "@chakra-ui/react";
import { Text } from "@chakra-ui/react";
import { SelectWrapper } from "@/components/ui/select-wrapper";
import TableEditable, { type EditableLabel } from "@/components/ui/table-edit";
import type { ProductSupplierQuote } from "@/types/purchases";
import { useState } from "react";
interface SupplierQuoteSheetProps {
    mode: "create" | "edit";
    quoteId?: number;
}

export default function SupplierQuoteSheet({ mode, quoteId }: SupplierQuoteSheetProps) {

    const [products, setProducts] = useState<ProductSupplierQuote[]>([]);

    const labels: EditableLabel<ProductSupplierQuote>[] = [
        { labelName: "Código", propName: "code" },
        { labelName: "Nombre", propName: "name", isSortable: true, sortFunction: (a: ProductSupplierQuote, b: ProductSupplierQuote) => a.name.localeCompare(b.name) },
        { labelName: "Proveedor", propName: "supplierName" },
        { labelName: "Cantidad", propName: "quantity", isEditable: true, isSortable: true, sortFunction: (a: ProductSupplierQuote, b: ProductSupplierQuote) => a.quantity - b.quantity },
        { labelName: "Precio Unitario", propName: "unitPrice", isEditable: true, isSortable: true, sortFunction: (a: ProductSupplierQuote, b: ProductSupplierQuote) => a.unitPrice - b.unitPrice },
        { labelName: "Precio Total", propName: "totalPrice", isSortable: true, sortFunction: (a: ProductSupplierQuote, b: ProductSupplierQuote) => (a.totalPrice || 0) - (b.totalPrice || 0) }
    ];
    return (
        <Box display="flex" flexDirection="column" gap={4} height="100%" minHeight="0">
            <Text fontSize="2xl" fontWeight="bold">
                {mode === "create" ? "Nueva Cotización de Proveedor" : `Editar Cotización #${quoteId}`}
            </Text>
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

                <Text fontSize="lg" fontWeight="semibold" mb={4}>Productos</Text>

                <TableEditable
                    labels={labels} data={products} 
                    onDataChange={(newData: ProductSupplierQuote[]) => {
                        setProducts(newData);
                    }} />

            </Box>
        </Box>
    )
}