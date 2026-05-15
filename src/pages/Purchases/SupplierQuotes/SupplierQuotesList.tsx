import PaginationControl from "@/components/ui/pagination-control";
import EmptyDataScreen from "@/components/ui/screens/empty-data-screen";
import type { label } from "@/components/ui/table-select";
import TableSelect from "@/components/ui/table-select";
import { supplierQuoteStatusMap, type SupplierQuote } from "@/types/purchases";
import type { PaginationParams } from "@/types/types";
import { Box, IconButton, Input, InputGroup, NumberInput } from "@chakra-ui/react";
import { Text } from "@chakra-ui/react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { LuSearch } from "react-icons/lu";
import { useNavigate } from "react-router-dom";


export default function SupplierQuotesList() {
    const [params, setParams] = useState<PaginationParams>({ page: 1, pageSize: 10 });
    const [selected, setSelected] = useState<SupplierQuote | null>(null);
    const navigate = useNavigate();
    const labels: label<SupplierQuote>[] = [
        { labelName: "Código", propName: "code", isSortable: true, sortFunction: (a: SupplierQuote, b: SupplierQuote) => a.code - b.code },
        { labelName: "Proveedor", propName: "supplierName", isSortable: true, sortFunction: (a: SupplierQuote, b: SupplierQuote) => a.supplierName.localeCompare(b.supplierName) },
        { labelName: "Establecimiento", propName: "stablishment", isSortable: true, sortFunction: (a: SupplierQuote, b: SupplierQuote) => a.stablishment.localeCompare(b.stablishment) },
        { labelName: "Monto Total", propName: "totalAmount", isSortable: true, sortFunction: (a: SupplierQuote, b: SupplierQuote) => a.totalAmount - b.totalAmount },
        { labelName: "Fecha de Cotización", propName: "quoteDate", isSortable: true, sortFunction: (a: SupplierQuote, b: SupplierQuote) => new Date(a.quoteDate).getTime() - new Date(b.quoteDate).getTime() },
        { labelName: "Estado", propName: "status", transformFunction: (value: number) => supplierQuoteStatusMap[value] || "Desconocido" },
    ]

    return (
        <Box display="flex" flexDirection="column" gap={5}>
            <Text fontSize="2xl" fontWeight="bold">
                Lista de Cotizaciones de Proveedores
            </Text>

            <Box display="flex" flexDirection="row" gap={2} justifyContent="space-between" alignItems="center">
                <InputGroup flex="1" startElement={<LuSearch />}>
                    <Input placeholder="Buscar Cotizaciones..." />
                </InputGroup>
                <Box display="flex" flexDirection="row" gap={2}>
                    <Text fontSize="sm" color="gray.500" alignSelf="center">Registros por Pág. </Text>
                    <NumberInput.Root defaultValue="10" width="70px" max={30} min={5} onValueChange={(value) => setParams({ ...params, pageSize: value.valueAsNumber })}>
                        <NumberInput.Control />
                        <NumberInput.Input />
                    </NumberInput.Root>
                </Box>
                <IconButton padding={2} variant="outline" disabled={!selected}>
                    <Trash2 />
                    Eliminar
                </IconButton>
                <IconButton padding={2} bgColor="brand.secondary" disabled={!selected}>
                    <Pencil />
                    Editar
                </IconButton>
                <IconButton padding={2} bgColor="brand.primary" onClick={() => navigate("/compras/cotizaciones-proveedores/nueva")}>
                    <Plus />
                    Nuevo
                </IconButton>
            </Box>
            <TableSelect<SupplierQuote>
                key={"purchase-quotes-table"}
                data={[]}
                labels={labels}
                onSelect={(item) => setSelected(item)}
                loading={false}
                noItemsComponent={
                    <EmptyDataScreen
                    title="No se encontraron cotizaciones"
                    message="No hay cotizaciones de proveedores para mostrar en este momento. Puedes crear una nueva cotización haciendo clic en el botón 'Nuevo'."
                    icon={<LuSearch size={48} color="gray" />}
                />
                }
            />
            <PaginationControl
                pagination={null}
                onPageChange={(page: number) => { setParams({ ...params, page }) }}
            />
        </Box>
    );
}