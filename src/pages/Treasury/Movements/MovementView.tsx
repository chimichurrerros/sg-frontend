import { type AccountResponseDto } from "@/api/accounts.api";
import { movementTypeMap } from "@/api/bankMovements.api";
import { parseDate } from "@/constants/date";
import { useGetMovementById } from "@/queries/bankMovements.queries";
import { useGetAccounts } from "@/queries/accounts.queries";
import { toaster } from "@/components/ui/toaster";
import {
    Box,
    Button,
    Grid,
    Separator,
    Stack,
    Text,
} from "@chakra-ui/react";
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

function LabelValue({ label, value }: { label: string; value: string }) {
    return (
        <Stack>
            <Text fontSize="sm" fontWeight="medium" color="gray.400">
                {label}
            </Text>
            <Text fontSize="sm" color="gray.800">
                {value}
            </Text>
        </Stack>
    );
}

const formatBalance = (value: number) =>
    new Intl.NumberFormat("es-PY", { style: "currency", currency: "PYG", minimumFractionDigits: 0 }).format(value);

const formatDate = (value: string) => parseDate(value);

export default function MovementView() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const movementId = Number(id);

    const { data: movement, isPending, isError, error } = useGetMovementById(movementId);
    const { data: accountsData } = useGetAccounts({ page: 1, pageSize: 100 });

    useEffect(() => {
        if (isError) {
            toaster.create({
                title: "Error al cargar el movimiento bancario",
                description: error?.message || "Error desconocido",
                type: "error",
            });
        }
    }, [isError, error]);

    if (isPending) {
        return (
            <Box p={4}>
                <Text>Cargando movimiento bancario...</Text>
            </Box>
        );
    }

    if (isError || !movement) {
        return (
            <Box p={4}>
                <Text color="red.500">Error al cargar el movimiento bancario.</Text>
                <Button mt={4} variant="ghost" onClick={() => navigate("/tesoreria/movimientos")}>
                    <ArrowLeft /> Volver al listado
                </Button>
            </Box>
        );
    }

    const accountName = (accountsData?.accounts ?? []).find(
        (a: AccountResponseDto) => a.id === movement.accountId
    )?.name ?? `Cuenta #${movement.accountId}`;

    return (
        <Box display="flex" flexDirection="column" minHeight="0" p={4}>
            <Box display="flex" flexDirection="row" gap={4} py={2} justifyContent="space-between">
                <Text fontSize="2xl" fontWeight="bold">
                    Movimiento N° {movement.id}
                </Text>

                <Box display="flex" gap={4}>
                    <Button variant="ghost" color="brand.secondary" onClick={() => navigate("/tesoreria/movimientos")}>
                        <ArrowLeft />
                        Volver al listado
                    </Button>
                </Box>
            </Box>

            <Separator my={5} color="gray.900" />

            <Box bg="white" h="full" w="100%">
                <Grid templateColumns="repeat(3, 1fr)" gap={6}>
                    <LabelValue label="ID" value={String(movement.id)} />
                    <LabelValue label="Cuenta" value={accountName} />
                    <LabelValue label="Tipo de Movimiento" value={movementTypeMap[movement.movementType] || "Desconocido"} />
                    <LabelValue label="Monto" value={formatBalance(movement.amount)} />
                    <LabelValue label="Descripción" value={movement.description ?? "-"} />
                    <LabelValue label="Fecha" value={formatDate(movement.date)} />
                </Grid>
            </Box>
        </Box>
    );
}
