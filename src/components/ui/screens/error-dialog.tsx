import {
    Button,
    CloseButton,
    Dialog,
    Portal,
    Text,
    Icon,
} from "@chakra-ui/react";
import { ArrowRight, TriangleAlert } from "lucide-react";

interface ErrorDialogProps {
    title?: string;
    description?: string;
    onAccept?: () => void;
    trigger?: React.ReactNode;
}

/**
 * Error dialog
 * trigger = the element that will trigger the dialog, if not provided, it will be a button with the text "Open"
 */
export const ErrorDialog = ({
    title = "Ha ocurrido un error",
    description = "Hubo un problema al procesar tu solicitud. Por favor, intenta nuevamente.",
    onAccept,
    trigger,
}: ErrorDialogProps) => {
    return (
        <Dialog.Root>
            <Dialog.Trigger asChild>
                {trigger || <Button variant="outline">Abrir</Button>}
            </Dialog.Trigger>
            <Portal>
                <Dialog.Backdrop bg="blackAlpha.600" />
                <Dialog.Positioner 
                    display="flex" 
                    alignItems="center" 
                    justifyContent="center"
                >
                    <Dialog.Content 
                        borderRadius="md"
                        boxShadow="lg"
                    >
                        <Dialog.Header display="flex" alignItems="center" gap={2}>
                            <Icon color="red.500" boxSize={6}>
                                <TriangleAlert />
                            </Icon>
                            <Dialog.Title fontSize="lg" fontWeight="semibold" color="gray.800">
                                {title}
                            </Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body pb={4}>
                            <Text color="gray.600" fontSize="sm">
                                {description}
                            </Text>
                        </Dialog.Body>
                        <Dialog.Footer>
                            <Dialog.ActionTrigger asChild>
                                <Button
                                    variant="surface"
                                    colorScheme="red"
                                    color="white"
                                    colorPalette="red"
                                    onClick={onAccept}
                                >
                                    Aceptar
                                    <ArrowRight size={16} style={{ marginLeft: 8 }} />
                                </Button>
                            </Dialog.ActionTrigger>
                        </Dialog.Footer>
                        <Dialog.CloseTrigger asChild>
                            <CloseButton 
                                size="sm" 
                                color="gray.500"  // Color del botón de cierre
                                _hover={{ color: "gray.700", bg: "gray.100" }}
                            />
                        </Dialog.CloseTrigger>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
};