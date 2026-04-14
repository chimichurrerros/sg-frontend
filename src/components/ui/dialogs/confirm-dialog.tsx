import { Button, CloseButton } from "@chakra-ui/react/button";
import { Dialog } from "@chakra-ui/react/dialog";
import { Portal } from "@chakra-ui/react/portal";
import { Text } from "@chakra-ui/react/text"
import { ArrowRight } from "lucide-react";
import type React from "react";


interface confirmDialogProps {
    title: string;
    description?: string;
    cancelText?: string;
    onCancel?: () => void;
    acceptText?: string;
    onAccept?: () => void;
    trigger?: React.ReactNode
}

export const ConfirmActionDialog = ({
    title,
    description = "Confirmar acción",
    cancelText = "Cancelar",
    acceptText = "Confirmar",
    onAccept,
    onCancel,
    trigger,

}: confirmDialogProps) => {
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
                                    colorScheme="gray"
                                    colorPalette="gray"
                                    onClick={onCancel}
                                >
                                    {cancelText}
                                </Button>
                            </Dialog.ActionTrigger>
                            <Dialog.ActionTrigger asChild>
                                <Button
                                    variant="surface"
                                    colorScheme="blue"
                                    colorPalette="blue"
                                    onClick={onAccept}
                                >
                                    {acceptText}
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

