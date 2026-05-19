
import { Separator, Stack } from "@chakra-ui/react";
import { Box } from "@chakra-ui/react/box";
import { IconButton } from "@chakra-ui/react/button";
import { Grid, GridItem } from "@chakra-ui/react/grid";
import { Text } from "@chakra-ui/react/text";
import { ArrowDownUp, ArrowLeft, BanknoteX } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CheckView() {
    const navigate = useNavigate();
    function LabelValue({ label, value }: { label: string, value: string }) {
        return (
            <Stack >
                <Text fontSize="sm" fontWeight="medium" color="gray.400">
                    {label}
                </Text>
                <Text fontSize="sm" color="gray.800">
                    {value}
                </Text>
            </Stack>
        );
    }
    return (
        <Box display="flex" flexDirection="column" justifyContent="space-between" minHeight="0">
            <Box display="flex" flexDirection="row" gap={4} py={2} justifyContent="space-between">

                <Text fontSize="2xl" fontWeight="bold"> Cheque N° 123456</Text>
                <Separator my={5} color="gray.900" />
                <Box display="flex" gap={4} >
                    <IconButton padding={2} variant="ghost" color="brand.secondary" onClick={() => navigate("/tesoreria/cheques")} >
                        <ArrowLeft />
                        Volver al listado
                    </IconButton>
                    <IconButton padding={2} variant="outline" >
                        <BanknoteX />
                        Rechazar Cheque
                    </IconButton>
                    <IconButton padding={2} bgColor="brand.primary" >
                        <ArrowDownUp />
                        Conciliar
                    </IconButton>
                </Box>
            </Box>
            <Separator my={5} color="gray.900" />

            <Box bg="white" h="full" w="100%">
                <Grid templateColumns="repeat(3, 1fr)" gap={6}>
                    <LabelValue label="Código" value="10210" />
                    <LabelValue label="Fecha de Creación" value="2023-10-01" />
                    <LabelValue label="Situación" value="Pendiente" />

                    <LabelValue label="Cód. Movimiento Bancario" value="BAN001" />
                    <LabelValue label="Tipo de Movimiento" value="Débito" />
                    <LabelValue label="Concepto" value="Cheque ficticio para prueba y visualización" />

                    <GridItem colSpan={3}>
                        <LabelValue label="Fecha de Conciliación" value="2023-10-01" />
                    </GridItem>
                </Grid>

                <Separator my={5} color="gray.900" />

                <Text fontWeight="semibold" fontSize="md" color="gray.700" mb={4}>
                    Cheque Emitido/Recibido
                </Text>

                <Grid templateColumns="repeat(3, 1fr)" gap={6}>
                    <LabelValue label="Número de Cheque" value="123456" />
                    <LabelValue label="Entidad Proveedora/ a Pagar" value="Proveedor de Prueba" />
                </Grid>

            </Box>
        </Box>
    )
}