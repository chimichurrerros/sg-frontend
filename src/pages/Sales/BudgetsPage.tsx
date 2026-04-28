import { Box } from "@chakra-ui/react/box";
import { IconButton, Input, InputGroup, Text } from "@chakra-ui/react";
import { LuSearch } from "react-icons/lu";
import { CalendarOff, CalendarPlus, DollarSign } from "lucide-react";
import React from "react";
import TableSelect, { type label } from "@/components/ui/table-select";
import type { PaginationType } from "@/types/types";
import PaginationControl from "@/components/ui/pagination-control";
import EmptyDataScreen from "@/components/ui/screens/empty-data-screen";
import { useNavigate } from "react-router-dom";

interface Budget {
    id: number;
    client: string;
    concept?: string;
    amount: number;
    creationDate: string;
    expirationDate: string;
    state: "Pendiente" | "Aprobado" | "Rechazado";
}

export default function BudgetsPage() {
    const [selected, setSelected] = React.useState<Budget | null>(null);
    const [pagination, setPagination] = React.useState<PaginationType | null>({ totalPages: 10, totalElements: 20000, currentPage: 1, pageSize: 5 });
    const navigate = useNavigate()
    const mock_labels: label<Budget>[] = [
        { labelName: "Cliente", propName: "client", isSortable:true, sortFunction: (a:Budget,b:Budget)=>{return a.client.localeCompare(b.client)}},
        { labelName: "Concepto", propName: "concept", textIfNull: "Sin Concepto" },
        { labelName: "Monto", propName: "amount", isSortable:true, sortFunction: (a:Budget,b:Budget)=>{return Number(a.amount)-Number(b.amount)}},
        { labelName: "Fecha de Creación", propName: "creationDate" , isSortable:true, sortFunction: (a:Budget,b:Budget)=>{return new Date(a.creationDate).getTime() - new Date(b.creationDate).getTime()}},
        { labelName: "Fecha de Expiración", propName: "expirationDate", isSortable:true,sortFunction: (a:Budget,b:Budget)=>{return new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime()}},
        { labelName: "Estado", propName: "state" }
    ];
    const mock_data: Budget[] = [
        {
            id: 1,
            client: "John Doe",
            concept: "Servicio de Consultoría",
            amount: 1000,
            creationDate: "2023-01-02",
            expirationDate: "2023-01-31",
            state: "Pendiente"
        },
        {
            id: 2,
            client: "Jane Smith",
            concept: "Desarrollo de Software",
            amount: 2000,
            creationDate: "2023-01-01",
            expirationDate: "2023-02-31",
            state: "Aprobado"
        },
        {
            id: 3,
            client: "Acme Corp",
            amount: 1500,
            creationDate: "2023-01-03",
            expirationDate: "2023-03-31",
            state: "Rechazado"
        },     {
            id: 4,
            client: "John Doe",
            concept: "Servicio de Consultoría",
            amount: 1000,
            creationDate: "2023-01-02",
            expirationDate: "2023-01-31",
            state: "Pendiente"
        },
        {
            id: 6,
            client: "Jane Smith",
            concept: "Desarrollo de Software",
            amount: 2000,
            creationDate: "2023-01-01",
            expirationDate: "2023-02-31",
            state: "Aprobado"
        },
        {
            id: 5,
            client: "Acme Corp",
            amount: 1500,
            creationDate: "2023-01-03",
            expirationDate: "2023-03-31",
            state: "Rechazado"
        },     {
            id: 8,
            client: "John Doe",
            concept: "Servicio de Consultoría",
            amount: 1000,
            creationDate: "2023-01-02",
            expirationDate: "2023-01-31",
            state: "Pendiente"
        },
        {
            id: 9,
            client: "Jane Smith",
            concept: "Desarrollo de Software",
            amount: 2000,
            creationDate: "2023-01-01",
            expirationDate: "2023-02-31",
            state: "Aprobado"
        },
        {
            id: 10,
            client: "Acme Corp",
            amount: 1500,
            creationDate: "2023-01-03",
            expirationDate: "2023-03-31",
            state: "Rechazado"
        },     {
            id: 11,
            client: "John Doe",
            concept: "Servicio de Consultoría",
            amount: 1000,
            creationDate: "2023-01-02",
            expirationDate: "2023-01-31",
            state: "Pendiente"
        },
        {
            id: 12,
            client: "Jane Smith",
            concept: "Desarrollo de Software",
            amount: 2000,
            creationDate: "2023-01-01",
            expirationDate: "2023-02-31",
            state: "Aprobado"
        },
        {
            id: 13,
            client: "Acme Corp",
            amount: 1500,
            creationDate: "2023-01-03",
            expirationDate: "2023-03-31",
            state: "Rechazado"
        }
    ];

    ///useEffect who changes the data when the pagination changes useEffec(()=>{},[pagination])

    function handlePageChange(newPage: number) {
        if (!pagination) return;
        if (newPage > pagination?.totalPages || newPage < 1) return;
        setPagination({ ...pagination, currentPage: newPage }) // or do a query with newpage
    }
    return (
        <Box padding={5} display="flex" flexDirection="column" gap={4}>
            <Text fontWeight="bold" fontSize="3xl">Listado de Presupuestos</Text>
            <Text fontSize="sm" fontStyle="italic" color="gray.600">Doble click o Enter sobre la fila para para abrir ficha de presupuesto</Text>
            {/* Buttons and filters */}
            <Box display="flex" flexDirection="row" gap={2} justifyContent="space-between" alignItems="center">
                <InputGroup flex="1" startElement={<LuSearch />} >
                    <Input placeholder="Buscar por Cliente, Concepto, Monto..." />
                </InputGroup>
                <IconButton padding={2} bgColor="brand.secondary" disabled={!selected}>
                    <DollarSign size={20} />
                    Aprobar presupuesto
                </IconButton>

                <IconButton padding={2} bgColor="brand.primary" onClick={()=>navigate("/ventas/presupuestos/crear")}>
                    <CalendarPlus size={20} />

                    Nuevo
                </IconButton>

            </Box>


            {/* Table */}
            <Box display="flex" flexDirection="column" gap={5} alignContent="center" w="full">
                <TableSelect
                    labels={mock_labels}
                    data={mock_data}
                    onSelect={(item: Budget | null) => { console.log("se seleccionó: ", item); setSelected(item) }}
                    onDoubleClick={(item: Budget) => console.log("se hizo dobleclic en ", item)}
                    loading={false}
                    error={null}
                    isError={false}
                    noItemsComponent={
                        <EmptyDataScreen 
                        title="Sin Presupuestos" 
                        message="No hay presupuestos disponibles para mostrar, crea uno nuevo o limpia los filtros de búsqueda"
                        icon = {<CalendarOff size={32} />}
                        />
                    }
                />
                <PaginationControl
                    pagination={pagination}
                    variant={"outline"}
                    buttonColor="brand.secondary"
                    onPageChange={handlePageChange}
                    btnSize={"sm"}
                    showTextRegistros={true}
                />
            </Box>
        </Box>

    );
}