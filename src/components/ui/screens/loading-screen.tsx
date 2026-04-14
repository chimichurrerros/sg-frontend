
import { Box, Spinner, Text, Container } from "@chakra-ui/react";

interface loadingProps {
    message?: string;
}

export const LoadingScreen: React.FC<loadingProps> = ({
    message = "Cargando, por favor espere un momento...",
}) => {

    return (
        <Container minH="80vh"  display="flex" alignItems="center" justifyContent="center">
            <Box padding={5} alignContent="center" textAlign="center">
                <Spinner color="brand.primary" borderWidth="4px" size="lg" />
                <Text mt={4} fontSize="md" fontWeight="semibold" color="gray.600">
                    {message}
                </Text>
            </Box>
        </Container>
    );
}