
import { Box, Spinner, Text } from "@chakra-ui/react";

interface loadingProps {
    message?: string;
    height?: string;
    minHeight?:string;
}

export const LoadingScreen: React.FC<loadingProps> = ({
    message = "Cargando, por favor espere un momento...",
    height,
    minHeight= "auto"
}) => {

    return (
        <Box minH={minHeight} height={height || "auto"} display="flex" alignItems="center" justifyContent="center">
            <Box padding={5} alignContent="center" textAlign="center">
                <Spinner color="brand.primary" borderWidth="4px" size="lg" />
                <Text mt={4} fontSize="md" fontWeight="semibold" color="gray.600">
                    {message}
                </Text>
            </Box>
        </Box>
    );
}