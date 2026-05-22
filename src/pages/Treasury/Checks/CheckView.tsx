import { Separator, Stack, Spinner } from "@chakra-ui/react";
import { Box } from "@chakra-ui/react/box";
import { IconButton } from "@chakra-ui/react/button";
import { Grid, GridItem } from "@chakra-ui/react/grid";
import { Text } from "@chakra-ui/react/text";
import { ArrowDownUp, ArrowLeft, BanknoteX } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { checkStatusEnum, checkTypeEnum } from "@/api/checks.api";
import { LoadingScreen } from "@/components/ui/screens/loading-screen";
import { useGetCheckById, useUpdateCheck } from "@/queries/checks.queries";

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

export default function CheckView() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const checkId = Number(id);

    const { data: check, isLoading, isError } = useGetCheckById(checkId);

    const rejectMutation = useUpdateCheck(checkId, { status: 2 }); // 2 = Anulado
    const reconcileMutation = useUpdateCheck(checkId, {
        status: 1, 
        paymentDate: new Date().toISOString().split("T")[0],
    });

    if (isLoading) {
        return <Box justifyContent={"center"} alignContent={"center"} height={"full"}>
            <LoadingScreen message="Cargando cheque..." /></Box>;
    }

    if (isError || !check) {
        return (
            <Box p={8}>
                <Text color="red.500">Error al cargar el cheque. Intente nuevamente.</Text>
            </Box>
        );
    }

    const isRejecting = rejectMutation.isPending;
    const isReconciling = reconcileMutation.isPending;
    const isAlreadySettled = check.status !== 0; 

    return (
        <Box display="flex" flexDirection="column" justifyContent="space-between" minHeight="0">
            <Box display="flex" flexDirection="row" gap={4} py={2} justifyContent="space-between">
                <Text fontSize="2xl" fontWeight="bold">
                    Cheque N° {check.number}
                </Text>
                <Box display="flex" gap={4}>
                    <IconButton
                        padding={2}
                        variant="outline"
                        color="brand.primary"
                        onClick={() => navigate("/tesoreria/cheques")}
                    >
                        <ArrowLeft />
                        Volver al listado
                    </IconButton>
                    <IconButton
                        padding={2}
                        variant="outline"
                        disabled={isAlreadySettled || isRejecting || isReconciling}
                        onClick={() => rejectMutation.mutate()}
                    >
                        {isRejecting ? <Spinner size="sm" /> : <BanknoteX />}
                        Rechazar Cheque
                    </IconButton>
                    <IconButton
                        padding={2}
                        bgColor="brand.primary"
                        disabled={isAlreadySettled || isReconciling || isRejecting}
                        onClick={() => reconcileMutation.mutate()}
                    >
                        {isReconciling ? <Spinner size="sm" /> : <ArrowDownUp />}
                        Conciliar
                    </IconButton>
                </Box>
            </Box>

            <Separator my={5} color="gray.900" />

            <Box bg="white" h="full" w="100%">
                <Grid templateColumns="repeat(3, 1fr)" gap={6}>
                    <LabelValue label="Número de Cheque" value={check.number} />
                    <LabelValue label="Fecha de Emisión" value={check.emisionDate} />
                    <LabelValue label="Situación" value={checkStatusEnum[check.status] ?? "-"} />

                    <LabelValue label="Tipo" value={checkTypeEnum[check.type] ?? "-"} />
                    <LabelValue label="Banco Emisor" value={check.issuingBank} />
                    <LabelValue label="Receptor" value={check.receiver} />

                    <LabelValue label="Monto" value={`${check.amount?.toLocaleString("es-PY") || "-"} ₲`} />
                    <LabelValue label="Fecha de Disponibilidad" value={check.availabilityDate} />
                    <LabelValue label="Fecha de Vencimiento" value={check.maturityDate} />

                    {check.paymentDate && (
                        <GridItem colSpan={3}>
                            <LabelValue label="Fecha de Pago" value={check.paymentDate} />
                        </GridItem>
                    )}
                </Grid>
            </Box>
        </Box>
    );
}