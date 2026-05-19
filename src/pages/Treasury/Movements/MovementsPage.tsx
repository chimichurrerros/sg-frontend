import type { BankMovementResponseDto } from "@/api/bankMovements.api";
import PaginationControl from "@/components/ui/pagination-control";
import EmptyDataScreen from "@/components/ui/screens/empty-data-screen";
import TableSelect, { type label } from "@/components/ui/table-select";
import { toaster } from "@/components/ui/toaster";
import { useGetMovements, useDeleteMovement } from "@/queries/bankMovements.queries";
import type { PaginationParams } from "@/types/types";
import { Box, IconButton, Input, InputGroup, NumberInput, Text } from "@chakra-ui/react";
import { ArrowUpDown, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { LuSearch } from "react-icons/lu";
import { useNavigate } from "react-router-dom";

const formatBalance = (value: number) =>
    new Intl.NumberFormat("es-PY", { style: "currency", currency: "PYG", minimumFractionDigits: 0 }).format(value);

const formatDate = (value: string) => {
    const d = new Date(value);
    return d.toLocaleDateString("es-PY", { year: "numeric", month: "2-digit", day: "2-digit" });
};

const movementLabels: label<BankMovementResponseDto>[] = [
    {
        labelName: "ID",
        propName: "id",
        isSortable: true,
        sortFunction: (a: BankMovementResponseDto, b: BankMovementResponseDto) => a.id - b.id,
    },
    {
        labelName: "Cuenta Bancaria",
        propName: "bankAccountId",
        isSortable: true,
        sortFunction: (a: BankMovementResponseDto, b: BankMovementResponseDto) => a.bankAccountId - b.bankAccountId,
    },
    {
        labelName: "Monto",
        propName: "amount",
        isSortable: true,
        sortFunction: (a: BankMovementResponseDto, b: BankMovementResponseDto) => a.amount - b.amount,
        transformFunction: (value: number) => formatBalance(value),
    },
    {
        labelName: "Descripción",
        propName: "description",
        textIfNull: "-",
        isSortable: true,
        sortFunction: (a: BankMovementResponseDto, b: BankMovementResponseDto) =>
            (a.description ?? "").localeCompare(b.description ?? ""),
    },
    {
        labelName: "Fecha",
        propName: "date",
        isSortable: true,
        sortFunction: (a: BankMovementResponseDto, b: BankMovementResponseDto) =>
            new Date(a.date).getTime() - new Date(b.date).getTime(),
        transformFunction: (value: string) => formatDate(value),
    },
];

export default function MovementsPage() {
    const [params, setParams] = useState<PaginationParams>({
        page: 1,
        pageSize: 10,
    });
    const { data: movements, isPending, isError, error } = useGetMovements({
        ...params,
        pageSize:
            params.pageSize && !isNaN(params.pageSize) && params.pageSize >= 5 && params.pageSize <= 30
                ? params.pageSize
                : 10,
    });
    const { mutate: deleteMovement } = useDeleteMovement();
    const [selected, setSelected] = useState<BankMovementResponseDto | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (isError) {
            toaster.create({
                title: "Error al traer los movimientos bancarios",
                description: error?.message || "Error desconocido",
                type: "error",
            });
        }
    }, [isError, error]);

    return (
        <Box display="flex" flexDirection="column" gap={4} p={4} height="100%" minHeight="0">
            <Text fontSize="2xl" fontWeight="bold">
                Movimientos Bancarios
            </Text>

            <Box display="flex" flexDirection="row" gap={2} justifyContent="space-between" alignItems="center">
                <InputGroup flex="1" startElement={<LuSearch />}>
                    <Input placeholder="Buscar movimientos..." />
                </InputGroup>

                <Box display="flex" flexDirection="row" gap={2}>
                    <Text fontSize="sm" color="gray.500" alignSelf="center">
                        Registros por Pág.
                    </Text>
                    <NumberInput.Root
                        defaultValue="10"
                        width="70px"
                        max={30}
                        min={5}
                        onValueChange={(value) => setParams({ ...params, pageSize: value.valueAsNumber })}
                    >
                        <NumberInput.Control />
                        <NumberInput.Input />
                    </NumberInput.Root>
                </Box>

                <IconButton
                    padding={2}
                    colorPalette="brand"
                    onClick={() => navigate("/tesoreria/movimientos/nueva")}
                >
                    <Plus />
                    Nuevo
                </IconButton>
                <IconButton
                    padding={2}
                    variant="outline"
                    disabled={!selected}
                    onClick={() => selected && navigate(`/tesoreria/movimientos/${selected.id}`)}
                >
                    <Pencil />
                    Editar
                </IconButton>
                <IconButton
                    padding={2}
                    variant="outline"
                    colorPalette="red"
                    disabled={!selected}
                    onClick={() => {
                        if (selected) {
                            deleteMovement(selected.id);
                            setSelected(null);
                        }
                    }}
                >
                    <Trash2 />
                    Eliminar
                </IconButton>
            </Box>

            <Box flex="1" minHeight="0" mb={2}>
                <TableSelect
                    key={JSON.stringify(movements?.bankMovements)}
                    data={movements?.bankMovements ?? []}
                    loading={isPending}
                    labels={movementLabels}
                    onSelect={(movement) => setSelected(movement)}
                    minheight="0"
                    noItemsComponent={
                        <EmptyDataScreen
                            title="No se encontraron movimientos"
                            message="No hay movimientos bancarios para mostrar en este momento."
                            icon={<ArrowUpDown />}
                        />
                    }
                    onDoubleClick={(movement) => navigate(`/tesoreria/movimientos/${movement.id}`)}
                />

                <PaginationControl
                    pagination={movements?.pagination || null}
                    onPageChange={(page) => setParams({ ...params, page })}
                    variant="outline"
                    buttonColor="brand.primary"
                    btnSize="sm"
                />
            </Box>
        </Box>
    );
}
