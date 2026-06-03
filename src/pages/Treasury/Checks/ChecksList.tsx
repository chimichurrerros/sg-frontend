import { checkStatusEnum, checkTypeEnum, type Check } from "@/api/checks.api";
import { parseDate } from "@/constants/date";
import { useUpdateCheck } from "@/queries/checks.queries";
import PaginationControl from "@/components/ui/pagination-control";
import EmptyDataScreen from "@/components/ui/screens/empty-data-screen";
import TableSelect, { type label } from "@/components/ui/tables/table-select";
import { toaster } from "@/components/ui/toaster";
import { useGetChecksKeys } from "@/queries/checks.queries";
import type { PaginationParams } from "@/types/types";
import { Box, IconButton, Input, InputGroup, Spinner, Text } from "@chakra-ui/react";
import { ArrowDownUp, Banknote, BanknoteX, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { LuSearch } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import { DestructiveActionDialog } from "@/components/ui/dialogs/destructive-action-dialog";
import { parsePrice } from "@/constants/price";
import PageSizeControl from "@/components/ui/page-size-control";
import PageTitle from "@/components/ui/title";

const checkLabels: label<Check>[] = [
    { labelName: "Nro.", propName: "number", isSortable: true, sortFunction: (a, b) => a.number.localeCompare(b.number) },
    { labelName: "Banco Emisor", propName: "issuingBank", isSortable: true, sortFunction: (a, b) => a.issuingBank.localeCompare(b.issuingBank) },
    { labelName: "Beneficiario", propName: "receiver", isSortable: true, sortFunction: (a, b) => a.receiver.localeCompare(b.receiver) },
    { labelName: "Monto", propName: "amount",transformFunction: (value)=>parsePrice(value) ,isSortable: true, sortFunction: (a, b) => a.amount - b.amount },
    { labelName: "Fecha de Emision", propName: "emisionDate", transformFunction: (date: string) => parseDate(date), isSortable: true, sortFunction: (a, b) => new Date(a.emisionDate).getTime() - new Date(b.emisionDate).getTime() },
    { labelName: "Fecha de Vencimiento", propName: "maturityDate", transformFunction: (date: string) => parseDate(date), isSortable: true, sortFunction: (a, b) => new Date(a.maturityDate).getTime() - new Date(b.maturityDate).getTime() },
    { labelName: "Tipo", propName: "type", transformFunction: (value: number) => checkTypeEnum[value] || "Desconocido", isSortable: true, sortFunction: (a, b) => a.type - b.type },
    { labelName: "Estado", propName: "status", transformFunction: (value: number) => checkStatusEnum[value] || "Desconocido" },
];

export default function ChecksList() {
    const [params, setParams] = useState<PaginationParams>({ page: 1, pageSize: 10 });
    const { data: checks, isPending, isError, error } = useGetChecksKeys({
        ...params,
        pageSize: params.pageSize && !isNaN(params.pageSize) && params.pageSize >= 5 && params.pageSize <= 30
            ? params.pageSize
            : 10,
    });
    const [selected, setSelected] = useState<Check | null>(null);
    const navigate = useNavigate();

    const isSelectedPending = selected?.status === 0;

    const rejectMutation = useUpdateCheck(selected?.id ?? 0, { status: 2 });
    const reconcileMutation = useUpdateCheck(selected?.id ?? 0, {
        status: 1,
        paymentDate: new Date().toISOString().split("T")[0],
    });

    useEffect(() => {
        if (rejectMutation.isSuccess || reconcileMutation.isSuccess) {
            setSelected(null);
        }
    }, [rejectMutation.isSuccess, reconcileMutation.isSuccess]);

    useEffect(() => {
        if (isError) {
            toaster.create({ title: "Error al traer los cheques", description: error.message || "Error desconocido", type: "error" });
        }
    }, [isError, error]);

    const isActioning = rejectMutation.isPending || reconcileMutation.isPending;

    return (
        <Box display="flex" flexDirection="column" gap={4} p={4} height="100%" minHeight="0">
            <PageTitle>Listado de Cheques</PageTitle>
            <Box display="flex" flexDirection="row" gap={2} justifyContent="space-between" alignItems="center">
                <InputGroup flex="1" startElement={<LuSearch />}>
                    <Input placeholder="Buscar Cheques..." />
                </InputGroup>
                <Box display="flex" flexDirection="row" gap={2}>
                    <Text fontSize="sm" color="gray.500" alignSelf="center">Registros por Pág.</Text>
                    {/* <NumberInput.Root
                        defaultValue="10"
                        width="70px"
                        max={30}
                        min={5}
                        onValueChange={(value) => setParams({ ...params, pageSize: value.valueAsNumber })}
                    >
                        <NumberInput.Control />
                        <NumberInput.Input />
                    </NumberInput.Root> */}
                    <PageSizeControl paramsChangeFunction={setParams} params={params} max={30} min={5}/>
                </Box>

                <DestructiveActionDialog
                    trigger={<IconButton
                        padding={2}
                        variant="outline"
                        disabled={!selected || !isSelectedPending || isActioning}
                    >
                        {rejectMutation.isPending ? <Spinner size="sm" /> : <BanknoteX />}
                        Anular Cheque
                    </IconButton>}
                    title="Anular cheque"
                    description="Esta acción es irreversible"
                    onAccept={() => selected && rejectMutation.mutate()}
                />
                <IconButton
                    padding={2}
                    bgColor="brand.secondary"
                    disabled={!selected || isActioning}
                    onClick={() => selected && navigate("/tesoreria/cheques/" + selected.id)}
                >
                    <Eye />
                </IconButton>

                <IconButton
                    padding={2}
                    bgColor="brand.primary"
                    disabled={!selected || !isSelectedPending || isActioning}
                    onClick={() => selected && reconcileMutation.mutate()}
                >
                    {reconcileMutation.isPending ? <Spinner size="sm" /> : <ArrowDownUp />}
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
                    minheight="0"
                    maxHeight="60vh"
                    noItemsComponent={
                        <EmptyDataScreen
                            title="No se encontraron cheques"
                            message="No hay cheques para mostrar en este momento."
                            icon={<Banknote />}
                        />
                    }
                    onDoubleClick={(check) => navigate("/tesoreria/cheques/" + check.id)}
                />

                <PaginationControl
                    pagination={checks?.pagination || null}
                    onPageChange={(page) => setParams({ ...params, page })}
                    variant="outline"
                    buttonColor="brand.primary"
                    btnSize="sm"
                />
            </Box>
        </Box>
    );
}