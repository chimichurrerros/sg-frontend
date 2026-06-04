
import { SalesOrderStateEnum, type FullSaleOrder } from "@/api/sales.api";
import PageSizeControl from "@/components/ui/page-size-control";
import PaginationControl from "@/components/ui/pagination-control";
import EmptyDataScreen from "@/components/ui/screens/empty-data-screen";
import TableSelect, { type label } from "@/components/ui/tables/table-select";
import PageTitle from "@/components/ui/title";
import { toaster } from "@/components/ui/toaster";
import { parsePrice } from "@/constants/price";
import {  useGetSales } from "@/queries/sales.queries";
import type { PaginationParams } from "@/types/types";
import { Box, IconButton, Input, InputGroup, Text } from "@chakra-ui/react";
import { CalendarOff, ExternalLink, Eye, FolderOpen, HandHelpingIcon, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { LuSearch } from "react-icons/lu";
import { useNavigate } from "react-router-dom";

export default function SaleListPage() {
    const [params, setParams] = useState<PaginationParams>({ page: 1, pageSize: 10 });

    const { data: sales, isPending: isLoadingSales, error: salesError, isError: isErrorSales } = useGetSales(params);
    const [selected, setSelected] = useState<FullSaleOrder | null>(null);
    const navigate = useNavigate();
    const labels: label<FullSaleOrder>[] = [
        { labelName: "Nro. Venta", propName: "number", isSortable: true, sortFunction: (a, b) => a.number.localeCompare(b.number) },
        { labelName: "Cliente", propName: "customerName", isSortable: true, sortFunction: (a, b) => a.customerName.localeCompare(b.customerName), textIfNull: "No registrado"},
        { labelName: "Fecha", propName: "date", transformFunction: (date: string) => new Date(date).toLocaleDateString(), isSortable: true, sortFunction: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() },
        { labelName: "Total", propName: "total", transformFunction: (value) => parsePrice(value), isSortable: true, sortFunction: (a, b) => a.total - b.total },
        { labelName: "Estado", propName: "salesOrderState", transformFunction: (value) => SalesOrderStateEnum[value] || "Desconocido", isSortable: true, sortFunction: (a, b) => a.salesOrderState - b.salesOrderState },
    ];

    useEffect(()=>{
        if(isErrorSales){
            toaster.create({ title: "Error al traer las ventas", description: salesError.message || "Error desconocido", type: "error" });
        }
    },[isErrorSales, salesError])

    return (<Box padding={5} display="flex" flexDirection="column" gap={4}>
        <PageTitle>Listado de Ventas</PageTitle>
        <Text fontSize="sm" fontStyle="italic" color="gray.600">Doble click o Enter sobre la fila para para abrir ficha de venta</Text>
        {/* Buttons and filters */}
        <Box display="flex" flexDirection="row" gap={2} justifyContent="space-between" alignItems="center">

            <InputGroup flex="1" startElement={<LuSearch />} >
                <Input placeholder="Buscar Venta..." />
            </InputGroup>
            <Text>Cant.Registros</Text><PageSizeControl paramsChangeFunction={setParams} params={params} max={30} min={5} />
            
             <IconButton padding={2} variant="outline" disabled={!selected} onClick={() => navigate(`/ventas/facturas/${selected?.bills[0]?.id}`)} >
                <ExternalLink size={20} /> Ver Factura
            </IconButton>
             <IconButton size="md" padding={4} variant="surface" colorPalette={"yellow"} disabled= {!selected} onClick={() => navigate("/ventas/devoluciones/desde/"+selected.id)}>
                            <HandHelpingIcon /> Registrar Devolución
            </IconButton>
           
            <IconButton padding={2} bgColor="brand.secondary"disabled={!selected} onClick={() => navigate(`/ventas/listado/${selected?.id}`)} >
                <FolderOpen size={20} /> Abrir Ficha de Venta
            </IconButton>
            <IconButton padding={2} bgColor="brand.primary" onClick={()=> navigate("/ventas/nueva")} >
                <Plus size={20} />
                Nueva
            </IconButton>

        </Box>
        {/* Table */}
        <Box display="flex" flexDirection="column" gap={5} alignContent="center" w="full">
            <TableSelect
                labels={labels}
                data={sales?.salesOrders || []}
                onSelect={(item: FullSaleOrder | null) => { setSelected(item) }}
                onDoubleClick={(item: FullSaleOrder) =>   navigate(`/ventas/listado/${item.id}`)}
                loading={isLoadingSales}
                error={salesError}
                isError={isErrorSales}
                maxHeight="50vh"
                noItemsComponent={
                    <EmptyDataScreen
                        title="Sin Ventas"
                        message="No hay ventas disponibles para mostrar, crea una nueva o limpia los filtros de búsqueda"
                        icon={<CalendarOff size={32} />}
                    />
                }
            />
            <PaginationControl
                pagination={sales?.pagination || null}
                variant={"outline"}
                buttonColor="brand.secondary"
                onPageChange={(page) => setParams({ ...params, page })}
                btnSize={"sm"}
            />
        </Box>
    </Box>);

}