import type { SupplierQuote } from "@/api/supplierQuote.api";
import { DestructiveActionDialog } from "@/components/ui/dialogs/destructive-action-dialog";
import PaginationControl from "@/components/ui/pagination-control";
import EmptyDataScreen from "@/components/ui/screens/empty-data-screen";
import type { label } from "@/components/ui/table-select";
import TableSelect from "@/components/ui/table-select";
import { toaster } from "@/components/ui/toaster";
import { useEditSupplierQuote, useGetSupplierQuotes } from "@/queries/supplier-quotes.queries";
import { supplierQuoteStatusMap } from "@/types/purchases";
import { parseDate } from "@/constants/date";
import type { PaginationParams } from "@/types/types";
import { Box, IconButton, Input, InputGroup, Spinner } from "@chakra-ui/react";
import { Text } from "@chakra-ui/react";
import { ExternalLink, Pencil, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { LuSearch } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import PageSizeControl from "@/components/ui/page-size-control";
import { parsePrice } from "@/constants/price";


export default function SupplierQuotesList() {
    const [params, setParams] = useState<PaginationParams>({ page: 1, pageSize: 10 });
    const [selected, setSelected] = useState<SupplierQuote | null>(null);
    const { data: supplierQuotes, isPending: loadingSupplierQuotes, error: supplierQuotesError, isError } = useGetSupplierQuotes(params);
    const editSupplierQuote = useEditSupplierQuote();
    const navigate = useNavigate();

    const labels: label<SupplierQuote>[] = [
        { labelName: "ID", propName: "id", isSortable: true, sortFunction: (a: SupplierQuote, b: SupplierQuote) => a.id - b.id },
        { labelName: "Proveedor", propName: "supplierName", isSortable: true, sortFunction: (a: SupplierQuote, b: SupplierQuote) => a.supplierName.localeCompare(b.supplierName) },
        { labelName: "Fecha", propName: "date", transformFunction:(value: Date) => parseDate(value), isSortable: true, sortFunction: (a: SupplierQuote, b: SupplierQuote) => a.date.getTime() - b.date.getTime() },
        { labelName: "Monto Total", propName: "total", isSortable: true, transformFunction: (value)=>parsePrice(value), sortFunction: (a: SupplierQuote, b: SupplierQuote) => a.total - b.total },
        { labelName: "Estado", propName: "state", transformFunction: (value: number) => supplierQuoteStatusMap[value] || "Desconocido" },
    ]
    useEffect(() => {
        if (isError) {
            toaster.create({ title: "Error al cargar las cotizaciones: " + (supplierQuotesError?.message || "Error desconocido"), type: "error" });
        }
    }, [isError, supplierQuotesError])

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
                    <PageSizeControl paramsChangeFunction={setParams} params={params} max={30} min={5}  />
                </Box>
                <IconButton variant="ghost" size="sm" disabled={!selected || selected?.associatedPurchaseOrderId ===null} onClick={()=>{selected && navigate("/compras/ordenes-de-compra/"+ selected.associatedPurchaseOrderId)}}><ExternalLink/></IconButton>
                <DestructiveActionDialog trigger={
                    <IconButton padding={2} variant="outline" disabled={!selected || editSupplierQuote.isPending || selected.state === 2 || selected.associatedPurchaseOrderId !== null}>
                        {editSupplierQuote.isPending ? <Spinner/>:<X />}
                        Rechazar
                    </IconButton>
                }
                    title={"Rechazar Cotización"}
                    description="Una vez rechazada, podrá ser visualizada pero ya no editable ni se podrá generar una compra a partir de ella"
                    onAccept={() => {selected && editSupplierQuote.mutate({id: selected?.id,data:{state:2}}) }}
                />
                <IconButton padding={2} bgColor="brand.secondary" disabled={!selected} onClick={() => selected && navigate(`/compras/cotizaciones-proveedores/${selected.id}`)}>
                    <Pencil />
                    Editar
                </IconButton>
                <IconButton padding={2} bgColor="brand.primary" onClick={() => navigate("/compras/cotizaciones-proveedores/nueva")}>
                    <Plus />
                    Nuevo
                </IconButton>
            </Box>
            <TableSelect<SupplierQuote>
                key={JSON.stringify(supplierQuotes)}
                data={supplierQuotes?.supplierQuotes || []}
                labels={labels}
                onSelect={(item) => setSelected(item)}
                onDoubleClick={(item) => navigate(`/compras/cotizaciones-proveedores/${item.id}`)}
                loading={loadingSupplierQuotes}
                height="50vh"
                noItemsComponent={
                    <EmptyDataScreen
                        title="No se encontraron cotizaciones"
                        message="No hay cotizaciones de proveedores para mostrar en este momento. Puedes crear una nueva cotización haciendo clic en el botón 'Nuevo'."
                        icon={<LuSearch size={48} color="gray" />}
                    />
                }
            />
            <PaginationControl
                pagination={supplierQuotes?.pagination || null}
                onPageChange={(page: number) => { setParams({ ...params, page }) }}
            />
        </Box>
    );
}