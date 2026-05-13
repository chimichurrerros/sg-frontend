import type { Check } from "@/api/checks.api";
import PaginationControl from "@/components/ui/pagination-control";
import EmptyDataScreen from "@/components/ui/screens/empty-data-screen";
import TableSelect, { type label } from "@/components/ui/table-select";
import { toaster } from "@/components/ui/toaster";
import { useGetChecksKeys } from "@/queries/checks.queries";
import { Box, IconButton, Input, InputGroup, NumberInput, Text } from "@chakra-ui/react";
import { ArrowDownUp, Banknote, BanknoteX, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { LuSearch } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
// id:               number;
// number:           string;
// emisionDate:      string;
// availabilityDate: string;
// paymentDate:      string;
// maturityDate:     string;
// type:             number;
// issuingBank:      string;
// receiver:         string;
// amount:           number;
// status:           number;

//0 =Day, 1 = Deferred
// 0 = Pending, 1 = Cashed 2 = Voied

const checkLabels: label<Check>[] = [
    { labelName: "Nro.", propName: "number", isSortable: true, sortFunction: (a: Check, b: Check) => a.number.localeCompare(b.number) },
    { labelName: "Banco Emisor", propName: "issuingBank", isSortable: true, sortFunction: (a: Check, b: Check) => a.issuingBank.localeCompare(b.issuingBank) },
    { labelName: "Beneficiario", propName: "receiver", isSortable: true, sortFunction: (a: Check, b: Check) => a.receiver.localeCompare(b.receiver) },
    { labelName: "Monto", propName: "amount", isSortable: true, sortFunction: (a: Check, b: Check) => a.amount - b.amount },
    { labelName: "Fecha de Emision", propName: "emisionDate", isSortable: true, sortFunction: (a: Check, b: Check) => new Date(a.emisionDate).getTime() - new Date(b.emisionDate).getTime() },
    { labelName: "Fecha de Vencimiento", propName: "maturityDate", isSortable: true, sortFunction: (a: Check, b: Check) => new Date(a.maturityDate).getTime() - new Date(b.maturityDate).getTime() },
    { labelName: "Tipo", propName: "type", isSortable: true, sortFunction: (a: Check, b: Check) => a.type - b.type },
    { labelName: "Estado", propName: "status" },
]
interface Params {
    page: number;
    pageSize: number;
}
export default function ChecksList() {
    const [params, setParams] = useState<Params>({ page: 1, pageSize: 10 });
    const { data: checks, isPending, isError, error } = useGetChecksKeys({...params,pageSize: isNaN(params.pageSize) || params.pageSize < 5 || params.pageSize > 30 ? 10 : params.pageSize });
    const [selected, setSelected] = useState<Check | null>(null);
    const navigate = useNavigate();
    useEffect(() => {
        if (isError) { toaster.create({ title: "Error al traer los cheques", description: (error.message || "Error desconocido"), type: "error" }) }
    }, [isError, error])

    return (
        <Box display="flex" flexDirection="column" gap={4} p={4} height="100%" minHeight="0">
            <Text fontSize="2xl" fontWeight="bold">Listado de Cheques</Text>
            {/* Filters n actions */}
            <Box display="flex" flexDirection="row" gap={2} justifyContent="space-between" alignItems="center">
                <InputGroup flex="1" startElement={<LuSearch />}>
                    <Input placeholder="Buscar Cheques..." />
                </InputGroup>
                <Box display="flex" flexDirection="row" gap={2}>
                    <Text fontSize="sm" color="gray.500" alignSelf="center">Registros por Pág. </Text>
                    <NumberInput.Root defaultValue="10" width="70px" max={30} min={5} onValueChange={(value) => setParams({ ...params, pageSize: value.valueAsNumber })}>
                        <NumberInput.Control />
                        <NumberInput.Input />
                    </NumberInput.Root>                </Box>
                <IconButton padding={2} variant="outline" disabled={!selected}>
                    <BanknoteX />
                    Rechazar Cheque
                </IconButton>
                 <IconButton padding={2} bgColor="brand.secondary" onClick={() => navigate("/tesoreria/cheques/id=1")}>
                    <Eye />
                </IconButton>
                <IconButton padding={2} bgColor="brand.primary" disabled={!selected}>
                    <ArrowDownUp />
                    Conciliar
                </IconButton>
               
            </Box>

            <Box flex="1" minHeight="0" mb={2}>
                <TableSelect
                    key={JSON.stringify(checks?.checks)}
                    data={checks?.checks ?? []}
                    loading={isPending}
                    labels={checkLabels}
                    onSelect={(check) => setSelected(check)}
                    // height="full"
                    minheight="0"
                    noItemsComponent={<EmptyDataScreen title="No se encontraron cheques" message="No hay cheques para mostrar en este momento." icon={<Banknote/>} />}
                    onDoubleClick={(check) => console.log("ABRIR VISTA CHECK ", check)}
                />

                <PaginationControl
                    pagination={checks?.pagination || null}
                    onPageChange={(page) => setParams({ ...params, page })}
                    variant={"outline"}
                    buttonColor={"brand.primary"}
                    btnSize={"sm"}
                /></Box>
        </Box>
    );
}