import { Button, CloseButton } from "@chakra-ui/react/button";
import { Dialog } from "@chakra-ui/react/dialog";
import { Icon } from "@chakra-ui/react/icon";
import { Portal } from "@chakra-ui/react/portal";
import { Text } from "@chakra-ui/react/text"
import { TriangleAlert } from "lucide-react";
import type React from "react";


interface destructiveDialogProps {
    title: string;
    description?: string;
    cancelText?: string;
    onCancel?: () => void;
    acceptText?: string;
    onAccept?: () => void;
    trigger?: React.ReactNode
}
/*
* Destructive action dialog
* trigger = the element that will trigger the dialog, if not provided, it will be a button with the text "Open"
* You can inject the onAccept and onCancel functions to handle the actions, if not provided, the buttons will just close the dialog
*/
export const DestructiveActionDialog = ({
    title,
    description = "Confirmar acción destructiva",
    cancelText = "Cancelar",
    acceptText = "Confirmar",
    onAccept,
    onCancel,
    trigger,

}: destructiveDialogProps) => {
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
                                    colorScheme="red"
                                    colorPalette="red"
                                    onClick={onAccept}
                                >
                                    {acceptText}
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

