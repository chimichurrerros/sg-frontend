
import { Button, CloseButton } from "@chakra-ui/react/button";
import { Dialog } from "@chakra-ui/react/dialog";
import { Icon } from "@chakra-ui/react/icon";
import { Portal } from "@chakra-ui/react/portal";
import { Text } from "@chakra-ui/react/text"
import { InfoIcon } from "lucide-react";

interface AlertDialogProps {
    title?: string;
    description: string;
    onAccept?: () => void;
    trigger?: React.ReactNode;
}

/**
 * Alert dialog
 * trigger = the element that will trigger the dialog, if not provided, it will be a button with the text "Open"
 */
export const AlertDialog = ({
    title = "Alerta",
    description,
    onAccept,
    trigger,
}: AlertDialogProps) => {
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
                            <Icon color="yellow.500" boxSize={6}>
                                <InfoIcon />
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
                                    colorScheme="yellow"
                                    colorPalette="yellow"
                                    onClick={onAccept}
                                >
                                    Aceptar
                                </Button>
                            </Dialog.ActionTrigger>
                        </Dialog.Footer>
                        <Dialog.CloseTrigger asChild>
                            <CloseButton 
                                size="sm" 
                                color="gray.500"  
                                _hover={{ color: "gray.700", bg: "gray.100" }}
                            />
                        </Dialog.CloseTrigger>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
};