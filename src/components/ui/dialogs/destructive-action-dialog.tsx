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
                <Dialog.Backdrop />
                <Dialog.Positioner
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                >
                    <Dialog.Content>
                        <Dialog.Header display="flex" alignItems="center" gap={2}>
                            <Icon color="red.500" boxSize={6}>
                                <TriangleAlert />
                            </Icon>
                            <Dialog.Title fontSize="lg" fontWeight="semibold">
                                {title}
                            </Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body pb={4}>
                            <Text fontSize="sm">
                                {description}
                            </Text>
                        </Dialog.Body>
                        <Dialog.Footer>
                            <Dialog.ActionTrigger asChild>
                                <Button
                                    variant="surface"
                                    colorPalette="gray"
                                    onClick={onCancel}
                                >
                                    {cancelText}
                                </Button>
                            </Dialog.ActionTrigger>
                            <Dialog.ActionTrigger asChild>
                                <Button
                                    variant="surface"
                                    colorPalette="red"
                                    onClick={onAccept}
                                >
                                    {acceptText}
                                </Button>
                            </Dialog.ActionTrigger>
                        </Dialog.Footer>
                        <Dialog.CloseTrigger asChild>
                            <CloseButton size="sm" />
                        </Dialog.CloseTrigger>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
};