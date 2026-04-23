import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useAuthStore } from "@/stores/auth.store";
import { Accordion, Flex, IconButton, Checkbox } from "@chakra-ui/react";
import { Box } from "@chakra-ui/react/box";
import { Container } from "@chakra-ui/react/container";
import { Image } from "@chakra-ui/react/image";
import { Text } from "@chakra-ui/react/text";
import { KeyRoundIcon, Pencil, RefreshCcw } from "lucide-react";
import React from "react";

interface AppConfigurations {
    saveSidebarState: boolean;
    lastSidebarState?: boolean;
}
export default function ConfigurationsPage() {
    const isAdmin = useAuthStore((s) => s.isAdmin);
    const { saveLocalStorage, getLocalStorage } = useLocalStorage();

    const [config, setConfig] = React.useState<AppConfigurations>(() => {
        const localStorageConfig = getLocalStorage("appConfig");
        return localStorageConfig || { saveSidebarState: true, lastSidebarState: false };
    });

    function handleResetToDefault() {
        const resetConfig: AppConfigurations = {
            saveSidebarState: true,
            lastSidebarState: false  
        };

        saveLocalStorage("appConfig", resetConfig);
        setConfig(resetConfig);
    }
    return (
        <Container display="flex" flexDirection="column">
            <Box display="grid" gridColumn={2}>
                <Box display="flex" flexDirection="column" alignItems="left">
                    <Box w="full " h="full" display="flex" alignItems="center" justifyContent="space-between" flexDirection="row" gap={10} padding={3} rounded="md">
                        <Box display="flex" flexDirection="row" gap={10} alignItems="center">
                            <Box border="2px solid" bgColor="white" borderColor="gray.300" padding={3} rounded="md">
                                <Image src="/public/favicon.svg" boxSize="150px" />
                            </Box>
                            <Text fontWeight="bold" textStyle="4xl">BIGOTIRES S.A</Text>
                        </Box>

                        <IconButton
                            variant="solid"
                            px={10}
                            mx={5}
                            w="250px"
                            bgColor="brand.primary"
                            disabled={!isAdmin}
                        >
                            <Pencil />   Editar
                        </IconButton>
                    </Box>

                    <Box bg="gray.50" w="full" display="flex" alignItems="center" justifyContent="space-between" flexDirection="row" gap={10} padding={5} rounded="md">
                        <Box flex="1">
                            <Accordion.Root collapsible defaultValue={["info"]}>
                                <Accordion.Item value="info">
                                    <Accordion.ItemTrigger>
                                        <Text fontStyle="3xl" fontWeight="semibold">Tu Información</Text>
                                        <Accordion.ItemIndicator />
                                    </Accordion.ItemTrigger>
                                    <Accordion.ItemContent>
                                        <Accordion.ItemBody>
                                            <Text fontSize="md" color="gray.600">Correo: heberelcrack2005@gmail.com</Text>
                                            <Text fontSize="md" color="gray.600">Último inicio de sesión: 10/12/25 00:00 hs</Text>
                                            <Text fontSize="md" color="gray.600">Expiración de la sesión: 14/12/25 00:00 hs</Text>
                                        </Accordion.ItemBody>
                                    </Accordion.ItemContent>
                                </Accordion.Item>
                            </Accordion.Root>
                        </Box>

                        <IconButton
                            variant="ghost"
                            px={10}
                            mx={5}
                            color="brand.primary"
                        >
                            <KeyRoundIcon /> Cambiar contraseña
                        </IconButton>
                    </Box>
                </Box>
            </Box>

            <Box display="grid" gridColumn={2}>
                <Box p={6} bg="gray.50" borderRadius="md" >
                    <Text fontSize="xl" fontWeight="bold" mb={4}>
                        Preferencias del usuario
                    </Text>

                    <Box
                        border="1px solid"
                        borderColor="gray.200"
                        borderRadius="md"
                        p={4}
                        mb={4}
                        bg="white"
                    >
                        <Checkbox.Root checked={config.saveSidebarState} onCheckedChange={(checked) => {
                            setConfig({ ...config, saveSidebarState: !config.saveSidebarState });
                            saveLocalStorage("appConfig", {
                                ...config,
                                saveSidebarState: checked.checked
                            });
                        }}>

                            <Checkbox.HiddenInput />
                            <Checkbox.Control />
                            <Checkbox.Label>
                                <Text fontWeight="medium">
                                    Recordar el estado del sidebar
                                </Text>
                            </Checkbox.Label>
                        </Checkbox.Root>

                        <Text fontSize="sm" color="gray.500" mt={2}>
                            Recordar si dejaste el sidebar desplegado o no al recargar, cambiar
                            de página o volver a iniciar sesión
                        </Text>
                    </Box>

                    <Flex>
                        <IconButton colorScheme="brand.primary" variant="outline" padding={5} onClick={handleResetToDefault}>
                            <RefreshCcw />
                            Configuración por defecto
                        </IconButton>
                    </Flex>
                </Box>
            </Box>
        </Container>
    );
}